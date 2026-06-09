/**
 * Script Templates for software installation across different operating systems.
 * Returns real, working terminal commands for each OS/software combination.
 */

const SUPPORTED_SOFTWARE = [
  'ubuntu', 'wsl', 'docker', 'nodejs', 'node', 'python', 'git',
  'vscode', 'chrome', 'firefox', 'zoom', 'vlc', '7zip', 'steam',
];

const SUPPORTED_OS = ['windows', 'macos', 'linux-ubuntu', 'linux-fedora'];

// ─── Windows Scripts ──────────────────────────────────────────────────────────

const windowsScripts = {
  ubuntu: {
    script: `# Enable WSL and install Ubuntu on Windows 11/10
# Run PowerShell as Administrator

# Step 1: Enable WSL feature
dism.exe /online /enable-feature /featurename:Microsoft-Windows-Subsystem-Linux /all /norestart

# Step 2: Enable Virtual Machine Platform
dism.exe /online /enable-feature /featurename:VirtualMachinePlatform /all /norestart

# Step 3: Set WSL 2 as default
wsl --set-default-version 2

# Step 4: Install Ubuntu via winget (or Microsoft Store)
winget install --id Canonical.Ubuntu.2404 --source winget --accept-package-agreements --accept-source-agreements

# OR use the WSL shortcut command (Windows 11+)
# wsl --install -d Ubuntu-24.04

# Step 5: After reboot, launch Ubuntu from Start Menu and create a UNIX user`,
    instructions: 'Open PowerShell as Administrator, paste these commands, and restart your PC when prompted. After reboot, launch Ubuntu from the Start Menu.',
  },

  wsl: {
    script: `# Install WSL 2 on Windows 10/11
# Run PowerShell as Administrator

# Install WSL with default Ubuntu distribution
wsl --install

# OR install a specific distro
wsl --install -d Ubuntu-24.04

# List available distros
wsl --list --online

# After installation, restart your computer
# Then set a username and password when Ubuntu launches`,
    instructions: 'Open PowerShell as Administrator and run these commands. A restart is required.',
  },

  docker: {
    script: `# Install Docker Desktop on Windows
# Option 1: via winget (recommended)
winget install --id Docker.DockerDesktop --source winget --accept-package-agreements --accept-source-agreements

# Option 2: Download installer directly
# Visit https://www.docker.com/products/docker-desktop/

# Verify installation (after restart)
docker --version
docker run hello-world`,
    instructions: 'Run in PowerShell (no admin required for winget). Docker Desktop will install and add docker to your PATH automatically.',
  },

  nodejs: {
    script: `# Install Node.js LTS on Windows via winget
winget install --id OpenJS.NodeJS.LTS --source winget --accept-package-agreements --accept-source-agreements

# OR install via nvm-windows (recommended for version management)
winget install --id CoreyButler.NVMforWindows --source winget --accept-package-agreements --accept-source-agreements

# After nvm-windows installs, open a NEW terminal and run:
nvm install lts
nvm use lts

# Verify
node --version
npm --version`,
    instructions: 'Run in PowerShell or CMD. After installation, open a new terminal window to use node and npm.',
  },

  python: {
    script: `# Install Python on Windows via winget
winget install --id Python.Python.3.12 --source winget --accept-package-agreements --accept-source-agreements

# OR download from python.org (includes installer wizard)
# https://www.python.org/downloads/

# Verify installation (open a new terminal)
python --version
pip --version

# (Optional) Upgrade pip
python -m pip install --upgrade pip`,
    instructions: 'Run in PowerShell. Make sure to check "Add Python to PATH" if using the GUI installer.',
  },

  git: {
    script: `# Install Git on Windows via winget
winget install --id Git.Git --source winget --accept-package-agreements --accept-source-agreements

# Verify (open a new terminal)
git --version

# Initial configuration
git config --global user.name "Your Name"
git config --global user.email "you@example.com"
git config --global core.autocrlf true`,
    instructions: 'Run in PowerShell. After installation, open a new terminal to use git.',
  },

  vscode: {
    script: `# Install Visual Studio Code on Windows via winget
winget install --id Microsoft.VisualStudioCode --source winget --accept-package-agreements --accept-source-agreements

# Verify
code --version

# Useful extensions to install after setup:
# code --install-extension ms-python.python
# code --install-extension dbaeumer.vscode-eslint
# code --install-extension esbenp.prettier-vscode`,
    instructions: 'Run in PowerShell. VSCode will be added to PATH so you can open it with "code ." in any folder.',
  },

  chrome: {
    script: `# Install Google Chrome on Windows via winget
winget install --id Google.Chrome --source winget --accept-package-agreements --accept-source-agreements`,
    instructions: 'Run in PowerShell. Chrome will be installed and available from the Start Menu.',
  },

  firefox: {
    script: `# Install Mozilla Firefox on Windows via winget
winget install --id Mozilla.Firefox --source winget --accept-package-agreements --accept-source-agreements`,
    instructions: 'Run in PowerShell. Firefox will be installed and available from the Start Menu.',
  },

  zoom: {
    script: `# Install Zoom on Windows via winget
winget install --id Zoom.Zoom --source winget --accept-package-agreements --accept-source-agreements`,
    instructions: 'Run in PowerShell. Zoom will be installed and available from the Start Menu.',
  },

  vlc: {
    script: `# Install VLC Media Player on Windows via winget
winget install --id VideoLAN.VLC --source winget --accept-package-agreements --accept-source-agreements`,
    instructions: 'Run in PowerShell. VLC will be installed and available from the Start Menu.',
  },

  '7zip': {
    script: `# Install 7-Zip on Windows via winget
winget install --id 7zip.7zip --source winget --accept-package-agreements --accept-source-agreements`,
    instructions: 'Run in PowerShell. 7-Zip will be added to the context menu for archives.',
  },

  steam: {
    script: `# Install Steam on Windows via winget
winget install --id Valve.Steam --source winget --accept-package-agreements --accept-source-agreements`,
    instructions: 'Run in PowerShell. Steam will be installed and available from the Start Menu.',
  },
};

// ─── macOS Scripts ────────────────────────────────────────────────────────────

const macosScripts = {
  ubuntu: {
    script: `# Run Ubuntu on macOS using multipass (lightweight VM)
# First install Homebrew if not already installed
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Install multipass
brew install --cask multipass

# Launch Ubuntu 24.04 VM
multipass launch 24.04 --name ubuntu-vm --cpus 2 --memory 2G --disk 20G

# Open a shell into the VM
multipass shell ubuntu-vm

# OR use Docker to run Ubuntu
docker run -it ubuntu:24.04 /bin/bash`,
    instructions: 'Open Terminal and run these commands. Homebrew must be installed first.',
  },

  wsl: {
    script: `# WSL is a Windows-only feature.
# On macOS, use one of these alternatives:

# Option 1: Use multipass for an Ubuntu VM
brew install --cask multipass
multipass launch 24.04 --name my-ubuntu

# Option 2: Use Docker
brew install --cask docker
docker run -it ubuntu:24.04 /bin/bash

# Option 3: Use UTM (free VM app for Apple Silicon and Intel)
brew install --cask utm`,
    instructions: 'WSL is Windows-only. These are the macOS equivalents for running Linux.',
  },

  docker: {
    script: `# Install Docker Desktop on macOS via Homebrew
brew install --cask docker

# OR download from https://www.docker.com/products/docker-desktop/

# Launch Docker Desktop from Applications, then verify:
docker --version
docker run hello-world`,
    instructions: 'Open Terminal and run these commands. Homebrew must be installed first.',
  },

  nodejs: {
    script: `# Install Node.js on macOS via Homebrew
# Install Homebrew first if needed:
# /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Option 1: Install Node.js LTS directly
brew install node@20
echo 'export PATH="/opt/homebrew/opt/node@20/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc

# Option 2: Use nvm for version management (recommended)
brew install nvm
mkdir -p ~/.nvm
echo 'export NVM_DIR="$HOME/.nvm"' >> ~/.zshrc
echo '[ -s "/opt/homebrew/opt/nvm/nvm.sh" ] && . "/opt/homebrew/opt/nvm/nvm.sh"' >> ~/.zshrc
source ~/.zshrc
nvm install --lts
nvm use --lts

# Verify
node --version
npm --version`,
    instructions: 'Open Terminal. After running, open a new terminal window to use node and npm.',
  },

  python: {
    script: `# Install Python on macOS via Homebrew
brew install python@3.12

# Add to PATH (if needed)
echo 'export PATH="/opt/homebrew/opt/python@3.12/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc

# Verify
python3 --version
pip3 --version

# Upgrade pip
python3 -m pip install --upgrade pip`,
    instructions: 'Open Terminal. Use python3 and pip3 on macOS to avoid conflicts with the system Python.',
  },

  git: {
    script: `# Install Git on macOS via Homebrew
brew install git

# Verify
git --version

# Initial configuration
git config --global user.name "Your Name"
git config --global user.email "you@example.com"
git config --global core.autocrlf input`,
    instructions: 'Open Terminal. macOS ships with a git version from Xcode; this installs the latest.',
  },

  vscode: {
    script: `# Install Visual Studio Code on macOS via Homebrew
brew install --cask visual-studio-code

# Add 'code' command to PATH (if not auto-added)
cat << 'EOF' >> ~/.zshrc
export PATH="$PATH:/Applications/Visual Studio Code.app/Contents/Resources/app/bin"
EOF
source ~/.zshrc

# Verify
code --version`,
    instructions: 'Open Terminal. After installing, you can open any folder in VSCode with "code ."',
  },

  chrome: {
    script: `# Install Google Chrome on macOS via Homebrew
brew install --cask google-chrome`,
    instructions: 'Open Terminal. Chrome will be installed in /Applications.',
  },

  firefox: {
    script: `# Install Mozilla Firefox on macOS via Homebrew
brew install --cask firefox`,
    instructions: 'Open Terminal. Firefox will be installed in /Applications.',
  },

  zoom: {
    script: `# Install Zoom on macOS via Homebrew
brew install --cask zoom`,
    instructions: 'Open Terminal. Zoom will be installed in /Applications.',
  },

  vlc: {
    script: `# Install VLC Media Player on macOS via Homebrew
brew install --cask vlc`,
    instructions: 'Open Terminal. VLC will be installed in /Applications.',
  },

  '7zip': {
    script: `# Install 7-Zip (p7zip) on macOS via Homebrew
brew install p7zip

# Usage example:
# 7z x archive.7z      # extract
# 7z a archive.7z file # create archive`,
    instructions: 'Open Terminal. The command-line tool is available as "7z" after installation.',
  },

  steam: {
    script: `# Install Steam on macOS via Homebrew
brew install --cask steam`,
    instructions: 'Open Terminal. Steam will be installed in /Applications.',
  },
};

// ─── Linux Ubuntu/Debian Scripts ─────────────────────────────────────────────

const ubuntuScripts = {
  ubuntu: {
    script: `# Ubuntu is already your OS! You can upgrade or install in a container.

# To upgrade to the latest Ubuntu release:
sudo apt-get update && sudo apt-get upgrade -y
sudo do-release-upgrade

# To run Ubuntu 24.04 in a Docker container:
sudo docker run -it ubuntu:24.04 /bin/bash

# To check your current version:
lsb_release -a`,
    instructions: 'Open a terminal. You are already on Ubuntu/Debian.',
  },

  wsl: {
    script: `# WSL is a Windows-only feature and not available on Linux.
# You are already running Linux natively!

# If you want to run a different Linux distro inside your Linux:
# Option 1: Use systemd-nspawn (built-in container tool)
sudo apt-get install -y debootstrap
sudo debootstrap focal /var/lib/machines/ubuntu-focal
sudo systemd-nspawn -D /var/lib/machines/ubuntu-focal

# Option 2: Use LXD containers
sudo snap install lxd
lxd init --minimal
lxc launch ubuntu:24.04 my-ubuntu
lxc shell my-ubuntu`,
    instructions: 'WSL is Windows-only. These are Linux-native alternatives.',
  },

  docker: {
    script: `# Install Docker Engine on Ubuntu/Debian
sudo apt-get update
sudo apt-get install -y ca-certificates curl gnupg lsb-release

# Add Docker's official GPG key
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
sudo chmod a+r /etc/apt/keyrings/docker.gpg

# Add Docker apt repository
echo \\
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \\
  $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \\
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Install Docker
sudo apt-get update
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# Add current user to docker group (avoid using sudo)
sudo usermod -aG docker $USER
newgrp docker

# Verify
docker --version
docker run hello-world`,
    instructions: 'Open a terminal. After running, log out and back in for group changes to take effect.',
  },

  nodejs: {
    script: `# Install Node.js 20 LTS on Ubuntu/Debian via NodeSource
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# OR use nvm (recommended for version management)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
source ~/.bashrc
nvm install --lts
nvm use --lts

# Verify
node --version
npm --version`,
    instructions: 'Open a terminal. The NodeSource method installs both node and npm system-wide.',
  },

  python: {
    script: `# Install Python 3.12 on Ubuntu/Debian
sudo apt-get update
sudo apt-get install -y software-properties-common
sudo add-apt-repository -y ppa:deadsnakes/ppa
sudo apt-get update
sudo apt-get install -y python3.12 python3.12-venv python3.12-dev

# Install pip
curl -sS https://bootstrap.pypa.io/get-pip.py | python3.12

# Set as default python3 (optional)
sudo update-alternatives --install /usr/bin/python3 python3 /usr/bin/python3.12 1

# Verify
python3 --version
pip3 --version`,
    instructions: 'Open a terminal. The deadsnakes PPA provides the latest Python versions for Ubuntu.',
  },

  git: {
    script: `# Install latest Git on Ubuntu/Debian
sudo add-apt-repository -y ppa:git-core/ppa
sudo apt-get update
sudo apt-get install -y git

# Verify
git --version

# Initial configuration
git config --global user.name "Your Name"
git config --global user.email "you@example.com"`,
    instructions: 'Open a terminal. The git-core PPA provides a more recent Git than the default Ubuntu repos.',
  },

  vscode: {
    script: `# Install Visual Studio Code on Ubuntu/Debian
sudo apt-get update
sudo apt-get install -y wget gpg

# Import Microsoft GPG key
wget -qO- https://packages.microsoft.com/keys/microsoft.asc | gpg --dearmor > packages.microsoft.gpg
sudo install -D -o root -g root -m 644 packages.microsoft.gpg /etc/apt/keyrings/packages.microsoft.gpg

# Add VSCode repository
echo "deb [arch=amd64,arm64,armhf signed-by=/etc/apt/keyrings/packages.microsoft.gpg] \\
  https://packages.microsoft.com/repos/code stable main" | \\
  sudo tee /etc/apt/sources.list.d/vscode.list > /dev/null

# Install
sudo apt-get update
sudo apt-get install -y code

# Verify
code --version`,
    instructions: 'Open a terminal. VSCode will be added to your applications menu after installation.',
  },

  chrome: {
    script: `# Install Google Chrome on Ubuntu/Debian
wget -q -O /tmp/google-chrome.deb https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb
sudo apt-get install -y /tmp/google-chrome.deb
rm /tmp/google-chrome.deb

# Verify
google-chrome --version`,
    instructions: 'Open a terminal. Chrome will add its own apt repository for future updates.',
  },

  firefox: {
    script: `# Install Firefox on Ubuntu/Debian (latest release via Mozilla PPA)
sudo add-apt-repository -y ppa:mozillateam/ppa
sudo apt-get update
sudo apt-get install -y firefox

# Verify
firefox --version`,
    instructions: 'Open a terminal. This installs the .deb version rather than the snap.',
  },

  zoom: {
    script: `# Install Zoom on Ubuntu/Debian
wget -q -O /tmp/zoom.deb https://zoom.us/client/latest/zoom_amd64.deb
sudo apt-get install -y /tmp/zoom.deb
rm /tmp/zoom.deb

# Verify
zoom --version`,
    instructions: 'Open a terminal. Zoom will be available in your applications menu.',
  },

  vlc: {
    script: `# Install VLC on Ubuntu/Debian
sudo apt-get update
sudo apt-get install -y vlc

# Verify
vlc --version`,
    instructions: 'Open a terminal. VLC will be available in your applications menu.',
  },

  '7zip': {
    script: `# Install 7-Zip on Ubuntu/Debian
sudo apt-get update
sudo apt-get install -y 7zip

# If 7zip package is unavailable (older Ubuntu), use p7zip:
# sudo apt-get install -y p7zip-full p7zip-rar

# Verify
7zz --version

# Usage:
# 7zz x archive.7z    # extract
# 7zz a archive.7z .  # create archive from current directory`,
    instructions: 'Open a terminal. Use "7zz" command on newer Ubuntu, "7z" on older releases.',
  },

  steam: {
    script: `# Install Steam on Ubuntu/Debian

# Enable 32-bit architecture support
sudo dpkg --add-architecture i386
sudo apt-get update

# Install Steam
sudo apt-get install -y steam-installer

# Launch Steam from your applications menu or run:
steam`,
    instructions: 'Open a terminal. Steam requires 32-bit libraries which are automatically installed.',
  },
};

// ─── Linux Fedora/RHEL Scripts ───────────────────────────────────────────────

const fedoraScripts = {
  ubuntu: {
    script: `# Run Ubuntu on Fedora using toolbox or Docker

# Option 1: Use toolbox (built-in on Fedora)
toolbox create --image ubuntu:24.04 ubuntu-box
toolbox enter ubuntu-box

# Option 2: Use Docker/Podman
sudo dnf install -y podman
podman run -it ubuntu:24.04 /bin/bash`,
    instructions: 'Open a terminal. Toolbox is already installed on most Fedora Workstation setups.',
  },

  wsl: {
    script: `# WSL is Windows-only. You are already running Linux on Fedora!

# Use toolbox for isolated environments:
toolbox create my-toolbox
toolbox enter my-toolbox

# Or use Podman/Docker containers:
sudo dnf install -y podman
podman run -it ubuntu:24.04 /bin/bash`,
    instructions: 'WSL is Windows-only. Toolbox and Podman are the Fedora equivalents.',
  },

  docker: {
    script: `# Install Docker on Fedora
sudo dnf -y install dnf-plugins-core

# Add Docker repository
sudo dnf config-manager --add-repo https://download.docker.com/linux/fedora/docker-ce.repo

# Install Docker Engine
sudo dnf install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# Start and enable Docker service
sudo systemctl start docker
sudo systemctl enable docker

# Add current user to docker group
sudo usermod -aG docker $USER
newgrp docker

# Verify
docker --version
docker run hello-world`,
    instructions: 'Open a terminal as a regular user. Log out and back in after adding yourself to the docker group.',
  },

  nodejs: {
    script: `# Install Node.js 20 LTS on Fedora
# Option 1: via NodeSource
curl -fsSL https://rpm.nodesource.com/setup_20.x | sudo bash -
sudo dnf install -y nodejs

# Option 2: via nvm (recommended)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
source ~/.bashrc
nvm install --lts
nvm use --lts

# Verify
node --version
npm --version`,
    instructions: 'Open a terminal. Open a new terminal after installation to use node and npm.',
  },

  python: {
    script: `# Install Python 3.12 on Fedora
sudo dnf install -y python3.12 python3.12-pip python3.12-devel

# Set as default (optional)
sudo alternatives --install /usr/bin/python3 python3 /usr/bin/python3.12 1
sudo alternatives --config python3

# Upgrade pip
python3.12 -m pip install --upgrade pip

# Verify
python3 --version
pip3 --version`,
    instructions: 'Open a terminal. Fedora usually ships with a recent Python, so this ensures 3.12 specifically.',
  },

  git: {
    script: `# Install Git on Fedora
sudo dnf install -y git

# Verify
git --version

# Initial configuration
git config --global user.name "Your Name"
git config --global user.email "you@example.com"`,
    instructions: 'Open a terminal. Git installs quickly from Fedora\'s default repos.',
  },

  vscode: {
    script: `# Install Visual Studio Code on Fedora
sudo rpm --import https://packages.microsoft.com/keys/microsoft.asc

# Add VSCode repository
sudo tee /etc/yum.repos.d/vscode.repo << 'EOF'
[code]
name=Visual Studio Code
baseurl=https://packages.microsoft.com/yumrepos/vscode
enabled=1
gpgcheck=1
gpgkey=https://packages.microsoft.com/keys/microsoft.asc
EOF

# Install
sudo dnf install -y code

# Verify
code --version`,
    instructions: 'Open a terminal. VSCode will appear in your applications menu after installation.',
  },

  chrome: {
    script: `# Install Google Chrome on Fedora
sudo dnf install -y fedora-workstation-repositories
sudo dnf config-manager --set-enabled google-chrome
sudo dnf install -y google-chrome-stable

# Verify
google-chrome --version`,
    instructions: 'Open a terminal. Chrome will add its own yum repository for future updates.',
  },

  firefox: {
    script: `# Firefox is pre-installed on Fedora Workstation.
# To install or reinstall:
sudo dnf install -y firefox

# To get the latest version via flatpak:
flatpak install flathub org.mozilla.firefox

# Verify
firefox --version`,
    instructions: 'Open a terminal. Firefox should already be installed on Fedora Workstation.',
  },

  zoom: {
    script: `# Install Zoom on Fedora
wget -q -O /tmp/zoom.rpm https://zoom.us/client/latest/zoom_x86_64.rpm
sudo dnf install -y /tmp/zoom.rpm
rm /tmp/zoom.rpm

# Verify
zoom --version`,
    instructions: 'Open a terminal. Zoom will be available in your applications menu.',
  },

  vlc: {
    script: `# Install VLC on Fedora (requires RPM Fusion)
sudo dnf install -y https://download1.rpmfusion.org/free/fedora/rpmfusion-free-release-$(rpm -E %fedora).noarch.rpm
sudo dnf install -y vlc

# Verify
vlc --version`,
    instructions: 'Open a terminal. RPM Fusion is required since VLC includes non-free codecs.',
  },

  '7zip': {
    script: `# Install 7-Zip on Fedora
sudo dnf install -y 7zip

# Verify
7zz --version

# Usage:
# 7zz x archive.7z    # extract
# 7zz a archive.7z .  # create archive`,
    instructions: 'Open a terminal. Use the "7zz" command after installation.',
  },

  steam: {
    script: `# Install Steam on Fedora (requires RPM Fusion)
sudo dnf install -y https://download1.rpmfusion.org/free/fedora/rpmfusion-free-release-$(rpm -E %fedora).noarch.rpm
sudo dnf install -y https://download1.rpmfusion.org/nonfree/fedora/rpmfusion-nonfree-release-$(rpm -E %fedora).noarch.rpm
sudo dnf install -y steam

# Launch Steam from applications menu or run:
steam`,
    instructions: 'Open a terminal. RPM Fusion (free and nonfree) are required for Steam.',
  },
};

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Get an install script for a given software on a given OS.
 *
 * @param {string} software - e.g. 'docker', 'nodejs', 'python'
 * @param {string} os       - 'windows' | 'macos' | 'linux'
 * @param {string} [distro] - 'ubuntu' | 'debian' | 'fedora' | 'rhel' (only for linux)
 * @returns {{ script: string, instructions: string, os: string } | null}
 */
function getScript(software, os = 'windows', distro = '') {
  const softwareKey = software.toLowerCase().trim();
  const osKey = os.toLowerCase().trim();
  const distroKey = (distro || '').toLowerCase().trim();

  let scriptMap;
  let resolvedOS;

  if (osKey === 'windows') {
    scriptMap = windowsScripts;
    resolvedOS = 'Windows (PowerShell / CMD)';
  } else if (osKey === 'macos' || osKey === 'mac' || osKey === 'osx' || osKey === 'darwin') {
    scriptMap = macosScripts;
    resolvedOS = 'macOS (Terminal)';
  } else if (osKey === 'linux') {
    // Pick distro-specific script map
    if (distroKey === 'fedora' || distroKey === 'rhel' || distroKey === 'centos' || distroKey === 'almalinux') {
      scriptMap = fedoraScripts;
      resolvedOS = 'Linux (Fedora/RHEL - Terminal)';
    } else {
      // Default to Ubuntu/Debian for generic "linux"
      scriptMap = ubuntuScripts;
      resolvedOS = 'Linux (Ubuntu/Debian - Terminal)';
    }
  } else if (osKey === 'ubuntu' || osKey === 'debian') {
    scriptMap = ubuntuScripts;
    resolvedOS = 'Linux (Ubuntu/Debian - Terminal)';
  } else if (osKey === 'fedora' || osKey === 'rhel') {
    scriptMap = fedoraScripts;
    resolvedOS = 'Linux (Fedora/RHEL - Terminal)';
  } else {
    // Unknown OS — fall back to Windows
    scriptMap = windowsScripts;
    resolvedOS = 'Windows (PowerShell / CMD)';
  }

  // Normalize common aliases
  const aliases = {
    node: 'nodejs',
    'node.js': 'nodejs',
    'vs code': 'vscode',
    'visual studio code': 'vscode',
    '7-zip': '7zip',
    sevenzip: '7zip',
    wsl2: 'wsl',
  };
  const normalizedKey = aliases[softwareKey] || softwareKey;

  const entry = scriptMap[normalizedKey];
  if (!entry) return null;

  return {
    script: entry.script.trim(),
    instructions: entry.instructions,
    os: resolvedOS,
  };
}

function getSupportedSoftware() {
  return [...SUPPORTED_SOFTWARE];
}

function getSupportedOS() {
  return [...SUPPORTED_OS];
}

module.exports = { getScript, getSupportedSoftware, getSupportedOS };
