from pathlib import Path
import uuid

from flask import Flask, jsonify, request
from flask_cors import CORS
from werkzeug.utils import secure_filename

from chat_response import generate_response_groq
from config import Config
from intent_agent import detect_intent
from script_templates import (
    get_script,
    get_supported_software,
    get_supported_os,
    get_os_versions,
)
from storage import (
    add_document,
    get_chat_history,
    init_storage,
    list_documents,
    list_sessions,
    save_message,
    get_state,
    set_state,
    clear_state,
)
from vector_store import LocalChromaDb, extract_file_text

# ── App setup ─────────────────────────────────────────────────────────────────
config = Config()
app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": config.CORS_ORIGIN}}, supports_credentials=True)

Path(config.UPLOAD_DIR).mkdir(parents=True, exist_ok=True)
Path(config.PERSIST_DIRECTORY).mkdir(parents=True, exist_ok=True)
init_storage()

vector_store = LocalChromaDb()

# ── Helpers ───────────────────────────────────────────────────────────────────

def _utc_now():
    from datetime import datetime, timezone
    return datetime.now(timezone.utc).isoformat()


def _make_result(response, agent="Script Generator Agent", script=None,
                 os=None, software=None, version=None, quick_replies=None):
    return {
        "response":     response,
        "agentUsed":    agent,
        "script":       script,
        "os":           os,
        "software":     software,
        "version":      version,
        "quickReplies": quick_replies or [],
    }


def _store_uploaded_file(uploaded_file):
    original_name = secure_filename(uploaded_file.filename or "document")
    document_id = str(uuid.uuid4())
    stored_path = Path(config.UPLOAD_DIR) / f"{document_id}_{original_name}"
    uploaded_file.save(stored_path)
    text = extract_file_text(stored_path)
    chunks_created = vector_store.store_text(text, original_name, document_id)
    add_document(
        name=original_name,
        doc_type=stored_path.suffix.lstrip(".").lower() or "file",
        source_path=str(stored_path),
        content=text,
        document_id=document_id,
    )
    return document_id, chunks_created, original_name


# ── Conversation state machine ────────────────────────────────────────────────

OS_ALIASES = {
    "win": "windows", "win10": "windows", "win11": "windows",
    "windows 10": "windows", "windows 11": "windows",
    "mac": "macos", "osx": "macos", "os x": "macos",
    "ventura": "macos", "sonoma": "macos", "sequoia": "macos",
    "ubuntu": "linux", "debian": "linux", "fedora": "linux",
    "ubuntu 20.04": "linux", "ubuntu 22.04": "linux", "ubuntu 24.04": "linux",
    "fedora 39": "linux", "fedora 40": "linux", "debian 12": "linux",
}

DISTRO_FROM_VERSION = {
    "ubuntu 20.04": "ubuntu", "ubuntu 22.04": "ubuntu", "ubuntu 24.04": "ubuntu",
    "debian 12": "ubuntu",
    "fedora 39": "fedora", "fedora 40": "fedora",
}

SOFTWARE_DISPLAY = {
    "ubuntu": "Ubuntu", "wsl": "WSL", "docker": "Docker",
    "nodejs": "Node.js", "python": "Python", "git": "Git",
    "vscode": "VS Code", "chrome": "Chrome", "firefox": "Firefox",
    "zoom": "Zoom", "vlc": "VLC", "7zip": "7-Zip", "steam": "Steam",
}


def _normalize_os(text: str) -> str | None:
    t = text.lower().strip()
    if t in OS_ALIASES:
        return OS_ALIASES[t]
    for key, val in OS_ALIASES.items():
        if key in t:
            return val
    if "window" in t:
        return "windows"
    if "mac" in t or "osx" in t or "apple" in t:
        return "macos"
    if "linux" in t or "ubuntu" in t or "fedora" in t or "debian" in t:
        return "linux"
    return None


def _generate_script_response(software: str, os_name: str, os_version: str) -> dict:
    """Build the final script response once all three fields are collected."""
    distro = DISTRO_FROM_VERSION.get(os_version.lower(), "") if os_version else ""
    script_data = get_script(software, os_name, distro)
    soft_label = SOFTWARE_DISPLAY.get(software, software.capitalize())

    if not script_data:
        return _make_result(
            f"Sorry, I don't have an install script for **{soft_label}** on **{os_name}** yet.\n\n"
            f"Available software: {', '.join(get_supported_software())}.",
            software=software, os=os_name,
        )

    os_label = script_data["os"]
    version_line = f"**OS Version:** {os_version}\n\n" if os_version else ""

    response = "\n".join([
        f"## Installing **{soft_label}** on {os_label}",
        "",
        version_line + f"### Instructions",
        script_data["instructions"],
        "",
        'Click **"View Install Script"** below to copy the terminal commands.',
    ])

    return _make_result(
        response,
        script=script_data["script"],
        os=os_label,
        software=software,
        version=os_version or None,
    )


def _step_ask_software(session_id: str) -> dict:
    supported = get_supported_software()
    set_state(session_id, step="awaiting_software")
    return _make_result(
        "Sure! Which software would you like to install?\n\n"
        f"I support: **{', '.join(SOFTWARE_DISPLAY.get(s, s.capitalize()) for s in supported)}**",
        quick_replies=[SOFTWARE_DISPLAY.get(s, s.capitalize()) for s in supported],
    )


def _step_ask_os(session_id: str, software: str) -> dict:
    soft_label = SOFTWARE_DISPLAY.get(software, software.capitalize())
    os_list = get_supported_os()
    set_state(session_id, step="awaiting_os", software=software)
    return _make_result(
        f"Great choice! Which operating system are you using to install **{soft_label}**?",
        software=software,
        quick_replies=os_list,
    )


def _step_ask_version(session_id: str, software: str, os_name: str) -> dict:
    soft_label = SOFTWARE_DISPLAY.get(software, software.capitalize())
    versions = get_os_versions(os_name)
    set_state(session_id, step="awaiting_version", software=software, os=os_name)

    if not versions:
        # No version distinction needed — generate immediately
        clear_state(session_id)
        return _generate_script_response(software, os_name, "")

    return _make_result(
        f"Almost there! Which version of **{os_name.capitalize()}** are you running?",
        software=software,
        os=os_name,
        quick_replies=versions,
    )


def _handle_state_machine(message: str, session_id: str, state: dict) -> dict | None:
    """
    If a conversation is in progress (step != idle), handle the next input.
    Returns a result dict or None if no active state.
    """
    step = state.get("step", "idle")

    # ── Step: waiting for software name ──────────────────────────────────────
    if step == "awaiting_software":
        msg_lower = message.lower().strip()
        # Try to match against known software
        matched = None
        for key, patterns in {
            "ubuntu": ["ubuntu"],
            "wsl": ["wsl"],
            "docker": ["docker"],
            "nodejs": ["node", "nodejs", "node.js", "npm"],
            "python": ["python"],
            "git": ["git"],
            "vscode": ["vscode", "vs code", "visual studio code"],
            "chrome": ["chrome"],
            "firefox": ["firefox"],
            "zoom": ["zoom"],
            "vlc": ["vlc"],
            "7zip": ["7zip", "7-zip"],
            "steam": ["steam"],
        }.items():
            if any(p in msg_lower for p in patterns):
                matched = key
                break

        if not matched:
            supported = get_supported_software()
            return _make_result(
                f"I didn't recognise that software. Please choose from:\n\n"
                f"**{', '.join(SOFTWARE_DISPLAY.get(s, s.capitalize()) for s in supported)}**",
                quick_replies=[SOFTWARE_DISPLAY.get(s, s.capitalize()) for s in supported],
            )
        return _step_ask_os(session_id, matched)

    # ── Step: waiting for OS ──────────────────────────────────────────────────
    if step == "awaiting_os":
        software = state.get("software")
        detected_os = _normalize_os(message)

        if not detected_os:
            return _make_result(
                "Please choose your operating system:",
                software=software,
                quick_replies=get_supported_os(),
            )
        return _step_ask_version(session_id, software, detected_os)

    # ── Step: waiting for OS version ──────────────────────────────────────────
    if step == "awaiting_version":
        software   = state.get("software")
        os_name    = state.get("os")
        os_version = message.strip()
        clear_state(session_id)
        return _generate_script_response(software, os_name, os_version)

    return None  # No active state


# ── Knowledge / general handlers ──────────────────────────────────────────────

def _handle_query_knowledge(message: str) -> dict:
    try:
        chunks = vector_store.response_query(message, k=config.TOP_K)
    except Exception as exc:
        return _make_result(
            f"I tried to search your documents but encountered an error: {exc}",
            agent="Knowledge Query Agent",
        )
    if not chunks:
        return _make_result(
            f"I searched your uploaded documents but couldn't find relevant information for: "
            f"**\"{message}\"**.\n\nTry uploading a file first, then ask your question.",
            agent="Knowledge Query Agent",
        )
    response_text = generate_response_groq(message, k=config.TOP_K)
    return _make_result(response_text, agent="Knowledge Query Agent")


def _handle_general_chat(message: str) -> dict:
    lower = message.lower()
    if any(w in lower for w in ("hello", "hi ", " hi", "hey")):
        resp = (
            "👋 Hello! I'm your **AI Install Agent**. I can help you with:\n\n"
            "- 🖥️ **Install scripts** — tell me what software you need, your OS and version\n"
            "- 📄 **Document Q&A** — upload a CSV or JSON and ask questions\n"
            "- 💬 **General help** — ask me anything!\n\n"
            "What would you like to install today?"
        )
        return _make_result(resp, agent="General Chat Agent",
                            quick_replies=["Install software", "Help", "What can you do?"])
    if any(w in lower for w in ("help", "what can you do")):
        resp = (
            "## What I Can Do\n\n"
            "**1. Generate Install Scripts**\n"
            "I'll ask you 3 quick questions — software, OS, and version — then give you the exact commands.\n\n"
            "**Supported:** Ubuntu/WSL, Docker, Node.js, Python, Git, VSCode, Chrome, Firefox, Zoom, VLC, 7-Zip, Steam\n\n"
            "**2. Answer Questions from Your Documents**\n"
            "Upload a CSV or JSON file using the sidebar, then ask anything about it.\n\n"
            "**Try saying:** \"Install Docker\" or \"I need Python\""
        )
        return _make_result(resp, agent="General Chat Agent",
                            quick_replies=["Install Docker", "Install Python", "Install Node.js"])
    if "thank" in lower:
        return _make_result("You're welcome! 😊 Let me know if there's anything else.", agent="General Chat Agent")
    if any(w in lower for w in ("bye", "goodbye")):
        return _make_result("Goodbye! Come back anytime. 👋", agent="General Chat Agent")

    # Fall back to Groq
    return _make_result(generate_response_groq(message, k=0), agent="General Chat Agent")


# ── Main message processor ────────────────────────────────────────────────────

def process_message(message: str, session_id: str) -> dict:
    if not message.strip():
        return _make_result("Please type a message and I'll be happy to help!", agent="General Chat Agent")

    # 1. Check if we're mid-conversation (state machine takes priority)
    state = get_state(session_id)
    state_result = _handle_state_machine(message, session_id, state)
    if state_result is not None:
        return state_result

    # 2. Detect intent from scratch
    intent = detect_intent(message)
    print(f"[intent] {intent['intent']} | sw={intent['software']} os={intent['os']}")

    if intent["intent"] == "install_software":
        software    = intent.get("software")
        os_name     = intent.get("os")
        os_explicit = intent.get("os_explicit", False)
        distro      = intent.get("distro") or ""

        # Only skip wizard if user explicitly provided both software AND OS
        if software and os_explicit:
            clear_state(session_id)
            return _generate_script_response(software, os_name, distro)

        # Software known but OS not explicit → ask for OS
        if software:
            return _step_ask_os(session_id, software)

        # Nothing detected → start the wizard
        return _step_ask_software(session_id)

    if intent["intent"] == "query_knowledge":
        return _handle_query_knowledge(message)

    # Check if user is just saying they want to install something without naming it
    lower = message.lower()
    if any(w in lower for w in ("install", "setup", "download", "i want", "i need", "get me")):
        return _step_ask_software(session_id)

    return _handle_general_chat(message)


# ── Routes ────────────────────────────────────────────────────────────────────

@app.route("/api/health", methods=["GET"])
def health_check():
    return jsonify({"status": "ok", "timestamp": _utc_now()})


@app.route("/api/chat", methods=["POST"])
def chat():
    payload    = request.get_json(force=True, silent=True) or {}
    message    = (payload.get("message") or "").strip()
    session_id = payload.get("sessionId") or str(uuid.uuid4())

    if not message:
        return jsonify({"success": False, "message": "message is required"}), 400

    save_message(session_id, "user", message)

    try:
        result = process_message(message, session_id)
    except Exception as exc:
        import traceback
        traceback.print_exc()
        return jsonify({"success": False, "message": f"Agent error: {exc}"}), 500

    save_message(session_id, "assistant", result["response"], agent_used=result.get("agentUsed"))

    return jsonify({
        "success":      True,
        "response":     result["response"],
        "agentUsed":    result.get("agentUsed"),
        "script":       result.get("script"),
        "sessionId":    session_id,
        "software":     result.get("software"),
        "os":           result.get("os"),
        "version":      result.get("version"),
        "quickReplies": result.get("quickReplies", []),
    })


@app.route("/api/chat/history/<session_id>", methods=["GET"])
def chat_history(session_id):
    return jsonify({"success": True, "sessionId": session_id, "history": get_chat_history(session_id)})


@app.route("/api/chat/sessions", methods=["GET"])
def chat_sessions():
    return jsonify({"success": True, "sessions": list_sessions()})


@app.route("/api/upload", methods=["POST"])
def upload_file():
    uploaded_file = request.files.get("file")
    if not uploaded_file or not uploaded_file.filename:
        return jsonify({"success": False, "message": "A file is required."}), 400
    try:
        document_id, chunks_created, original_name = _store_uploaded_file(uploaded_file)
        return jsonify({
            "success": True, "documentId": document_id,
            "chunksCreated": chunks_created,
            "message": f'Ingested "{original_name}" — {chunks_created} chunks stored.',
        })
    except Exception as exc:
        return jsonify({"success": False, "message": str(exc)}), 400


@app.route("/api/upload/text", methods=["POST"])
def upload_text():
    payload = request.get_json(force=True, silent=True) or {}
    text = (payload.get("text") or "").strip()
    name = (payload.get("name") or "text-snippet").strip()
    if not text:
        return jsonify({"success": False, "message": "text is required"}), 400
    try:
        document_id = add_document(name=name, doc_type="text", content=text)
        chunks_created = vector_store.store_text(text, name, document_id)
        return jsonify({
            "success": True, "documentId": document_id,
            "chunksCreated": chunks_created,
            "message": f'Ingested "{name}" — {chunks_created} chunks stored.',
        })
    except Exception as exc:
        return jsonify({"success": False, "message": str(exc)}), 400


@app.route("/api/documents", methods=["GET"])
def documents():
    return jsonify({"success": True, "documents": list_documents()})


@app.route("/", methods=["GET"])
def root():
    return jsonify({"status": "running"})


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=config.PORT, debug=False, use_reloader=False)
