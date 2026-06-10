"""
Install script templates — Python port of backend/src/utils/scriptTemplates.js
"""

SUPPORTED_SOFTWARE = [
    "ubuntu", "wsl", "docker", "nodejs", "python", "git",
    "vscode", "chrome", "firefox", "zoom", "vlc", "7zip", "steam",
    "capcut", "obs", "spotify", "discord", "notepadpp", "winrar",
    "java", "rust", "golang", "postman", "figma", "slack", "teams",
]

# ── Windows ───────────────────────────────────────────────────────────────────
WINDOWS = {
    "ubuntu": {
        "script": """\
# Enable WSL and install Ubuntu on Windows 11/10
# Run PowerShell as Administrator

# Step 1: Enable WSL feature
dism.exe /online /enable-feature /featurename:Microsoft-Windows-Subsystem-Linux /all /norestart

# Step 2: Enable Virtual Machine Platform
dism.exe /online /enable-feature /featurename:VirtualMachinePlatform /all /norestart

# Step 3: Set WSL 2 as default
wsl --set-default-version 2

# Step 4: Install Ubuntu via winget
winget install --id Canonical.Ubuntu.2404 --source winget --accept-package-agreements --accept-source-agreements

# Step 5: After reboot, launch Ubuntu from Start Menu and create a UNIX user""",
        "instructions": "Open PowerShell as Administrator, paste these commands, and restart your PC when prompted.",
    },
    "wsl": {
        "script": """\
# Install WSL 2 on Windows 10/11
# Run PowerShell as Administrator

wsl --install

# OR install a specific distro
wsl --install -d Ubuntu-24.04

# List available distros
wsl --list --online""",
        "instructions": "Open PowerShell as Administrator and run these commands. A restart is required.",
    },
    "docker": {
        "script": """\
# Install Docker Desktop on Windows
winget install --id Docker.DockerDesktop --source winget --accept-package-agreements --accept-source-agreements

# Verify installation (after restart)
docker --version
docker run hello-world""",
        "instructions": "Run in PowerShell. Docker Desktop will install and add docker to your PATH automatically.",
    },
    "nodejs": {
        "script": """\
# Install Node.js LTS on Windows via winget
winget install --id OpenJS.NodeJS.LTS --source winget --accept-package-agreements --accept-source-agreements

# OR use nvm-windows (recommended)
winget install --id CoreyButler.NVMforWindows --source winget --accept-package-agreements --accept-source-agreements

# After nvm-windows installs, open a NEW terminal and run:
nvm install lts
nvm use lts

# Verify
node --version
npm --version""",
        "instructions": "Run in PowerShell or CMD. Open a new terminal after installation to use node and npm.",
    },
    "python": {
        "script": """\
# Install Python on Windows via winget
winget install --id Python.Python.3.12 --source winget --accept-package-agreements --accept-source-agreements

# Verify (open a new terminal)
python --version
pip --version

# Upgrade pip
python -m pip install --upgrade pip""",
        "instructions": "Run in PowerShell. Make sure to check 'Add Python to PATH' if using the GUI installer.",
    },
    "git": {
        "script": """\
# Install Git on Windows via winget
winget install --id Git.Git --source winget --accept-package-agreements --accept-source-agreements

# Verify (open a new terminal)
git --version

# Initial configuration
git config --global user.name "Your Name"
git config --global user.email "you@example.com"
git config --global core.autocrlf true""",
        "instructions": "Run in PowerShell. After installation, open a new terminal to use git.",
    },
    "vscode": {
        "script": """\
# Install Visual Studio Code on Windows via winget
winget install --id Microsoft.VisualStudioCode --source winget --accept-package-agreements --accept-source-agreements

# Verify
code --version""",
        "instructions": "Run in PowerShell. VSCode will be added to PATH so you can open it with 'code .' in any folder.",
    },
    "chrome":  {"script": "winget install --id Google.Chrome --source winget --accept-package-agreements --accept-source-agreements", "instructions": "Run in PowerShell."},
    "firefox": {"script": "winget install --id Mozilla.Firefox --source winget --accept-package-agreements --accept-source-agreements", "instructions": "Run in PowerShell."},
    "zoom":    {"script": "winget install --id Zoom.Zoom --source winget --accept-package-agreements --accept-source-agreements", "instructions": "Run in PowerShell."},
    "vlc":     {"script": "winget install --id VideoLAN.VLC --source winget --accept-package-agreements --accept-source-agreements", "instructions": "Run in PowerShell."},
    "7zip":    {"script": "winget install --id 7zip.7zip --source winget --accept-package-agreements --accept-source-agreements", "instructions": "Run in PowerShell."},
    "steam":   {"script": "winget install --id Valve.Steam --source winget --accept-package-agreements --accept-source-agreements", "instructions": "Run in PowerShell."},
    "capcut":  {"script": "# Install CapCut on Windows\n# Open Microsoft Store listing:\nstart ms-windows-store://pdp/?ProductId=9PNFCL254S9M\n\n# OR via winget (if available)\n# winget install --id ByteDance.CapCut --source winget --accept-package-agreements --accept-source-agreements", "instructions": "Run in PowerShell. The Microsoft Store page will open for a one-click install."},
    "obs":     {"script": "winget install --id OBSProject.OBSStudio --source winget --accept-package-agreements --accept-source-agreements", "instructions": "Run in PowerShell."},
    "spotify": {"script": "winget install --id Spotify.Spotify --source winget --accept-package-agreements --accept-source-agreements", "instructions": "Run in PowerShell."},
    "discord": {"script": "winget install --id Discord.Discord --source winget --accept-package-agreements --accept-source-agreements", "instructions": "Run in PowerShell."},
    "notepadpp": {"script": "winget install --id Notepad++.Notepad++ --source winget --accept-package-agreements --accept-source-agreements", "instructions": "Run in PowerShell."},
    "winrar":  {"script": "winget install --id RARLab.WinRAR --source winget --accept-package-agreements --accept-source-agreements", "instructions": "Run in PowerShell."},
    "java":    {"script": "# Install Java 21 LTS (Eclipse Temurin)\nwinget install --id EclipseAdoptium.Temurin.21.JDK --source winget --accept-package-agreements --accept-source-agreements\n\n# Verify (open a new terminal)\njava -version\njavac -version", "instructions": "Run in PowerShell. Open a new terminal after install."},
    "rust":    {"script": "# Install Rust via rustup\nInvoke-WebRequest -Uri https://win.rustup.rs -OutFile rustup-init.exe\n.\\rustup-init.exe -y\n\n# Reload PATH\n$env:PATH += \";$env:USERPROFILE\\.cargo\\bin\"\n\n# Verify\nrustc --version\ncargo --version", "instructions": "Run in PowerShell. Restart your terminal after install."},
    "golang":  {"script": "winget install --id GoLang.Go --source winget --accept-package-agreements --accept-source-agreements\n\n# Verify (open new terminal)\ngo version", "instructions": "Run in PowerShell. Open a new terminal after install."},
    "postman": {"script": "winget install --id Postman.Postman --source winget --accept-package-agreements --accept-source-agreements", "instructions": "Run in PowerShell."},
    "figma":   {"script": "winget install --id Figma.Figma --source winget --accept-package-agreements --accept-source-agreements", "instructions": "Run in PowerShell."},
    "slack":   {"script": "winget install --id SlackTechnologies.Slack --source winget --accept-package-agreements --accept-source-agreements", "instructions": "Run in PowerShell."},
    "teams":   {"script": "winget install --id Microsoft.Teams --source winget --accept-package-agreements --accept-source-agreements", "instructions": "Run in PowerShell."},
}
MACOS = {
    "ubuntu": {
        "script": """\
# Run Ubuntu on macOS using multipass
brew install --cask multipass
multipass launch 24.04 --name ubuntu-vm --cpus 2 --memory 2G --disk 20G
multipass shell ubuntu-vm""",
        "instructions": "Open Terminal. Homebrew must be installed first.",
    },
    "wsl": {
        "script": """\
# WSL is Windows-only. Use multipass or Docker on macOS.
brew install --cask multipass
multipass launch 24.04 --name my-ubuntu
# OR
brew install --cask docker
docker run -it ubuntu:24.04 /bin/bash""",
        "instructions": "WSL is Windows-only. These are the macOS equivalents for running Linux.",
    },
    "docker": {
        "script": """\
brew install --cask docker

# Launch Docker Desktop from Applications, then verify:
docker --version
docker run hello-world""",
        "instructions": "Open Terminal. Homebrew must be installed first.",
    },
    "nodejs": {
        "script": """\
# Install Node.js LTS via Homebrew
brew install node@20
echo 'export PATH="/opt/homebrew/opt/node@20/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc

# Verify
node --version
npm --version""",
        "instructions": "Open Terminal. After running, open a new terminal window to use node and npm.",
    },
    "python": {
        "script": """\
brew install python@3.12
echo 'export PATH="/opt/homebrew/opt/python@3.12/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc

python3 --version
pip3 --version""",
        "instructions": "Open Terminal. Use python3 and pip3 on macOS.",
    },
    "git":     {"script": 'brew install git\ngit --version\ngit config --global user.name "Your Name"\ngit config --global user.email "you@example.com"', "instructions": "Open Terminal."},
    "vscode":  {"script": "brew install --cask visual-studio-code\ncode --version", "instructions": "Open Terminal."},
    "chrome":  {"script": "brew install --cask google-chrome", "instructions": "Open Terminal."},
    "firefox": {"script": "brew install --cask firefox", "instructions": "Open Terminal."},
    "zoom":    {"script": "brew install --cask zoom", "instructions": "Open Terminal."},
    "vlc":     {"script": "brew install --cask vlc", "instructions": "Open Terminal."},
    "7zip":    {"script": "brew install p7zip\n# Use: 7z x archive.7z", "instructions": "Open Terminal."},
    "steam":   {"script": "brew install --cask steam", "instructions": "Open Terminal."},
    "capcut":  {"script": "# CapCut is not available via Homebrew.\n# Download directly from:\n# https://www.capcut.com/\n# Or install via the Mac App Store:\nopen 'https://apps.apple.com/app/capcut-video-editor/id1500855883'", "instructions": "Open Terminal. The App Store page will open for a one-click install."},
    "obs":     {"script": "brew install --cask obs", "instructions": "Open Terminal."},
    "spotify": {"script": "brew install --cask spotify", "instructions": "Open Terminal."},
    "discord": {"script": "brew install --cask discord", "instructions": "Open Terminal."},
    "notepadpp": {"script": "# Notepad++ is Windows-only.\n# Use VSCode on macOS instead:\nbrew install --cask visual-studio-code", "instructions": "Open Terminal. Notepad++ is Windows-only; VSCode is the recommended alternative."},
    "java":    {"script": "brew install --cask temurin@21\n\n# Verify\njava -version\njavac -version", "instructions": "Open Terminal. Homebrew must be installed first."},
    "rust":    {"script": "curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y\nsource $HOME/.cargo/env\n\nrustc --version\ncargo --version", "instructions": "Open Terminal."},
    "golang":  {"script": "brew install go\n\ngo version", "instructions": "Open Terminal."},
    "postman": {"script": "brew install --cask postman", "instructions": "Open Terminal."},
    "figma":   {"script": "brew install --cask figma", "instructions": "Open Terminal."},
    "slack":   {"script": "brew install --cask slack", "instructions": "Open Terminal."},
    "teams":   {"script": "brew install --cask microsoft-teams", "instructions": "Open Terminal."},
    "winrar":  {"script": "# WinRAR is Windows-only. Use The Unarchiver on macOS:\nbrew install --cask the-unarchiver", "instructions": "Open Terminal. The Unarchiver handles all archive formats on macOS."},
}

# ── Linux Ubuntu/Debian ───────────────────────────────────────────────────────
UBUNTU = {
    "ubuntu": {
        "script": """\
# You are already on Ubuntu/Debian. Check your version:
lsb_release -a

# To upgrade:
sudo apt-get update && sudo apt-get upgrade -y
sudo do-release-upgrade""",
        "instructions": "Open a terminal. You are already on Ubuntu/Debian.",
    },
    "wsl": {
        "script": """\
# WSL is Windows-only. You are already running Linux!
# Use LXD containers for isolation:
sudo snap install lxd
lxd init --minimal
lxc launch ubuntu:24.04 my-ubuntu
lxc shell my-ubuntu""",
        "instructions": "WSL is Windows-only. LXD is the Linux-native equivalent.",
    },
    "docker": {
        "script": """\
sudo apt-get update
sudo apt-get install -y ca-certificates curl gnupg lsb-release

sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
sudo chmod a+r /etc/apt/keyrings/docker.gpg

echo \\
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \\
  $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \\
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

sudo apt-get update
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

sudo usermod -aG docker $USER
newgrp docker

docker --version
docker run hello-world""",
        "instructions": "Open a terminal. Log out and back in after running for group changes to take effect.",
    },
    "nodejs": {
        "script": """\
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

node --version
npm --version""",
        "instructions": "Open a terminal.",
    },
    "python": {
        "script": """\
sudo apt-get update
sudo apt-get install -y software-properties-common
sudo add-apt-repository -y ppa:deadsnakes/ppa
sudo apt-get update
sudo apt-get install -y python3.12 python3.12-venv python3.12-dev

curl -sS https://bootstrap.pypa.io/get-pip.py | python3.12

python3 --version
pip3 --version""",
        "instructions": "Open a terminal. The deadsnakes PPA provides the latest Python for Ubuntu.",
    },
    "git":     {"script": "sudo add-apt-repository -y ppa:git-core/ppa\nsudo apt-get update\nsudo apt-get install -y git\ngit --version", "instructions": "Open a terminal."},
    "vscode":  {"script": 'sudo apt-get update\nsudo apt-get install -y wget gpg\nwget -qO- https://packages.microsoft.com/keys/microsoft.asc | gpg --dearmor > packages.microsoft.gpg\nsudo install -D -o root -g root -m 644 packages.microsoft.gpg /etc/apt/keyrings/packages.microsoft.gpg\necho "deb [arch=amd64,arm64,armhf signed-by=/etc/apt/keyrings/packages.microsoft.gpg] https://packages.microsoft.com/repos/code stable main" | sudo tee /etc/apt/sources.list.d/vscode.list > /dev/null\nsudo apt-get update\nsudo apt-get install -y code', "instructions": "Open a terminal."},
    "chrome":  {"script": "wget -q -O /tmp/google-chrome.deb https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb\nsudo apt-get install -y /tmp/google-chrome.deb\nrm /tmp/google-chrome.deb", "instructions": "Open a terminal."},
    "firefox": {"script": "sudo add-apt-repository -y ppa:mozillateam/ppa\nsudo apt-get update\nsudo apt-get install -y firefox", "instructions": "Open a terminal."},
    "zoom":    {"script": "wget -q -O /tmp/zoom.deb https://zoom.us/client/latest/zoom_amd64.deb\nsudo apt-get install -y /tmp/zoom.deb\nrm /tmp/zoom.deb", "instructions": "Open a terminal."},
    "vlc":     {"script": "sudo apt-get update\nsudo apt-get install -y vlc", "instructions": "Open a terminal."},
    "7zip":    {"script": "sudo apt-get update\nsudo apt-get install -y 7zip\n# Use: 7zz x archive.7z", "instructions": "Open a terminal."},
    "steam":   {"script": "sudo dpkg --add-architecture i386\nsudo apt-get update\nsudo apt-get install -y steam-installer", "instructions": "Open a terminal."},
    "capcut":  {"script": "# CapCut does not have a native Linux package.\n# Run via a browser at https://www.capcut.com/\n# Or use Wine to run the Windows version:\nsudo apt-get update\nsudo apt-get install -y wine winetricks\nwinetricks --self-update", "instructions": "Open a terminal. CapCut can be run via Wine or in a browser."},
    "obs":     {"script": "sudo add-apt-repository -y ppa:obsproject/obs-studio\nsudo apt-get update\nsudo apt-get install -y obs-studio\nobs --version", "instructions": "Open a terminal."},
    "spotify": {"script": "curl -sS https://download.spotify.com/debian/pubkey_C85668DF69375001.gpg | sudo gpg --dearmor --yes -o /etc/apt/trusted.gpg.d/spotify.gpg\necho \"deb http://repository.spotify.com stable non-free\" | sudo tee /etc/apt/sources.list.d/spotify.list\nsudo apt-get update\nsudo apt-get install -y spotify-client", "instructions": "Open a terminal."},
    "discord": {"script": "wget -q -O /tmp/discord.deb 'https://discord.com/api/download?platform=linux&format=deb'\nsudo apt-get install -y /tmp/discord.deb\nrm /tmp/discord.deb", "instructions": "Open a terminal."},
    "notepadpp": {"script": "# Notepad++ is Windows-only.\n# Use VSCode or gedit on Linux:\nsudo apt-get update\nsudo apt-get install -y gedit\n# OR install VSCode (recommended):\nwget -qO- https://packages.microsoft.com/keys/microsoft.asc | gpg --dearmor > packages.microsoft.gpg\nsudo install -D -o root -g root -m 644 packages.microsoft.gpg /etc/apt/keyrings/packages.microsoft.gpg\necho \"deb [arch=amd64 signed-by=/etc/apt/keyrings/packages.microsoft.gpg] https://packages.microsoft.com/repos/code stable main\" | sudo tee /etc/apt/sources.list.d/vscode.list\nsudo apt-get update && sudo apt-get install -y code", "instructions": "Open a terminal. Notepad++ is Windows-only; VSCode or gedit are recommended alternatives."},
    "winrar":  {"script": "# WinRAR is Windows-only.\n# Use p7zip or unrar on Linux:\nsudo apt-get update\nsudo apt-get install -y p7zip-full unrar\n# Usage: 7z x archive.7z  or  unrar x archive.rar", "instructions": "Open a terminal."},
    "java":    {"script": "sudo apt-get update\nsudo apt-get install -y openjdk-21-jdk\n\n# Verify\njava -version\njavac -version", "instructions": "Open a terminal."},
    "rust":    {"script": "curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y\nsource $HOME/.cargo/env\n\nrustc --version\ncargo --version", "instructions": "Open a terminal."},
    "golang":  {"script": "sudo apt-get update\nsudo apt-get install -y golang-go\n\ngo version", "instructions": "Open a terminal."},
    "postman": {"script": "# Install Postman via Snap\nsudo snap install postman", "instructions": "Open a terminal. Snap must be installed."},
    "figma":   {"script": "# Figma is browser-based on Linux.\n# Open: https://www.figma.com\n# Or install the unofficial desktop app:\nsudo snap install figma-linux", "instructions": "Open a terminal. Snap must be installed."},
    "slack":   {"script": "sudo snap install slack", "instructions": "Open a terminal. Snap must be installed."},
    "teams":   {"script": "sudo snap install teams-for-linux", "instructions": "Open a terminal. Snap must be installed."},
}

# ── Linux Fedora/RHEL ─────────────────────────────────────────────────────────
FEDORA = {
    "ubuntu": {
        "script": """\
# Run Ubuntu on Fedora using toolbox
toolbox create --image ubuntu:24.04 ubuntu-box
toolbox enter ubuntu-box""",
        "instructions": "Open a terminal. Toolbox is built into Fedora Workstation.",
    },
    "wsl": {"script": "# WSL is Windows-only.\ntoolbox create my-toolbox\ntoolbox enter my-toolbox", "instructions": "WSL is Windows-only. Toolbox is the Fedora equivalent."},
    "docker": {
        "script": """\
sudo dnf -y install dnf-plugins-core
sudo dnf config-manager --add-repo https://download.docker.com/linux/fedora/docker-ce.repo
sudo dnf install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
sudo systemctl start docker
sudo systemctl enable docker
sudo usermod -aG docker $USER
newgrp docker
docker --version""",
        "instructions": "Open a terminal. Log out and back in after running.",
    },
    "nodejs": {"script": "curl -fsSL https://rpm.nodesource.com/setup_20.x | sudo bash -\nsudo dnf install -y nodejs\nnode --version\nnpm --version", "instructions": "Open a terminal."},
    "python":  {"script": "sudo dnf install -y python3.12 python3.12-pip python3.12-devel\npython3 --version", "instructions": "Open a terminal."},
    "git":     {"script": "sudo dnf install -y git\ngit --version", "instructions": "Open a terminal."},
    "vscode":  {"script": "sudo rpm --import https://packages.microsoft.com/keys/microsoft.asc\nsudo tee /etc/yum.repos.d/vscode.repo <<'EOF'\n[code]\nname=Visual Studio Code\nbaseurl=https://packages.microsoft.com/yumrepos/vscode\nenabled=1\ngpgcheck=1\ngpgkey=https://packages.microsoft.com/keys/microsoft.asc\nEOF\nsudo dnf install -y code", "instructions": "Open a terminal."},
    "chrome":  {"script": "sudo dnf install -y fedora-workstation-repositories\nsudo dnf config-manager --set-enabled google-chrome\nsudo dnf install -y google-chrome-stable", "instructions": "Open a terminal."},
    "firefox": {"script": "sudo dnf install -y firefox", "instructions": "Open a terminal. Firefox is usually pre-installed on Fedora."},
    "zoom":    {"script": "wget -q -O /tmp/zoom.rpm https://zoom.us/client/latest/zoom_x86_64.rpm\nsudo dnf install -y /tmp/zoom.rpm\nrm /tmp/zoom.rpm", "instructions": "Open a terminal."},
    "vlc":     {"script": "sudo dnf install -y https://download1.rpmfusion.org/free/fedora/rpmfusion-free-release-$(rpm -E %fedora).noarch.rpm\nsudo dnf install -y vlc", "instructions": "Open a terminal. RPM Fusion is required."},
    "7zip":    {"script": "sudo dnf install -y 7zip\n# Use: 7zz x archive.7z", "instructions": "Open a terminal."},
    "steam":   {"script": "sudo dnf install -y https://download1.rpmfusion.org/free/fedora/rpmfusion-free-release-$(rpm -E %fedora).noarch.rpm\nsudo dnf install -y https://download1.rpmfusion.org/nonfree/fedora/rpmfusion-nonfree-release-$(rpm -E %fedora).noarch.rpm\nsudo dnf install -y steam", "instructions": "Open a terminal. RPM Fusion is required."},
}

_ALIASES = {
    "node": "nodejs", "node.js": "nodejs", "vs code": "vscode",
    "visual studio code": "vscode", "7-zip": "7zip", "sevenzip": "7zip", "wsl2": "wsl",
}

_OS_LABELS = {
    "windows": "Windows (PowerShell / CMD)",
    "macos":   "macOS (Terminal)",
    "linux-ubuntu": "Linux (Ubuntu/Debian - Terminal)",
    "linux-fedora": "Linux (Fedora/RHEL - Terminal)",
}


def get_script(software: str, os_name: str = "windows", distro: str = "") -> dict | None:
    key = _ALIASES.get(software.lower().strip(), software.lower().strip())
    os_key = os_name.lower().strip()
    distro_key = (distro or "").lower().strip()

    if os_key == "windows":
        script_map, os_label = WINDOWS, _OS_LABELS["windows"]
    elif os_key in ("macos", "mac", "osx", "darwin"):
        script_map, os_label = MACOS, _OS_LABELS["macos"]
    elif os_key == "linux":
        if distro_key in ("fedora", "rhel", "centos", "almalinux"):
            script_map, os_label = FEDORA, _OS_LABELS["linux-fedora"]
        else:
            script_map, os_label = UBUNTU, _OS_LABELS["linux-ubuntu"]
    elif os_key in ("ubuntu", "debian"):
        script_map, os_label = UBUNTU, _OS_LABELS["linux-ubuntu"]
    elif os_key in ("fedora", "rhel"):
        script_map, os_label = FEDORA, _OS_LABELS["linux-fedora"]
    else:
        script_map, os_label = WINDOWS, _OS_LABELS["windows"]

    entry = script_map.get(key)
    if not entry:
        return None

    return {
        "script": entry["script"].strip(),
        "instructions": entry["instructions"],
        "os": os_label,
    }


def get_supported_software() -> list:
    return list(SUPPORTED_SOFTWARE)


# ── OS version metadata ───────────────────────────────────────────────────────
OS_VERSIONS = {
    "windows": ["Windows 10", "Windows 11"],
    "macos":   ["Ventura (13)", "Sonoma (14)", "Sequoia (15)"],
    "linux":   ["Ubuntu 20.04", "Ubuntu 22.04", "Ubuntu 24.04", "Fedora 39", "Fedora 40", "Debian 12"],
}

def get_os_versions(os_name: str) -> list:
    return OS_VERSIONS.get(os_name.lower().strip(), [])


def get_supported_os() -> list:
    return ["Windows", "macOS", "Linux"]
