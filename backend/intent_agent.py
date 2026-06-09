"""
Intent detection agent — pure Python port of backend/src/agents/intentAgent.js
"""
import re

SOFTWARE_KEYWORDS = {
    "ubuntu":    ["ubuntu"],
    "wsl":       ["wsl", "windows subsystem for linux", "windows subsystem"],
    "docker":    ["docker", "docker desktop", "container", "containerize"],
    "nodejs":    [r"nodejs", r"node\.js", r"node js", r"\bnode\b", r"\bnpm\b", r"\bnvm\b"],
    "python":    [r"python", r"python3", r"\bpip\b", r"\bpy3\b"],
    "git":       [r"\bgit\b", "git version control", "github cli"],
    "vscode":    ["vscode", "vs code", "visual studio code", "code editor"],
    "chrome":    ["chrome", "google chrome", "chromium"],
    "firefox":   ["firefox", "mozilla firefox"],
    "zoom":      [r"\bzoom\b", "zoom meetings", "zoom video"],
    "vlc":       [r"\bvlc\b", "vlc media player"],
    "7zip":      ["7zip", "7-zip", "7 zip", "seven zip", "sevenzip", "archive manager"],
    "steam":     [r"\bsteam\b", "steam gaming", "valve steam"],
    "capcut":    ["capcut", "cap cut"],
    "obs":       [r"\bobs\b", "obs studio", "open broadcaster"],
    "spotify":   ["spotify"],
    "discord":   ["discord"],
    "notepadpp": ["notepad++", "notepadpp", "notepad plus"],
    "winrar":    ["winrar", "win rar"],
    "java":      [r"\bjava\b", "jdk", "jre", "openjdk"],
    "rust":      [r"\brust\b", "rustlang", "rustup", "cargo"],
    "golang":    [r"\bgolang\b", r"\bgo lang\b", r"\bgo programming\b"],
    "postman":   ["postman"],
    "figma":     ["figma"],
    "slack":     ["slack"],
    "teams":     ["microsoft teams", r"\bteams\b"],
}

OS_KEYWORDS = {
    "windows": ["windows", "win10", "win11", "windows 10", "windows 11", r"\bpowershell\b", r"\bcmd\b"],
    "macos":   ["macos", "mac os", r"\bmac\b", "osx", "os x", "apple", "macbook", "homebrew", r"\bbrew\b"],
    "linux":   ["linux", "ubuntu", "debian", "fedora", "rhel", "centos", "arch", "mint", "kali"],
}

DISTRO_KEYWORDS = {
    "ubuntu": ["ubuntu", "debian", r"\bapt\b", "apt-get"],
    "fedora": ["fedora", "rhel", "centos", r"\bdnf\b", r"\byum\b"],
}

INSTALL_PATTERNS = [
    r"\b(install|download|get|setup|set up|add|obtain)\b",
    r"\bi want\b",
    r"\bi need\b",
    r"\bhow (do i|can i|to)\b.*\b(install|get|download|setup)\b",
    r"\bhow to (install|get|download)\b",
    r"\bsteps to install\b",
]

QUERY_PATTERNS = [
    r"\b(what is|what are|explain|tell me about|describe|summarize|show me|find)\b",
    r"\b(search|look up|query|retrieve)\b",
    r"\bin (the )?(document|file|data|csv|json|upload)\b",
    r"\b(according to|based on)\b",
]


def _matches(text, patterns):
    for p in patterns:
        if re.search(p, text, re.IGNORECASE):
            return True
    return False


def detect_intent(message: str) -> dict:
    text = message.lower()

    # Detect OS — track whether it was explicitly mentioned
    detected_os = None
    os_explicit = False
    for os_name, patterns in OS_KEYWORDS.items():
        if _matches(text, patterns):
            detected_os = os_name
            os_explicit = True
            break
    if not detected_os:
        detected_os = "windows"  # default but NOT explicit

    # Detect distro (Linux only)
    detected_distro = None
    if detected_os == "linux":
        for distro, patterns in DISTRO_KEYWORDS.items():
            if _matches(text, patterns):
                detected_distro = distro
                break
        if not detected_distro:
            detected_distro = "ubuntu"

    # Detect software
    detected_software = None
    for soft, patterns in SOFTWARE_KEYWORDS.items():
        if _matches(text, patterns):
            detected_software = soft
            break

    # Classify intent
    has_install = _matches(text, INSTALL_PATTERNS)
    has_query   = _matches(text, QUERY_PATTERNS)

    if has_install and detected_software:
        intent = "install_software"
    elif detected_software and not has_query:
        intent = "install_software"
    elif has_query:
        intent = "query_knowledge"
    else:
        intent = "general_chat"

    return {
        "intent":      intent,
        "software":    detected_software,
        "os":          detected_os,
        "os_explicit": os_explicit,   # True only when user actually typed an OS name
        "distro":      detected_distro,
    }
