/**
 * Script Templates — install scripts for 60+ tools across Windows, macOS,
 * Linux (Ubuntu/Debian) and Linux (Fedora/RHEL/Arch).
 *
 * Structure per OS map:
 *   { [softwareKey]: { script: string, instructions: string } }
 */

// ═══════════════════════════════════════════════════════════════════════════════
// WINDOWS
// ═══════════════════════════════════════════════════════════════════════════════
const windowsScripts = {

  // ── OS / WSL ────────────────────────────────────────────────────────────────
  ubuntu: {
    script: `# Install Ubuntu via WSL on Windows 10/11 — run PowerShell as Administrator
dism.exe /online /enable-feature /featurename:Microsoft-Windows-Subsystem-Linux /all /norestart
dism.exe /online /enable-feature /featurename:VirtualMachinePlatform /all /norestart
wsl --set-default-version 2
winget install --id Canonical.Ubuntu.2404 --source winget --accept-package-agreements --accept-source-agreements
# Restart PC, then launch Ubuntu from Start Menu`,
    instructions: 'Run PowerShell as Administrator. Restart your PC after the commands finish, then launch Ubuntu from the Start Menu.',
  },
  wsl: {
    script: `# Install WSL 2 — run PowerShell as Administrator
wsl --install
# OR choose a specific distro:
wsl --install -d Ubuntu-24.04
# List all available distros:
wsl --list --online`,
    instructions: 'Run PowerShell as Administrator. Restart when prompted.',
  },

  // ── Containers & Virtualisation ─────────────────────────────────────────────
  docker: {
    script: `# Install Docker Desktop on Windows
winget install --id Docker.DockerDesktop --source winget --accept-package-agreements --accept-source-agreements
# Verify after restart:
docker --version
docker run hello-world`,
    instructions: 'Run in PowerShell. Restart after install, then launch Docker Desktop from the Start Menu.',
  },
  kubernetes: {
    script: `# Install kubectl + minikube on Windows
winget install --id Kubernetes.kubectl --accept-package-agreements --accept-source-agreements
winget install --id Kubernetes.minikube --accept-package-agreements --accept-source-agreements
# Start a local cluster:
minikube start
kubectl get nodes`,
    instructions: 'Run in PowerShell. Docker Desktop must be running before starting minikube.',
  },
  vagrant: {
    script: `# Install Vagrant on Windows
winget install --id Hashicorp.Vagrant --accept-package-agreements --accept-source-agreements
vagrant --version
# Install VirtualBox provider (recommended):
winget install --id Oracle.VirtualBox --accept-package-agreements --accept-source-agreements`,
    instructions: 'Run in PowerShell. Open a new terminal after install.',
  },
  virtualbox: {
    script: `# Install Oracle VirtualBox on Windows
winget install --id Oracle.VirtualBox --accept-package-agreements --accept-source-agreements
# Verify:
VBoxManage --version`,
    instructions: 'Run in PowerShell. A reboot may be required to load kernel drivers.',
  },
  podman: {
    script: `# Install Podman Desktop on Windows
winget install --id RedHat.Podman-Desktop --accept-package-agreements --accept-source-agreements
winget install --id RedHat.Podman --accept-package-agreements --accept-source-agreements
podman --version`,
    instructions: 'Run in PowerShell. Podman Desktop provides a GUI similar to Docker Desktop.',
  },

  // ── Languages & Runtimes ────────────────────────────────────────────────────
  nodejs: {
    script: `# Install Node.js LTS on Windows
winget install --id OpenJS.NodeJS.LTS --accept-package-agreements --accept-source-agreements
# OR use nvm-windows for version management:
winget install --id CoreyButler.NVMforWindows --accept-package-agreements --accept-source-agreements
# Open a new terminal, then:
nvm install lts
nvm use lts
node --version && npm --version`,
    instructions: 'Run in PowerShell. Open a new terminal after install.',
  },
  python: {
    script: `# Install Python 3.12 on Windows
winget install --id Python.Python.3.12 --accept-package-agreements --accept-source-agreements
# Verify (open a new terminal):
python --version
pip --version
python -m pip install --upgrade pip`,
    instructions: 'Run in PowerShell. Ensure "Add Python to PATH" is checked if using the GUI installer.',
  },
  java: {
    script: `# Install OpenJDK 21 LTS on Windows
winget install --id Microsoft.OpenJDK.21 --accept-package-agreements --accept-source-agreements
# Verify (open a new terminal):
java --version
javac --version`,
    instructions: 'Run in PowerShell. JAVA_HOME is set automatically.',
  },
  golang: {
    script: `# Install Go on Windows
winget install --id GoLang.Go --accept-package-agreements --accept-source-agreements
# Verify (open a new terminal):
go version`,
    instructions: 'Run in PowerShell. Open a new terminal to use go.',
  },
  rust: {
    script: `# Install Rust via rustup on Windows
winget install --id Rustlang.Rustup --accept-package-agreements --accept-source-agreements
# Open a new terminal:
rustup update stable
rustc --version
cargo --version`,
    instructions: 'Run in PowerShell. rustup manages toolchain versions.',
  },
  ruby: {
    script: `# Install Ruby on Windows via RubyInstaller
winget install --id RubyInstallerTeam.RubyWithDevKit.3.3 --accept-package-agreements --accept-source-agreements
# Open a new terminal:
ruby --version
gem --version`,
    instructions: 'Run in PowerShell. The DevKit version includes build tools for native gems.',
  },
  php: {
    script: `# Install PHP on Windows via Scoop (easiest method)
# First install Scoop:
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
Invoke-RestMethod -Uri https://get.scoop.sh | Invoke-Expression
scoop install php
# Verify:
php --version`,
    instructions: 'Run in PowerShell. Scoop installs PHP without admin rights.',
  },
  dotnet: {
    script: `# Install .NET SDK on Windows
winget install --id Microsoft.DotNet.SDK.8 --accept-package-agreements --accept-source-agreements
# Verify (open a new terminal):
dotnet --version
dotnet --list-sdks`,
    instructions: 'Run in PowerShell. .NET 8 is the current LTS release.',
  },
  scala: {
    script: `# Install Scala via Coursier on Windows
winget install --id VirtusLab.ScalaCLI --accept-package-agreements --accept-source-agreements
# Or use cs (Coursier):
Invoke-WebRequest -Uri https://github.com/coursier/launchers/raw/master/cs-x86_64-pc-win32.zip -OutFile cs.zip
Expand-Archive cs.zip; .\\cs-x86_64-pc-win32.exe setup
scala --version`,
    instructions: 'Run in PowerShell. Java must be installed first.',
  },
  kotlin: {
    script: `# Install Kotlin via Scoop on Windows
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
Invoke-RestMethod -Uri https://get.scoop.sh | Invoke-Expression
scoop install kotlin
kotlinc -version`,
    instructions: 'Run in PowerShell. Java must be installed first.',
  },
  r: {
    script: `# Install R on Windows
winget install --id RProject.R --accept-package-agreements --accept-source-agreements
# Install RStudio IDE:
winget install --id Posit.RStudio --accept-package-agreements --accept-source-agreements
R --version`,
    instructions: 'Run in PowerShell. RStudio provides the recommended IDE for R.',
  },

  // ── Version Control ─────────────────────────────────────────────────────────
  git: {
    script: `# Install Git on Windows
winget install --id Git.Git --accept-package-agreements --accept-source-agreements
# Open a new terminal:
git --version
git config --global user.name "Your Name"
git config --global user.email "you@example.com"
git config --global core.autocrlf true`,
    instructions: 'Run in PowerShell. Open a new terminal after install.',
  },

  // ── Editors & IDEs ──────────────────────────────────────────────────────────
  vscode: {
    script: `# Install Visual Studio Code on Windows
winget install --id Microsoft.VisualStudioCode --accept-package-agreements --accept-source-agreements
code --version
# Recommended extensions:
code --install-extension ms-python.python
code --install-extension dbaeumer.vscode-eslint
code --install-extension esbenp.prettier-vscode`,
    instructions: 'Run in PowerShell. Use "code ." to open any folder in VSCode.',
  },
  vim: {
    script: `# Install Vim / Neovim on Windows
winget install --id vim.vim --accept-package-agreements --accept-source-agreements
# OR install Neovim:
winget install --id Neovim.Neovim --accept-package-agreements --accept-source-agreements
nvim --version`,
    instructions: 'Run in PowerShell.',
  },
  sublime: {
    script: `# Install Sublime Text on Windows
winget install --id SublimeHQ.SublimeText.4 --accept-package-agreements --accept-source-agreements`,
    instructions: 'Run in PowerShell.',
  },
  intellij: {
    script: `# Install IntelliJ IDEA Community on Windows
winget install --id JetBrains.IntelliJIDEA.Community --accept-package-agreements --accept-source-agreements`,
    instructions: 'Run in PowerShell. Java is bundled with IntelliJ.',
  },
  pycharm: {
    script: `# Install PyCharm Community on Windows
winget install --id JetBrains.PyCharm.Community --accept-package-agreements --accept-source-agreements`,
    instructions: 'Run in PowerShell.',
  },

  // ── Databases ───────────────────────────────────────────────────────────────
  postgresql: {
    script: `# Install PostgreSQL on Windows
winget install --id PostgreSQL.PostgreSQL.17 --accept-package-agreements --accept-source-agreements
# Verify (open a new terminal):
psql --version
# Connect as postgres user:
psql -U postgres`,
    instructions: 'Run in PowerShell. The installer also adds pgAdmin GUI tool.',
  },
  mysql: {
    script: `# Install MySQL Community Server on Windows
winget install --id Oracle.MySQL --accept-package-agreements --accept-source-agreements
# Verify:
mysql --version`,
    instructions: 'Run in PowerShell. Use MySQL Workbench for a GUI.',
  },
  mongodb: {
    script: `# Install MongoDB Community on Windows
winget install --id MongoDB.Server --accept-package-agreements --accept-source-agreements
# Start the service:
net start MongoDB
# Install mongosh:
winget install --id MongoDB.Shell --accept-package-agreements --accept-source-agreements
mongosh --version`,
    instructions: 'Run in PowerShell as Administrator for the service start command.',
  },
  redis: {
    script: `# Install Redis on Windows (via Memurai — production-ready fork)
winget install --id Memurai.Memurai --accept-package-agreements --accept-source-agreements
# OR use WSL and install Redis inside Ubuntu:
wsl -e bash -c "sudo apt-get update && sudo apt-get install -y redis-server && redis-server --daemonize yes"
redis-cli ping`,
    instructions: 'Run in PowerShell. Memurai is the recommended native Windows Redis. For production use WSL.',
  },
  sqlite: {
    script: `# Install SQLite on Windows
winget install --id SQLite.SQLite --accept-package-agreements --accept-source-agreements
sqlite3 --version`,
    instructions: 'Run in PowerShell.',
  },
  mariadb: {
    script: `# Install MariaDB on Windows
winget install --id MariaDB.Server --accept-package-agreements --accept-source-agreements
mysql --version`,
    instructions: 'Run in PowerShell. MariaDB is a drop-in MySQL replacement.',
  },

  // ── Web Servers ─────────────────────────────────────────────────────────────
  nginx: {
    script: `# Install Nginx on Windows
winget install --id nginx.nginx --accept-package-agreements --accept-source-agreements
# Navigate to install dir and start:
cd "C:\\nginx"
start nginx
# Verify:
nginx -v`,
    instructions: 'Run in PowerShell. For production on Windows, consider running Nginx inside WSL.',
  },

  // ── Build Tools ─────────────────────────────────────────────────────────────
  cmake: {
    script: `# Install CMake on Windows
winget install --id Kitware.CMake --accept-package-agreements --accept-source-agreements
cmake --version`,
    instructions: 'Run in PowerShell.',
  },
  maven: {
    script: `# Install Apache Maven on Windows via Scoop
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
Invoke-RestMethod -Uri https://get.scoop.sh | Invoke-Expression
scoop install maven
mvn --version`,
    instructions: 'Run in PowerShell. Java must be installed first.',
  },
  gradle: {
    script: `# Install Gradle on Windows via Scoop
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
Invoke-RestMethod -Uri https://get.scoop.sh | Invoke-Expression
scoop install gradle
gradle --version`,
    instructions: 'Run in PowerShell. Java must be installed first.',
  },

  // ── Cloud CLIs ──────────────────────────────────────────────────────────────
  awscli: {
    script: `# Install AWS CLI v2 on Windows
winget install --id Amazon.AWSCLI --accept-package-agreements --accept-source-agreements
# Verify (open a new terminal):
aws --version
# Configure:
aws configure`,
    instructions: 'Run in PowerShell. Have your AWS Access Key ID and Secret ready for "aws configure".',
  },
  gcloud: {
    script: `# Install Google Cloud CLI on Windows
winget install --id Google.CloudSDK --accept-package-agreements --accept-source-agreements
# Init (open a new terminal):
gcloud init`,
    instructions: 'Run in PowerShell. "gcloud init" will open a browser to authenticate.',
  },
  azurecli: {
    script: `# Install Azure CLI on Windows
winget install --id Microsoft.AzureCLI --accept-package-agreements --accept-source-agreements
# Verify:
az --version
az login`,
    instructions: 'Run in PowerShell.',
  },
  terraform: {
    script: `# Install Terraform on Windows via Scoop
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
Invoke-RestMethod -Uri https://get.scoop.sh | Invoke-Expression
scoop bucket add hashicorp https://github.com/hashicorp/scoop-hashicorp.git
scoop install terraform
terraform --version`,
    instructions: 'Run in PowerShell.',
  },
  ansible: {
    script: `# Ansible runs best on Linux/macOS. On Windows, install via WSL:
wsl --install -d Ubuntu-24.04
# Then inside WSL:
wsl -e bash -c "sudo apt-get update && sudo apt-get install -y ansible && ansible --version"`,
    instructions: 'Run in PowerShell. Ansible is officially unsupported on native Windows; WSL is the recommended approach.',
  },

  // ── Browsers ────────────────────────────────────────────────────────────────
  chrome: {
    script: `winget install --id Google.Chrome --accept-package-agreements --accept-source-agreements`,
    instructions: 'Run in PowerShell.',
  },
  firefox: {
    script: `winget install --id Mozilla.Firefox --accept-package-agreements --accept-source-agreements`,
    instructions: 'Run in PowerShell.',
  },
  brave: {
    script: `winget install --id Brave.Brave --accept-package-agreements --accept-source-agreements`,
    instructions: 'Run in PowerShell.',
  },
  opera: {
    script: `winget install --id Opera.Opera --accept-package-agreements --accept-source-agreements`,
    instructions: 'Run in PowerShell.',
  },

  // ── Communication ───────────────────────────────────────────────────────────
  zoom: {
    script: `winget install --id Zoom.Zoom --accept-package-agreements --accept-source-agreements`,
    instructions: 'Run in PowerShell.',
  },
  slack: {
    script: `winget install --id SlackTechnologies.Slack --accept-package-agreements --accept-source-agreements`,
    instructions: 'Run in PowerShell.',
  },
  discord: {
    script: `winget install --id Discord.Discord --accept-package-agreements --accept-source-agreements`,
    instructions: 'Run in PowerShell.',
  },
  teams: {
    script: `winget install --id Microsoft.Teams --accept-package-agreements --accept-source-agreements`,
    instructions: 'Run in PowerShell.',
  },
  telegram: {
    script: `winget install --id Telegram.TelegramDesktop --accept-package-agreements --accept-source-agreements`,
    instructions: 'Run in PowerShell.',
  },
  signal: {
    script: `winget install --id OpenWhisperSystems.Signal --accept-package-agreements --accept-source-agreements`,
    instructions: 'Run in PowerShell.',
  },
  notion: {
    script: `winget install --id Notion.Notion --accept-package-agreements --accept-source-agreements`,
    instructions: 'Run in PowerShell.',
  },
  obsidian: {
    script: `winget install --id Obsidian.Obsidian --accept-package-agreements --accept-source-agreements`,
    instructions: 'Run in PowerShell.',
  },

  // ── Media & Utilities ───────────────────────────────────────────────────────
  vlc: {
    script: `winget install --id VideoLAN.VLC --accept-package-agreements --accept-source-agreements`,
    instructions: 'Run in PowerShell.',
  },
  '7zip': {
    script: `winget install --id 7zip.7zip --accept-package-agreements --accept-source-agreements`,
    instructions: 'Run in PowerShell.',
  },
  ffmpeg: {
    script: `# Install FFmpeg on Windows via Scoop
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
Invoke-RestMethod -Uri https://get.scoop.sh | Invoke-Expression
scoop install ffmpeg
ffmpeg -version`,
    instructions: 'Run in PowerShell.',
  },
  gimp: {
    script: `winget install --id GIMP.GIMP --accept-package-agreements --accept-source-agreements`,
    instructions: 'Run in PowerShell.',
  },
  steam: {
    script: `winget install --id Valve.Steam --accept-package-agreements --accept-source-agreements`,
    instructions: 'Run in PowerShell.',
  },
  spotify: {
    script: `winget install --id Spotify.Spotify --accept-package-agreements --accept-source-agreements`,
    instructions: 'Run in PowerShell.',
  },
  obs: {
    script: `winget install --id OBSProject.OBSStudio --accept-package-agreements --accept-source-agreements`,
    instructions: 'Run in PowerShell.',
  },

  // ── System & Network Tools ──────────────────────────────────────────────────
  curl: {
    script: `# curl is built into Windows 10/11. Verify:
curl --version
# If missing, install via Scoop:
Invoke-RestMethod -Uri https://get.scoop.sh | Invoke-Expression
scoop install curl`,
    instructions: 'Run in PowerShell. curl ships with Windows 10 1803+ by default.',
  },
  wget: {
    script: `# Install wget on Windows via Scoop
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
Invoke-RestMethod -Uri https://get.scoop.sh | Invoke-Expression
scoop install wget
wget --version`,
    instructions: 'Run in PowerShell.',
  },
  nmap: {
    script: `winget install --id Insecure.Nmap --accept-package-agreements --accept-source-agreements
nmap --version`,
    instructions: 'Run in PowerShell.',
  },
  wireshark: {
    script: `winget install --id WiresharkFoundation.Wireshark --accept-package-agreements --accept-source-agreements`,
    instructions: 'Run in PowerShell. Admin rights required for live packet capture.',
  },
  openssh: {
    script: `# Enable built-in OpenSSH on Windows 10/11 — run PowerShell as Administrator
Add-WindowsCapability -Online -Name OpenSSH.Client~~~~0.0.1.0
Add-WindowsCapability -Online -Name OpenSSH.Server~~~~0.0.1.0
Start-Service sshd
Set-Service -Name sshd -StartupType Automatic
ssh -V`,
    instructions: 'Run PowerShell as Administrator.',
  },
  certbot: {
    script: `# Install Certbot on Windows via pip
pip install certbot
# For IIS / nginx plugins:
pip install certbot-nginx
certbot --version`,
    instructions: 'Run in PowerShell. Python must be installed first.',
  },
};


// ═══════════════════════════════════════════════════════════════════════════════
// macOS
// ═══════════════════════════════════════════════════════════════════════════════
const macosScripts = {

  ubuntu: {
    script: `# Run Ubuntu on macOS via Multipass
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
brew install --cask multipass
multipass launch 24.04 --name ubuntu-vm --cpus 2 --memory 2G --disk 20G
multipass shell ubuntu-vm`,
    instructions: 'Open Terminal. Homebrew is installed first, then Multipass launches an Ubuntu VM.',
  },
  wsl: {
    script: `# WSL is Windows-only. macOS alternatives:
brew install --cask multipass   # lightweight Ubuntu VM
brew install --cask utm         # full VM manager (free)
brew install --cask docker && docker run -it ubuntu:24.04 /bin/bash`,
    instructions: 'Open Terminal.',
  },
  docker: {
    script: `brew install --cask docker
# Launch Docker Desktop from Applications, then:
docker --version
docker run hello-world`,
    instructions: 'Open Terminal. Homebrew must be installed.',
  },
  kubernetes: {
    script: `brew install kubectl
brew install minikube
minikube start
kubectl get nodes`,
    instructions: 'Open Terminal. Docker Desktop must be running before minikube start.',
  },
  vagrant: {
    script: `brew install --cask vagrant
brew install --cask virtualbox
vagrant --version`,
    instructions: 'Open Terminal.',
  },
  virtualbox: {
    script: `brew install --cask virtualbox
VBoxManage --version`,
    instructions: 'Open Terminal. Approve the system extension in System Preferences > Security.',
  },
  podman: {
    script: `brew install --cask podman-desktop
brew install podman
podman machine init
podman machine start
podman --version`,
    instructions: 'Open Terminal.',
  },
  nodejs: {
    script: `# Install Node.js via nvm (recommended)
brew install nvm
mkdir -p ~/.nvm
echo 'export NVM_DIR="$HOME/.nvm"' >> ~/.zshrc
echo '[ -s "/opt/homebrew/opt/nvm/nvm.sh" ] && . "/opt/homebrew/opt/nvm/nvm.sh"' >> ~/.zshrc
source ~/.zshrc
nvm install --lts && nvm use --lts
node --version && npm --version`,
    instructions: 'Open Terminal.',
  },
  python: {
    script: `brew install python@3.12
echo 'export PATH="/opt/homebrew/opt/python@3.12/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc
python3 --version && pip3 --version`,
    instructions: 'Open Terminal.',
  },
  java: {
    script: `brew install --cask temurin@21
java --version
javac --version`,
    instructions: 'Open Terminal. Temurin is the Adoptium OpenJDK distribution.',
  },
  golang: {
    script: `brew install go
go version`,
    instructions: 'Open Terminal.',
  },
  rust: {
    script: `curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y
source "$HOME/.cargo/env"
rustc --version && cargo --version`,
    instructions: 'Open Terminal.',
  },
  ruby: {
    script: `brew install rbenv ruby-build
echo 'eval "$(rbenv init - zsh)"' >> ~/.zshrc
source ~/.zshrc
rbenv install 3.3.0
rbenv global 3.3.0
ruby --version`,
    instructions: 'Open Terminal.',
  },
  php: {
    script: `brew install php
php --version
composer --version  # composer installed automatically`,
    instructions: 'Open Terminal.',
  },
  dotnet: {
    script: `brew install --cask dotnet-sdk
dotnet --version`,
    instructions: 'Open Terminal.',
  },
  scala: {
    script: `brew install scala
scala --version`,
    instructions: 'Open Terminal. Java must be installed first.',
  },
  kotlin: {
    script: `brew install kotlin
kotlinc -version`,
    instructions: 'Open Terminal. Java must be installed first.',
  },
  r: {
    script: `brew install --cask r
brew install --cask rstudio
R --version`,
    instructions: 'Open Terminal.',
  },
  git: {
    script: `brew install git
git --version
git config --global user.name "Your Name"
git config --global user.email "you@example.com"`,
    instructions: 'Open Terminal.',
  },
  vscode: {
    script: `brew install --cask visual-studio-code
code --version`,
    instructions: 'Open Terminal.',
  },
  vim: {
    script: `brew install neovim
nvim --version`,
    instructions: 'Open Terminal.',
  },
  sublime: {
    script: `brew install --cask sublime-text`,
    instructions: 'Open Terminal.',
  },
  intellij: {
    script: `brew install --cask intellij-idea-ce`,
    instructions: 'Open Terminal.',
  },
  pycharm: {
    script: `brew install --cask pycharm-ce`,
    instructions: 'Open Terminal.',
  },
  postgresql: {
    script: `brew install postgresql@17
brew services start postgresql@17
echo 'export PATH="/opt/homebrew/opt/postgresql@17/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc
psql --version`,
    instructions: 'Open Terminal.',
  },
  mysql: {
    script: `brew install mysql
brew services start mysql
mysql --version`,
    instructions: 'Open Terminal.',
  },
  mongodb: {
    script: `brew tap mongodb/brew
brew install mongodb-community@7.0
brew services start mongodb-community@7.0
mongosh --version`,
    instructions: 'Open Terminal.',
  },
  redis: {
    script: `brew install redis
brew services start redis
redis-cli ping`,
    instructions: 'Open Terminal.',
  },
  sqlite: {
    script: `brew install sqlite
sqlite3 --version`,
    instructions: 'Open Terminal.',
  },
  mariadb: {
    script: `brew install mariadb
brew services start mariadb
mysql --version`,
    instructions: 'Open Terminal.',
  },
  nginx: {
    script: `brew install nginx
brew services start nginx
nginx -v`,
    instructions: 'Open Terminal. Nginx listens on port 8080 by default under Homebrew.',
  },
  apache: {
    script: `brew install httpd
brew services start httpd
httpd -v`,
    instructions: 'Open Terminal.',
  },
  cmake: {
    script: `brew install cmake
cmake --version`,
    instructions: 'Open Terminal.',
  },
  maven: {
    script: `brew install maven
mvn --version`,
    instructions: 'Open Terminal. Java must be installed first.',
  },
  gradle: {
    script: `brew install gradle
gradle --version`,
    instructions: 'Open Terminal. Java must be installed first.',
  },
  awscli: {
    script: `brew install awscli
aws --version
aws configure`,
    instructions: 'Open Terminal.',
  },
  gcloud: {
    script: `brew install --cask google-cloud-sdk
gcloud init`,
    instructions: 'Open Terminal.',
  },
  azurecli: {
    script: `brew install azure-cli
az --version
az login`,
    instructions: 'Open Terminal.',
  },
  terraform: {
    script: `brew tap hashicorp/tap
brew install hashicorp/tap/terraform
terraform --version`,
    instructions: 'Open Terminal.',
  },
  ansible: {
    script: `brew install ansible
ansible --version`,
    instructions: 'Open Terminal.',
  },
  chrome: { script: `brew install --cask google-chrome`, instructions: 'Open Terminal.' },
  firefox: { script: `brew install --cask firefox`, instructions: 'Open Terminal.' },
  brave: { script: `brew install --cask brave-browser`, instructions: 'Open Terminal.' },
  opera: { script: `brew install --cask opera`, instructions: 'Open Terminal.' },
  zoom: { script: `brew install --cask zoom`, instructions: 'Open Terminal.' },
  slack: { script: `brew install --cask slack`, instructions: 'Open Terminal.' },
  discord: { script: `brew install --cask discord`, instructions: 'Open Terminal.' },
  teams: { script: `brew install --cask microsoft-teams`, instructions: 'Open Terminal.' },
  telegram: { script: `brew install --cask telegram`, instructions: 'Open Terminal.' },
  signal: { script: `brew install --cask signal`, instructions: 'Open Terminal.' },
  notion: { script: `brew install --cask notion`, instructions: 'Open Terminal.' },
  obsidian: { script: `brew install --cask obsidian`, instructions: 'Open Terminal.' },
  vlc: { script: `brew install --cask vlc`, instructions: 'Open Terminal.' },
  '7zip': { script: `brew install p7zip\n7z --help`, instructions: 'Open Terminal. Command is "7z".' },
  ffmpeg: { script: `brew install ffmpeg\nffmpeg -version`, instructions: 'Open Terminal.' },
  gimp: { script: `brew install --cask gimp`, instructions: 'Open Terminal.' },
  inkscape: { script: `brew install --cask inkscape`, instructions: 'Open Terminal.' },
  steam: { script: `brew install --cask steam`, instructions: 'Open Terminal.' },
  spotify: { script: `brew install --cask spotify`, instructions: 'Open Terminal.' },
  obs: { script: `brew install --cask obs`, instructions: 'Open Terminal.' },
  curl: { script: `brew install curl\ncurl --version`, instructions: 'Open Terminal.' },
  wget: { script: `brew install wget\nwget --version`, instructions: 'Open Terminal.' },
  htop: { script: `brew install htop\nhtop`, instructions: 'Open Terminal.' },
  nmap: { script: `brew install nmap\nnmap --version`, instructions: 'Open Terminal.' },
  wireshark: { script: `brew install --cask wireshark`, instructions: 'Open Terminal.' },
  openssh: {
    script: `# macOS ships with OpenSSH. Verify:
ssh -V
# To start SSH server (Remote Login):
sudo systemsetup -setremotelogin on`,
    instructions: 'Open Terminal.',
  },
  certbot: {
    script: `brew install certbot
certbot --version`,
    instructions: 'Open Terminal.',
  },
};


// ═══════════════════════════════════════════════════════════════════════════════
// LINUX — Ubuntu / Debian (apt)
// ═══════════════════════════════════════════════════════════════════════════════
const ubuntuScripts = {

  ubuntu: {
    script: `lsb_release -a
sudo apt-get update && sudo apt-get upgrade -y
# Upgrade to next release:
sudo do-release-upgrade`,
    instructions: 'Open a terminal. You are already on Ubuntu/Debian.',
  },
  wsl: {
    script: `# WSL is Windows-only. You are already on Linux.
# Use LXD for containers:
sudo snap install lxd
lxd init --minimal
lxc launch ubuntu:24.04 my-ubuntu
lxc shell my-ubuntu`,
    instructions: 'Open a terminal.',
  },
  docker: {
    script: `sudo apt-get update
sudo apt-get install -y ca-certificates curl gnupg
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
sudo chmod a+r /etc/apt/keyrings/docker.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
sudo apt-get update
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
sudo usermod -aG docker $USER
newgrp docker
docker --version && docker run hello-world`,
    instructions: 'Open a terminal. Log out and back in after adding yourself to the docker group.',
  },
  kubernetes: {
    script: `# Install kubectl
curl -LO "https://dl.k8s.io/release/$(curl -sSL https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl"
sudo install -o root -g root -m 0755 kubectl /usr/local/bin/kubectl
# Install minikube
curl -LO https://storage.googleapis.com/minikube/releases/latest/minikube-linux-amd64
sudo install minikube-linux-amd64 /usr/local/bin/minikube
minikube start
kubectl get nodes`,
    instructions: 'Open a terminal. Docker must be installed first.',
  },
  vagrant: {
    script: `wget -O- https://apt.releases.hashicorp.com/gpg | sudo gpg --dearmor -o /usr/share/keyrings/hashicorp-archive-keyring.gpg
echo "deb [signed-by=/usr/share/keyrings/hashicorp-archive-keyring.gpg] https://apt.releases.hashicorp.com $(lsb_release -cs) main" | sudo tee /etc/apt/sources.list.d/hashicorp.list
sudo apt-get update && sudo apt-get install -y vagrant
vagrant --version`,
    instructions: 'Open a terminal.',
  },
  virtualbox: {
    script: `sudo apt-get update
sudo apt-get install -y virtualbox virtualbox-ext-pack
VBoxManage --version`,
    instructions: 'Open a terminal.',
  },
  podman: {
    script: `sudo apt-get update
sudo apt-get install -y podman
podman --version`,
    instructions: 'Open a terminal.',
  },
  nodejs: {
    script: `curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
node --version && npm --version`,
    instructions: 'Open a terminal.',
  },
  python: {
    script: `sudo apt-get update
sudo apt-get install -y software-properties-common
sudo add-apt-repository -y ppa:deadsnakes/ppa
sudo apt-get update
sudo apt-get install -y python3.12 python3.12-venv python3.12-dev python3-pip
python3.12 --version`,
    instructions: 'Open a terminal.',
  },
  java: {
    script: `sudo apt-get update
sudo apt-get install -y openjdk-21-jdk
java --version
javac --version`,
    instructions: 'Open a terminal.',
  },
  golang: {
    script: `GO_VERSION=$(curl -sSL https://go.dev/dl/?mode=json | grep -oP '"version":.*?"\\K[^"]+' | head -1)
wget "https://go.dev/dl/\${GO_VERSION}.linux-amd64.tar.gz"
sudo rm -rf /usr/local/go
sudo tar -C /usr/local -xzf "\${GO_VERSION}.linux-amd64.tar.gz"
echo 'export PATH=$PATH:/usr/local/go/bin' >> ~/.bashrc
source ~/.bashrc
go version`,
    instructions: 'Open a terminal.',
  },
  rust: {
    script: `curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y
source "$HOME/.cargo/env"
rustc --version && cargo --version`,
    instructions: 'Open a terminal.',
  },
  ruby: {
    script: `sudo apt-get update
sudo apt-get install -y rbenv ruby-build
echo 'eval "$(rbenv init -)"' >> ~/.bashrc
source ~/.bashrc
rbenv install 3.3.0
rbenv global 3.3.0
ruby --version`,
    instructions: 'Open a terminal.',
  },
  php: {
    script: `sudo apt-get update
sudo apt-get install -y php php-cli php-fpm php-mysql php-xml php-mbstring
php --version
# Install Composer:
curl -sS https://getcomposer.org/installer | php
sudo mv composer.phar /usr/local/bin/composer
composer --version`,
    instructions: 'Open a terminal.',
  },
  dotnet: {
    script: `wget https://packages.microsoft.com/config/ubuntu/$(lsb_release -rs)/packages-microsoft-prod.deb -O packages-microsoft-prod.deb
sudo dpkg -i packages-microsoft-prod.deb
rm packages-microsoft-prod.deb
sudo apt-get update && sudo apt-get install -y dotnet-sdk-8.0
dotnet --version`,
    instructions: 'Open a terminal.',
  },
  scala: {
    script: `# Install via Coursier
curl -fL https://github.com/coursier/launchers/raw/master/cs-x86_64-pc-linux.gz | gzip -d > cs
chmod +x cs && ./cs setup
scala --version`,
    instructions: 'Open a terminal. Java must be installed first.',
  },
  kotlin: {
    script: `sudo snap install --classic kotlin
kotlinc -version`,
    instructions: 'Open a terminal. Java must be installed first.',
  },
  r: {
    script: `sudo apt-get update
sudo apt-get install -y r-base
# Install RStudio:
wget https://download1.rstudio.org/electron/jammy/amd64/rstudio-2024.04.2-764-amd64.deb
sudo apt-get install -y ./rstudio-2024.04.2-764-amd64.deb
R --version`,
    instructions: 'Open a terminal.',
  },
  git: {
    script: `sudo add-apt-repository -y ppa:git-core/ppa
sudo apt-get update && sudo apt-get install -y git
git --version
git config --global user.name "Your Name"
git config --global user.email "you@example.com"`,
    instructions: 'Open a terminal.',
  },
  vscode: {
    script: `sudo apt-get install -y wget gpg
wget -qO- https://packages.microsoft.com/keys/microsoft.asc | gpg --dearmor > packages.microsoft.gpg
sudo install -D -o root -g root -m 644 packages.microsoft.gpg /etc/apt/keyrings/packages.microsoft.gpg
echo "deb [arch=amd64 signed-by=/etc/apt/keyrings/packages.microsoft.gpg] https://packages.microsoft.com/repos/code stable main" | sudo tee /etc/apt/sources.list.d/vscode.list
sudo apt-get update && sudo apt-get install -y code
code --version`,
    instructions: 'Open a terminal.',
  },
  vim: {
    script: `sudo apt-get update && sudo apt-get install -y neovim
nvim --version`,
    instructions: 'Open a terminal.',
  },
  sublime: {
    script: `wget -qO - https://download.sublimetext.com/sublimehq-pub.gpg | gpg --dearmor | sudo tee /etc/apt/trusted.gpg.d/sublimehq-archive.gpg > /dev/null
echo "deb https://download.sublimetext.com/ apt/stable/" | sudo tee /etc/apt/sources.list.d/sublime-text.list
sudo apt-get update && sudo apt-get install -y sublime-text`,
    instructions: 'Open a terminal.',
  },
  intellij: {
    script: `sudo snap install intellij-idea-community --classic
intellij-idea-community &`,
    instructions: 'Open a terminal.',
  },
  pycharm: {
    script: `sudo snap install pycharm-community --classic`,
    instructions: 'Open a terminal.',
  },
  postgresql: {
    script: `sudo apt-get update
sudo apt-get install -y postgresql postgresql-contrib
sudo systemctl enable --now postgresql
psql --version`,
    instructions: 'Open a terminal.',
  },
  mysql: {
    script: `sudo apt-get update && sudo apt-get install -y mysql-server
sudo systemctl enable --now mysql
sudo mysql_secure_installation
mysql --version`,
    instructions: 'Open a terminal.',
  },
  mongodb: {
    script: `curl -fsSL https://www.mongodb.org/static/pgp/server-7.0.asc | sudo gpg --dearmor -o /usr/share/keyrings/mongodb-server-7.0.gpg
echo "deb [ arch=amd64,arm64 signed-by=/usr/share/keyrings/mongodb-server-7.0.gpg ] https://repo.mongodb.org/apt/ubuntu $(lsb_release -cs)/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list
sudo apt-get update && sudo apt-get install -y mongodb-org
sudo systemctl enable --now mongod
mongod --version`,
    instructions: 'Open a terminal.',
  },
  redis: {
    script: `sudo apt-get update && sudo apt-get install -y redis-server
sudo systemctl enable --now redis-server
redis-cli ping`,
    instructions: 'Open a terminal.',
  },
  sqlite: {
    script: `sudo apt-get update && sudo apt-get install -y sqlite3
sqlite3 --version`,
    instructions: 'Open a terminal.',
  },
  mariadb: {
    script: `sudo apt-get update && sudo apt-get install -y mariadb-server
sudo systemctl enable --now mariadb
sudo mysql_secure_installation
mysql --version`,
    instructions: 'Open a terminal.',
  },
  elasticsearch: {
    script: `wget -qO - https://artifacts.elastic.co/GPG-KEY-elasticsearch | sudo gpg --dearmor -o /usr/share/keyrings/elasticsearch-keyring.gpg
echo "deb [signed-by=/usr/share/keyrings/elasticsearch-keyring.gpg] https://artifacts.elastic.co/packages/8.x/apt stable main" | sudo tee /etc/apt/sources.list.d/elastic-8.x.list
sudo apt-get update && sudo apt-get install -y elasticsearch
sudo systemctl enable --now elasticsearch
curl -X GET "localhost:9200/"`,
    instructions: 'Open a terminal.',
  },
  nginx: {
    script: `sudo apt-get update && sudo apt-get install -y nginx
sudo systemctl enable --now nginx
nginx -v`,
    instructions: 'Open a terminal.',
  },
  apache: {
    script: `sudo apt-get update && sudo apt-get install -y apache2
sudo systemctl enable --now apache2
apache2 -v`,
    instructions: 'Open a terminal.',
  },
  caddy: {
    script: `sudo apt-get install -y debian-keyring debian-archive-keyring apt-transport-https
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | sudo gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | sudo tee /etc/apt/sources.list.d/caddy-stable.list
sudo apt-get update && sudo apt-get install -y caddy
caddy version`,
    instructions: 'Open a terminal.',
  },
  cmake: {
    script: `sudo apt-get update && sudo apt-get install -y cmake
cmake --version`,
    instructions: 'Open a terminal.',
  },
  maven: {
    script: `sudo apt-get update && sudo apt-get install -y maven
mvn --version`,
    instructions: 'Open a terminal.',
  },
  gradle: {
    script: `sudo apt-get update && sudo apt-get install -y gradle
gradle --version`,
    instructions: 'Open a terminal.',
  },
  awscli: {
    script: `curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip && sudo ./aws/install
aws --version && aws configure`,
    instructions: 'Open a terminal.',
  },
  gcloud: {
    script: `curl https://packages.cloud.google.com/apt/doc/apt-key.gpg | sudo gpg --dearmor -o /usr/share/keyrings/cloud.google.gpg
echo "deb [signed-by=/usr/share/keyrings/cloud.google.gpg] https://packages.cloud.google.com/apt cloud-sdk main" | sudo tee /etc/apt/sources.list.d/google-cloud-sdk.list
sudo apt-get update && sudo apt-get install -y google-cloud-cli
gcloud init`,
    instructions: 'Open a terminal.',
  },
  azurecli: {
    script: `curl -sL https://aka.ms/InstallAzureCLIDeb | sudo bash
az --version && az login`,
    instructions: 'Open a terminal.',
  },
  terraform: {
    script: `wget -O- https://apt.releases.hashicorp.com/gpg | sudo gpg --dearmor -o /usr/share/keyrings/hashicorp-archive-keyring.gpg
echo "deb [signed-by=/usr/share/keyrings/hashicorp-archive-keyring.gpg] https://apt.releases.hashicorp.com $(lsb_release -cs) main" | sudo tee /etc/apt/sources.list.d/hashicorp.list
sudo apt-get update && sudo apt-get install -y terraform
terraform --version`,
    instructions: 'Open a terminal.',
  },
  ansible: {
    script: `sudo apt-get update && sudo apt-get install -y software-properties-common
sudo add-apt-repository --yes --update ppa:ansible/ansible
sudo apt-get install -y ansible
ansible --version`,
    instructions: 'Open a terminal.',
  },
  chrome: {
    script: `wget -q -O /tmp/chrome.deb https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb
sudo apt-get install -y /tmp/chrome.deb && rm /tmp/chrome.deb
google-chrome --version`,
    instructions: 'Open a terminal.',
  },
  firefox: {
    script: `sudo add-apt-repository -y ppa:mozillateam/ppa
sudo apt-get update && sudo apt-get install -y firefox
firefox --version`,
    instructions: 'Open a terminal.',
  },
  brave: {
    script: `sudo curl -fsSLo /usr/share/keyrings/brave-browser-archive-keyring.gpg https://brave-browser-apt-release.s3.brave.com/brave-browser-archive-keyring.gpg
echo "deb [signed-by=/usr/share/keyrings/brave-browser-archive-keyring.gpg] https://brave-browser-apt-release.s3.brave.com/ stable main" | sudo tee /etc/apt/sources.list.d/brave-browser-release.list
sudo apt-get update && sudo apt-get install -y brave-browser`,
    instructions: 'Open a terminal.',
  },
  zoom: {
    script: `wget -q -O /tmp/zoom.deb https://zoom.us/client/latest/zoom_amd64.deb
sudo apt-get install -y /tmp/zoom.deb && rm /tmp/zoom.deb`,
    instructions: 'Open a terminal.',
  },
  slack: {
    script: `sudo snap install slack
slack --version`,
    instructions: 'Open a terminal.',
  },
  discord: {
    script: `wget -q -O /tmp/discord.deb "https://discord.com/api/download?platform=linux&format=deb"
sudo apt-get install -y /tmp/discord.deb && rm /tmp/discord.deb`,
    instructions: 'Open a terminal.',
  },
  teams: {
    script: `sudo snap install teams-for-linux`,
    instructions: 'Open a terminal.',
  },
  telegram: {
    script: `sudo snap install telegram-desktop`,
    instructions: 'Open a terminal.',
  },
  signal: {
    script: `wget -O- https://updates.signal.org/desktop/apt/keys.asc | gpg --dearmor | sudo tee /usr/share/keyrings/signal-desktop-keyring.gpg > /dev/null
echo 'deb [arch=amd64 signed-by=/usr/share/keyrings/signal-desktop-keyring.gpg] https://updates.signal.org/desktop/apt xenial main' | sudo tee /etc/apt/sources.list.d/signal-xenial.list
sudo apt-get update && sudo apt-get install -y signal-desktop`,
    instructions: 'Open a terminal.',
  },
  notion: {
    script: `sudo snap install notion-snap-reborn`,
    instructions: 'Open a terminal.',
  },
  obsidian: {
    script: `sudo snap install obsidian --classic`,
    instructions: 'Open a terminal.',
  },
  vlc: {
    script: `sudo apt-get update && sudo apt-get install -y vlc
vlc --version`,
    instructions: 'Open a terminal.',
  },
  '7zip': {
    script: `sudo apt-get update && sudo apt-get install -y 7zip
7zz --version`,
    instructions: 'Open a terminal.',
  },
  ffmpeg: {
    script: `sudo apt-get update && sudo apt-get install -y ffmpeg
ffmpeg -version`,
    instructions: 'Open a terminal.',
  },
  imagemagick: {
    script: `sudo apt-get update && sudo apt-get install -y imagemagick
convert --version`,
    instructions: 'Open a terminal.',
  },
  gimp: {
    script: `sudo apt-get update && sudo apt-get install -y gimp
gimp --version`,
    instructions: 'Open a terminal.',
  },
  inkscape: {
    script: `sudo apt-get update && sudo apt-get install -y inkscape
inkscape --version`,
    instructions: 'Open a terminal.',
  },
  steam: {
    script: `sudo dpkg --add-architecture i386
sudo apt-get update && sudo apt-get install -y steam-installer
steam`,
    instructions: 'Open a terminal.',
  },
  spotify: {
    script: `sudo snap install spotify`,
    instructions: 'Open a terminal.',
  },
  obs: {
    script: `sudo add-apt-repository -y ppa:obsproject/obs-studio
sudo apt-get update && sudo apt-get install -y obs-studio
obs --version`,
    instructions: 'Open a terminal.',
  },
  curl: {
    script: `sudo apt-get update && sudo apt-get install -y curl
curl --version`,
    instructions: 'Open a terminal.',
  },
  wget: {
    script: `sudo apt-get update && sudo apt-get install -y wget
wget --version`,
    instructions: 'Open a terminal.',
  },
  htop: {
    script: `sudo apt-get update && sudo apt-get install -y htop
htop`,
    instructions: 'Open a terminal.',
  },
  neofetch: {
    script: `sudo apt-get update && sudo apt-get install -y neofetch
neofetch`,
    instructions: 'Open a terminal.',
  },
  nmap: {
    script: `sudo apt-get update && sudo apt-get install -y nmap
nmap --version`,
    instructions: 'Open a terminal.',
  },
  wireshark: {
    script: `sudo apt-get update && sudo apt-get install -y wireshark
sudo usermod -aG wireshark $USER
newgrp wireshark`,
    instructions: 'Open a terminal.',
  },
  openssh: {
    script: `sudo apt-get update && sudo apt-get install -y openssh-server
sudo systemctl enable --now ssh
ssh -V`,
    instructions: 'Open a terminal.',
  },
  ufw: {
    script: `sudo apt-get update && sudo apt-get install -y ufw
sudo ufw enable
sudo ufw status`,
    instructions: 'Open a terminal.',
  },
  fail2ban: {
    script: `sudo apt-get update && sudo apt-get install -y fail2ban
sudo systemctl enable --now fail2ban
sudo fail2ban-client status`,
    instructions: 'Open a terminal.',
  },
  certbot: {
    script: `sudo apt-get update && sudo apt-get install -y certbot python3-certbot-nginx
certbot --version
# Obtain a cert (replace your-domain.com):
sudo certbot --nginx -d your-domain.com`,
    instructions: 'Open a terminal. Nginx must be installed and your domain must point to this server.',
  },
};


// ═══════════════════════════════════════════════════════════════════════════════
// LINUX — Fedora / RHEL / CentOS (dnf)
// ═══════════════════════════════════════════════════════════════════════════════
const fedoraScripts = {

  ubuntu: {
    script: `# Run Ubuntu inside Fedora via toolbox
toolbox create --image ubuntu:24.04 ubuntu-box
toolbox enter ubuntu-box`,
    instructions: 'Open a terminal. Toolbox ships with Fedora Workstation.',
  },
  wsl: {
    script: `# WSL is Windows-only. Use toolbox or podman on Fedora:
toolbox create my-toolbox && toolbox enter my-toolbox
# OR:
podman run -it ubuntu:24.04 /bin/bash`,
    instructions: 'Open a terminal.',
  },
  docker: {
    script: `sudo dnf -y install dnf-plugins-core
sudo dnf config-manager --add-repo https://download.docker.com/linux/fedora/docker-ce.repo
sudo dnf install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
sudo systemctl enable --now docker
sudo usermod -aG docker $USER
newgrp docker
docker --version && docker run hello-world`,
    instructions: 'Open a terminal. Log out and back in after adding yourself to the docker group.',
  },
  kubernetes: {
    script: `curl -LO "https://dl.k8s.io/release/$(curl -sSL https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl"
sudo install -o root -g root -m 0755 kubectl /usr/local/bin/kubectl
curl -LO https://storage.googleapis.com/minikube/releases/latest/minikube-linux-amd64
sudo install minikube-linux-amd64 /usr/local/bin/minikube
minikube start && kubectl get nodes`,
    instructions: 'Open a terminal. Docker must be installed first.',
  },
  vagrant: {
    script: `sudo dnf install -y dnf-plugins-core
sudo dnf config-manager --add-repo https://rpm.releases.hashicorp.com/fedora/hashicorp.repo
sudo dnf install -y vagrant
vagrant --version`,
    instructions: 'Open a terminal.',
  },
  virtualbox: {
    script: `sudo dnf install -y VirtualBox
sudo usermod -aG vboxusers $USER
VBoxManage --version`,
    instructions: 'Open a terminal.',
  },
  podman: {
    script: `sudo dnf install -y podman podman-compose
podman --version`,
    instructions: 'Open a terminal.',
  },
  nodejs: {
    script: `curl -fsSL https://rpm.nodesource.com/setup_20.x | sudo bash -
sudo dnf install -y nodejs
node --version && npm --version`,
    instructions: 'Open a terminal.',
  },
  python: {
    script: `sudo dnf install -y python3.12 python3.12-pip python3.12-devel
python3.12 --version
pip3.12 --version`,
    instructions: 'Open a terminal.',
  },
  java: {
    script: `sudo dnf install -y java-21-openjdk java-21-openjdk-devel
java --version && javac --version`,
    instructions: 'Open a terminal.',
  },
  golang: {
    script: `sudo dnf install -y golang
go version`,
    instructions: 'Open a terminal.',
  },
  rust: {
    script: `curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y
source "$HOME/.cargo/env"
rustc --version && cargo --version`,
    instructions: 'Open a terminal.',
  },
  ruby: {
    script: `sudo dnf install -y rbenv ruby-build
echo 'eval "$(rbenv init -)"' >> ~/.bashrc
source ~/.bashrc
rbenv install 3.3.0 && rbenv global 3.3.0
ruby --version`,
    instructions: 'Open a terminal.',
  },
  php: {
    script: `sudo dnf install -y php php-cli php-fpm php-mysqlnd php-xml php-mbstring
php --version
curl -sS https://getcomposer.org/installer | php
sudo mv composer.phar /usr/local/bin/composer`,
    instructions: 'Open a terminal.',
  },
  dotnet: {
    script: `sudo dnf install -y dotnet-sdk-8.0
dotnet --version`,
    instructions: 'Open a terminal.',
  },
  scala: {
    script: `curl -fL https://github.com/coursier/launchers/raw/master/cs-x86_64-pc-linux.gz | gzip -d > cs
chmod +x cs && ./cs setup
scala --version`,
    instructions: 'Open a terminal. Java must be installed first.',
  },
  kotlin: {
    script: `sudo snap install --classic kotlin
kotlinc -version`,
    instructions: 'Open a terminal. Java must be installed first.',
  },
  r: {
    script: `sudo dnf install -y R
# Install RStudio:
wget https://download1.rstudio.org/electron/rhel9/x86_64/rstudio-2024.04.2-764-x86_64.rpm
sudo dnf install -y ./rstudio-2024.04.2-764-x86_64.rpm
R --version`,
    instructions: 'Open a terminal.',
  },
  git: {
    script: `sudo dnf install -y git
git --version
git config --global user.name "Your Name"
git config --global user.email "you@example.com"`,
    instructions: 'Open a terminal.',
  },
  vscode: {
    script: `sudo rpm --import https://packages.microsoft.com/keys/microsoft.asc
sudo tee /etc/yum.repos.d/vscode.repo << 'EOF'
[code]
name=Visual Studio Code
baseurl=https://packages.microsoft.com/yumrepos/vscode
enabled=1
gpgcheck=1
gpgkey=https://packages.microsoft.com/keys/microsoft.asc
EOF
sudo dnf install -y code
code --version`,
    instructions: 'Open a terminal.',
  },
  vim: {
    script: `sudo dnf install -y neovim
nvim --version`,
    instructions: 'Open a terminal.',
  },
  sublime: {
    script: `sudo rpm -v --import https://download.sublimetext.com/sublimehq-rpm-pub.gpg
sudo dnf config-manager --add-repo https://download.sublimetext.com/rpm/stable/x86_64/sublime-text.repo
sudo dnf install -y sublime-text`,
    instructions: 'Open a terminal.',
  },
  intellij: {
    script: `sudo snap install intellij-idea-community --classic`,
    instructions: 'Open a terminal.',
  },
  pycharm: {
    script: `sudo snap install pycharm-community --classic`,
    instructions: 'Open a terminal.',
  },
  postgresql: {
    script: `sudo dnf install -y https://download.postgresql.org/pub/repos/yum/reporpms/EL-9-x86_64/pgdg-redhat-repo-latest.noarch.rpm
sudo dnf -qy module disable postgresql
sudo dnf install -y postgresql17-server postgresql17
sudo /usr/pgsql-17/bin/postgresql-17-setup initdb
sudo systemctl enable --now postgresql-17
psql --version`,
    instructions: 'Open a terminal.',
  },
  mysql: {
    script: `sudo dnf install -y mysql-server
sudo systemctl enable --now mysqld
sudo mysql_secure_installation
mysql --version`,
    instructions: 'Open a terminal.',
  },
  mongodb: {
    script: `sudo tee /etc/yum.repos.d/mongodb-org-7.0.repo << 'EOF'
[mongodb-org-7.0]
name=MongoDB Repository
baseurl=https://repo.mongodb.org/yum/redhat/9/mongodb-org/7.0/x86_64/
gpgcheck=1
enabled=1
gpgkey=https://www.mongodb.org/static/pgp/server-7.0.asc
EOF
sudo dnf install -y mongodb-org
sudo systemctl enable --now mongod
mongod --version`,
    instructions: 'Open a terminal.',
  },
  redis: {
    script: `sudo dnf install -y redis
sudo systemctl enable --now redis
redis-cli ping`,
    instructions: 'Open a terminal.',
  },
  sqlite: {
    script: `sudo dnf install -y sqlite
sqlite3 --version`,
    instructions: 'Open a terminal.',
  },
  mariadb: {
    script: `sudo dnf install -y mariadb-server
sudo systemctl enable --now mariadb
sudo mysql_secure_installation
mysql --version`,
    instructions: 'Open a terminal.',
  },
  nginx: {
    script: `sudo dnf install -y nginx
sudo systemctl enable --now nginx
nginx -v`,
    instructions: 'Open a terminal.',
  },
  apache: {
    script: `sudo dnf install -y httpd
sudo systemctl enable --now httpd
httpd -v`,
    instructions: 'Open a terminal.',
  },
  caddy: {
    script: `sudo dnf install -y 'dnf-command(copr)'
sudo dnf copr enable -y @caddy/caddy
sudo dnf install -y caddy
sudo systemctl enable --now caddy
caddy version`,
    instructions: 'Open a terminal.',
  },
  cmake: {
    script: `sudo dnf install -y cmake
cmake --version`,
    instructions: 'Open a terminal.',
  },
  maven: {
    script: `sudo dnf install -y maven
mvn --version`,
    instructions: 'Open a terminal.',
  },
  gradle: {
    script: `sudo dnf install -y gradle
gradle --version`,
    instructions: 'Open a terminal.',
  },
  awscli: {
    script: `curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip && sudo ./aws/install
aws --version && aws configure`,
    instructions: 'Open a terminal.',
  },
  gcloud: {
    script: `sudo tee /etc/yum.repos.d/google-cloud-sdk.repo << 'EOF'
[google-cloud-cli]
name=Google Cloud CLI
baseurl=https://packages.cloud.google.com/yum/repos/cloud-sdk-el9-x86_64
enabled=1
gpgcheck=1
repo_gpgcheck=0
gpgkey=https://packages.cloud.google.com/yum/doc/rpm-package-key.gpg
EOF
sudo dnf install -y google-cloud-cli
gcloud init`,
    instructions: 'Open a terminal.',
  },
  azurecli: {
    script: `sudo rpm --import https://packages.microsoft.com/keys/microsoft.asc
sudo dnf install -y https://packages.microsoft.com/config/rhel/9.0/packages-microsoft-prod.rpm
sudo dnf install -y azure-cli
az --version && az login`,
    instructions: 'Open a terminal.',
  },
  terraform: {
    script: `sudo dnf install -y dnf-plugins-core
sudo dnf config-manager --add-repo https://rpm.releases.hashicorp.com/fedora/hashicorp.repo
sudo dnf install -y terraform
terraform --version`,
    instructions: 'Open a terminal.',
  },
  ansible: {
    script: `sudo dnf install -y ansible
ansible --version`,
    instructions: 'Open a terminal.',
  },
  chrome: {
    script: `sudo dnf install -y fedora-workstation-repositories
sudo dnf config-manager --set-enabled google-chrome
sudo dnf install -y google-chrome-stable
google-chrome --version`,
    instructions: 'Open a terminal.',
  },
  firefox: {
    script: `sudo dnf install -y firefox
firefox --version`,
    instructions: 'Open a terminal.',
  },
  brave: {
    script: `sudo dnf install -y dnf-plugins-core
sudo dnf config-manager --add-repo https://brave-browser-rpm-release.s3.brave.com/brave-browser.repo
sudo rpm --import https://brave-browser-rpm-release.s3.brave.com/brave-core.asc
sudo dnf install -y brave-browser`,
    instructions: 'Open a terminal.',
  },
  zoom: {
    script: `wget -q -O /tmp/zoom.rpm https://zoom.us/client/latest/zoom_x86_64.rpm
sudo dnf install -y /tmp/zoom.rpm && rm /tmp/zoom.rpm`,
    instructions: 'Open a terminal.',
  },
  slack: {
    script: `sudo snap install slack`,
    instructions: 'Open a terminal.',
  },
  discord: {
    script: `sudo dnf install -y https://dl.discordapp.net/apps/linux/0.0.62/discord-0.0.62.rpm`,
    instructions: 'Open a terminal.',
  },
  teams: {
    script: `sudo snap install teams-for-linux`,
    instructions: 'Open a terminal.',
  },
  telegram: {
    script: `sudo dnf install -y telegram-desktop`,
    instructions: 'Open a terminal.',
  },
  vlc: {
    script: `sudo dnf install -y https://download1.rpmfusion.org/free/fedora/rpmfusion-free-release-$(rpm -E %fedora).noarch.rpm
sudo dnf install -y vlc
vlc --version`,
    instructions: 'Open a terminal.',
  },
  '7zip': {
    script: `sudo dnf install -y 7zip
7zz --version`,
    instructions: 'Open a terminal.',
  },
  ffmpeg: {
    script: `sudo dnf install -y https://download1.rpmfusion.org/free/fedora/rpmfusion-free-release-$(rpm -E %fedora).noarch.rpm
sudo dnf install -y ffmpeg
ffmpeg -version`,
    instructions: 'Open a terminal.',
  },
  gimp: {
    script: `sudo dnf install -y gimp
gimp --version`,
    instructions: 'Open a terminal.',
  },
  steam: {
    script: `sudo dnf install -y https://download1.rpmfusion.org/free/fedora/rpmfusion-free-release-$(rpm -E %fedora).noarch.rpm
sudo dnf install -y https://download1.rpmfusion.org/nonfree/fedora/rpmfusion-nonfree-release-$(rpm -E %fedora).noarch.rpm
sudo dnf install -y steam`,
    instructions: 'Open a terminal.',
  },
  spotify: {
    script: `sudo snap install spotify`,
    instructions: 'Open a terminal.',
  },
  obs: {
    script: `sudo dnf install -y obs-studio
obs --version`,
    instructions: 'Open a terminal.',
  },
  curl: {
    script: `sudo dnf install -y curl
curl --version`,
    instructions: 'Open a terminal.',
  },
  wget: {
    script: `sudo dnf install -y wget
wget --version`,
    instructions: 'Open a terminal.',
  },
  htop: {
    script: `sudo dnf install -y htop
htop`,
    instructions: 'Open a terminal.',
  },
  neofetch: {
    script: `sudo dnf install -y neofetch
neofetch`,
    instructions: 'Open a terminal.',
  },
  nmap: {
    script: `sudo dnf install -y nmap
nmap --version`,
    instructions: 'Open a terminal.',
  },
  wireshark: {
    script: `sudo dnf install -y wireshark
sudo usermod -aG wireshark $USER`,
    instructions: 'Open a terminal.',
  },
  openssh: {
    script: `sudo dnf install -y openssh-server
sudo systemctl enable --now sshd
ssh -V`,
    instructions: 'Open a terminal.',
  },
  certbot: {
    script: `sudo dnf install -y certbot python3-certbot-nginx
certbot --version
sudo certbot --nginx -d your-domain.com`,
    instructions: 'Open a terminal. Replace your-domain.com with your actual domain.',
  },
};


// ═══════════════════════════════════════════════════════════════════════════════
// ALIASES — normalise common variations to canonical keys
// ═══════════════════════════════════════════════════════════════════════════════
const ALIASES = {
  'node':                'nodejs',
  'node.js':             'nodejs',
  'npm':                 'nodejs',
  'nvm':                 'nodejs',
  'pip':                 'python',
  'pip3':                'python',
  'python3':             'python',
  'conda':               'python',
  'anaconda':            'python',
  'jdk':                 'java',
  'jre':                 'java',
  'openjdk':             'java',
  'go':                  'golang',
  'rustup':              'rust',
  'rustc':               'rust',
  'cargo':               'rust',
  'rbenv':               'ruby',
  'rvm':                 'ruby',
  'gem':                 'ruby',
  'composer':            'php',
  'php-fpm':             'php',
  '.net':                'dotnet',
  'asp.net':             'dotnet',
  'csharp':              'dotnet',
  'c#':                  'dotnet',
  'gh':                  'git',
  'svn':                 'subversion',
  'hg':                  'mercurial',
  'neovim':              'vim',
  'nvim':                'vim',
  'intellij':            'intellij',
  'idea':                'intellij',
  'jetbrains':           'intellij',
  'vs code':             'vscode',
  'visual studio code':  'vscode',
  'sublime text':        'sublime',
  'postgres':            'postgresql',
  'psql':                'postgresql',
  'mongo':               'mongodb',
  'mongosh':             'mongodb',
  'redis-server':        'redis',
  'sqlite3':             'sqlite',
  'maria':               'mariadb',
  'elastic':             'elasticsearch',
  'kibana':              'elasticsearch',
  'apache2':             'apache',
  'httpd':               'apache',
  'apache http':         'apache',
  'mvn':                 'maven',
  'aws':                 'awscli',
  'aws cli':             'awscli',
  'gcloud':              'gcloud',
  'google cloud':        'gcloud',
  'az':                  'azurecli',
  'azure cli':           'azurecli',
  'tf':                  'terraform',
  'kubectl':             'kubernetes',
  'k8s':                 'kubernetes',
  'minikube':            'kubernetes',
  'helm':                'kubernetes',
  'google chrome':       'chrome',
  'chromium':            'chrome',
  'mozilla firefox':     'firefox',
  'brave browser':       'brave',
  'microsoft edge':      'edge',
  'msedge':              'edge',
  'microsoft teams':     'teams',
  'telegram desktop':    'telegram',
  'signal messenger':    'signal',
  'obs studio':          'obs',
  'open broadcaster':    'obs',
  'vlc media player':    'vlc',
  '7-zip':               '7zip',
  'seven zip':           '7zip',
  'sevenzip':            '7zip',
  'p7zip':               '7zip',
  'imagemagick':         'imagemagick',
  'convert':             'imagemagick',
  'gnu image':           'gimp',
  'wsl2':                'wsl',
  'windows subsystem':   'wsl',
  'docker desktop':      'docker',
  'docker engine':       'docker',
  'vbox':                'virtualbox',
  'oracle vm':           'virtualbox',
  'buildah':             'podman',
  'skopeo':              'podman',
  'htop':                'htop',
  'top':                 'htop',
  'neofetch':            'neofetch',
  'nmap':                'nmap',
  'network scan':        'nmap',
  'wireshark':           'wireshark',
  'packet capture':      'wireshark',
  'openssh':             'openssh',
  'ssh server':          'openssh',
  'sshd':                'openssh',
  'uncomplicated firewall': 'ufw',
  'letsencrypt':         'certbot',
  "let's encrypt":       'certbot',
  'ssl certificate':     'certbot',
};

const SUPPORTED_SOFTWARE = Object.keys({
  ...windowsScripts, ...macosScripts, ...ubuntuScripts, ...fedoraScripts,
}).filter((v, i, a) => a.indexOf(v) === i).sort();

const SUPPORTED_OS = ['windows', 'macos', 'linux-ubuntu', 'linux-fedora'];

// ═══════════════════════════════════════════════════════════════════════════════
// getScript — public API
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Return an install script entry for a given software + OS combination.
 *
 * @param {string}  software  - software name (will be normalised via ALIASES)
 * @param {string}  os        - 'windows' | 'macos' | 'linux'
 * @param {string}  [distro]  - 'ubuntu' | 'fedora' | 'arch' (linux only)
 * @returns {{ script: string, instructions: string, os: string } | null}
 */
function getScript(software, os = 'windows', distro = '') {
  const rawKey    = (software || '').toLowerCase().trim();
  const osKey     = (os      || '').toLowerCase().trim();
  const distroKey = (distro  || '').toLowerCase().trim();

  // Resolve alias → canonical key
  const softwareKey = ALIASES[rawKey] || rawKey;

  // Pick the right script map
  let scriptMap;
  let osLabel;

  if (osKey === 'windows') {
    scriptMap = windowsScripts;
    osLabel   = 'Windows (PowerShell)';
  } else if (['macos', 'mac', 'osx', 'darwin'].includes(osKey)) {
    scriptMap = macosScripts;
    osLabel   = 'macOS (Terminal)';
  } else if (osKey === 'linux') {
    if (['fedora', 'rhel', 'centos', 'almalinux', 'rocky'].includes(distroKey)) {
      scriptMap = fedoraScripts;
      osLabel   = 'Linux (Fedora/RHEL — Terminal)';
    } else {
      scriptMap = ubuntuScripts;
      osLabel   = 'Linux (Ubuntu/Debian — Terminal)';
    }
  } else if (['ubuntu', 'debian', 'mint', 'kali'].includes(osKey)) {
    scriptMap = ubuntuScripts;
    osLabel   = 'Linux (Ubuntu/Debian — Terminal)';
  } else if (['fedora', 'rhel', 'centos'].includes(osKey)) {
    scriptMap = fedoraScripts;
    osLabel   = 'Linux (Fedora/RHEL — Terminal)';
  } else {
    // Unknown OS — default to Windows
    scriptMap = windowsScripts;
    osLabel   = 'Windows (PowerShell)';
  }

  const entry = scriptMap[softwareKey];
  if (!entry) return null;

  return {
    script:       entry.script.trim(),
    instructions: entry.instructions,
    os:           osLabel,
  };
}

function getSupportedSoftware() { return [...SUPPORTED_SOFTWARE]; }
function getSupportedOS()       { return [...SUPPORTED_OS]; }

module.exports = { getScript, getSupportedSoftware, getSupportedOS };
