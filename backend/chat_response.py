import time

from groq import Groq

from config import Config
from vector_store import LocalChromaDb


config = Config()
chromadb_model = LocalChromaDb()

_groq_client = None


def _get_client():
    global _groq_client
    if _groq_client is None and config.GROQ_API_KEY:
        _groq_client = Groq(api_key=config.GROQ_API_KEY)
    return _groq_client


def _call_groq(prompt: str, max_retries: int = 3) -> str | None:
    """Raw Groq call — returns the text or None on failure."""
    client = _get_client()
    if client is None:
        return None
    for attempt in range(max_retries):
        try:
            resp = client.chat.completions.create(
                model=config.GROQ_MODEL,
                messages=[{"role": "user", "content": prompt}],
                temperature=0.2,
                max_tokens=1024,
            )
            return resp.choices[0].message.content
        except Exception as exc:
            wait = 2 ** attempt
            print(f"[groq] Attempt {attempt + 1}/{max_retries} failed: {exc} — retrying in {wait}s")
            if attempt < max_retries - 1:
                time.sleep(wait)
    return None


def generate_install_script(software: str, os_name: str, os_version: str = "") -> dict:
    """
    Ask Groq to generate a real terminal install script.
    Always returns { script, instructions, os_label } — never prose.
    """
    client = _get_client()

    os_label_map = {
        "windows": "Windows (PowerShell / CMD)",
        "macos":   "macOS (Terminal)",
        "linux":   "Linux (Terminal)",
    }
    os_label = os_label_map.get(os_name.lower(), os_name)
    version_hint = f" ({os_version})" if os_version else ""

    if client is None:
        return {
            "script": f"# GROQ_API_KEY not configured.\n# Cannot generate script for {software} on {os_name}.",
            "instructions": "Add GROQ_API_KEY to backend/.env to enable AI-generated scripts.",
            "os": os_label,
        }

    prompt = f"""You are a terminal script generator. Your ONLY job is to output working terminal commands.

Task: Generate an install script for **{software}** on **{os_name}{version_hint}**.

Rules — follow strictly:
1. Output ONLY terminal commands and shell comments (lines starting with #).
2. Do NOT write any prose, explanations, or sentences — only code.
3. Use the correct package manager for the OS:
   - Windows → winget (preferred) or PowerShell commands
   - macOS   → brew (Homebrew)
   - Linux   → apt-get (Ubuntu/Debian) or dnf (Fedora)
4. Include a comment header: # Install {software} on {os_name}{version_hint}
5. End with a verify command (e.g. --version) if available.
6. If the software has no CLI installer, use winget/brew/apt with the correct package ID.

Output the script now, no explanations:"""

    result = _call_groq(prompt)

    if not result:
        return {
            "script": f"# Unable to generate script for {software} on {os_name} right now.\n# Please try again.",
            "instructions": "The AI model could not be reached. Check your GROQ_API_KEY.",
            "os": os_label,
        }

    # Strip any markdown code fences the model might add
    script = result.strip()
    if script.startswith("```"):
        lines = script.split("\n")
        # remove first and last fence lines
        lines = [l for l in lines if not l.strip().startswith("```")]
        script = "\n".join(lines).strip()

    return {
        "script": script,
        "instructions": f"Open a terminal on {os_label} and run the commands below.",
        "os": os_label,
    }


def generate_response_groq(user_input: str, k: int = 3) -> str:
    """General Q&A — used for document queries and general chat fallback."""
    try:
        user_chunk = chromadb_model.response_query(user_input, k=k)
    except Exception as exc:
        print(f"[vector_store] query failed: {exc}")
        user_chunk = []

    context = "\n".join(user_chunk).strip()

    prompt = f"""You are a helpful assistant. Answer the user's question clearly and concisely.

{f"Context from uploaded documents:{chr(10)}{context}{chr(10)}" if context else ""}
Question: {user_input}
"""

    client = _get_client()
    if client is None:
        if context:
            return "**Note:** GROQ_API_KEY is not configured.\n\nRelevant context:\n\n" + context
        return "GROQ_API_KEY is not set. Add it to `backend/.env`.\nGet a free key at https://console.groq.com"

    result = _call_groq(prompt)
    if result:
        return result

    if context:
        return "Unable to reach AI model. Relevant context from your documents:\n\n" + context
    return "Unable to generate a response right now. Please check your GROQ_API_KEY and try again."
