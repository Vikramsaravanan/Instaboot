/**
 * Intent Agent
 * Classifies user messages and extracts entities (software, OS, distro).
 */

const SOFTWARE_KEYWORDS = {
  // ── OS / Linux distros ──────────────────────────────────────────────────────
  ubuntu:     ['ubuntu'],
  wsl:        ['wsl', 'windows subsystem for linux', 'windows subsystem'],

  // ── Containers & virtualisation ─────────────────────────────────────────────
  docker:     ['docker', 'docker desktop', 'docker engine', '\\bcontainer\\b', 'containerize'],
  kubernetes: ['kubernetes', '\\bk8s\\b', 'kubectl', 'minikube', 'k3s', 'helm'],
  vagrant:    ['vagrant', 'vagrantfile'],
  virtualbox: ['virtualbox', 'vbox', 'oracle vm'],
  podman:     ['podman', 'buildah', 'skopeo'],

  // ── Languages & runtimes ─────────────────────────────────────────────────────
  nodejs:     ['nodejs', 'node\\.js', 'node js', '\\bnode\\b', '\\bnpm\\b', '\\bnvm\\b'],
  python:     ['python', 'python3', '\\bpip\\b', 'py3', 'conda', 'anaconda'],
  java:       ['\\bjava\\b', 'jdk', 'jre', 'openjdk', 'java development kit'],
  golang:     ['\\bgo\\b', 'golang', 'go lang'],
  rust:       ['\\brust\\b', 'rustup', 'rustc', 'cargo'],
  ruby:       ['\\bruby\\b', 'rbenv', 'rvm', '\\bgem\\b'],
  php:        ['\\bphp\\b', 'php-fpm', 'composer'],
  dotnet:     ['\\.net', 'dotnet', 'asp\\.net', 'csharp', 'c#'],
  perl:       ['\\bperl\\b'],
  scala:      ['\\bscala\\b', 'sbt'],
  kotlin:     ['\\bkotlin\\b'],
  swift:      ['\\bswift\\b', 'swiftlang'],
  r:          ['\\br language\\b', '\\br programming\\b', 'cran', 'rstudio'],

  // ── Version control ──────────────────────────────────────────────────────────
  git:        ['\\bgit\\b', 'git version control', 'github cli', '\\bgh\\b'],
  subversion: ['subversion', '\\bsvn\\b'],
  mercurial:  ['mercurial', '\\bhg\\b'],

  // ── Editors & IDEs ───────────────────────────────────────────────────────────
  vscode:     ['vscode', 'vs code', 'visual studio code', 'code editor'],
  vim:        ['\\bvim\\b', 'neovim', '\\bnvim\\b'],
  emacs:      ['\\bemacs\\b'],
  sublime:    ['sublime text', 'sublime'],
  intellij:   ['intellij', 'idea', 'jetbrains'],
  pycharm:    ['pycharm'],
  eclipse:    ['\\beclipse\\b'],
  atom:       ['\\batom editor\\b'],
  nano:       ['\\bnano\\b', 'nano editor'],

  // ── Databases ────────────────────────────────────────────────────────────────
  postgresql: ['postgresql', 'postgres', '\\bpsql\\b', 'pg_ctl'],
  mysql:      ['\\bmysql\\b', 'mysql server', 'mysql workbench'],
  mariadb:    ['mariadb', 'maria db'],
  mongodb:    ['mongodb', 'mongod', 'mongosh', 'mongo shell'],
  redis:      ['\\bredis\\b', 'redis-server', 'redis cli'],
  sqlite:     ['\\bsqlite\\b', 'sqlite3'],
  elasticsearch: ['elasticsearch', 'elastic search', '\\bes\\b kibana'],
  cassandra:  ['cassandra', 'apache cassandra'],
  influxdb:   ['influxdb', 'influx'],

  // ── Web servers & reverse proxies ────────────────────────────────────────────
  nginx:      ['\\bnginx\\b', 'nginx server'],
  apache:     ['\\bapache\\b', 'apache2', 'httpd', 'apache http'],
  caddy:      ['\\bcaddy\\b', 'caddyfile'],

  // ── Build tools & package managers ──────────────────────────────────────────
  maven:      ['\\bmaven\\b', '\\bmvn\\b'],
  gradle:     ['\\bgradle\\b'],
  cmake:      ['\\bcmake\\b'],
  make:       ['\\bmake\\b', 'makefile', 'build-essential'],
  yarn:       ['\\byarn\\b', 'yarn package'],
  pnpm:       ['\\bpnpm\\b'],
  pip:        ['\\bpip\\b', 'pip3', 'pip install'],
  cargo:      ['\\bcargo\\b', 'cargo install'],
  composer:   ['\\bcomposer\\b', 'php composer'],

  // ── Cloud CLIs ───────────────────────────────────────────────────────────────
  awscli:     ['aws cli', 'awscli', 'aws command line', '\\baws\\b configure'],
  gcloud:     ['gcloud', 'google cloud sdk', 'google cloud cli'],
  azurecli:   ['azure cli', 'az cli', '\\baz\\b login'],
  terraform:  ['terraform', 'tf apply', 'tf plan'],
  ansible:    ['\\bansible\\b', 'ansible-playbook'],
  kubectl:    ['kubectl', 'kube ctl'],
  helm:       ['\\bhelm\\b', 'helm chart'],

  // ── Browsers ─────────────────────────────────────────────────────────────────
  chrome:     ['chrome', 'google chrome', 'chromium'],
  firefox:    ['firefox', 'mozilla firefox'],
  brave:      ['\\bbrave\\b', 'brave browser'],
  opera:      ['\\bopera\\b', 'opera browser'],
  edge:       ['microsoft edge', '\\bmsedge\\b'],

  // ── Communication & productivity ─────────────────────────────────────────────
  zoom:       ['\\bzoom\\b', 'zoom meetings', 'zoom video'],
  slack:      ['\\bslack\\b', 'slack desktop'],
  discord:    ['\\bdiscord\\b'],
  teams:      ['microsoft teams', '\\bteams\\b'],
  skype:      ['\\bskype\\b'],
  telegram:   ['\\btelegram\\b', 'telegram desktop'],
  signal:     ['\\bsignal\\b', 'signal messenger'],
  notion:     ['\\bnotion\\b'],
  obsidian:   ['\\bobsidian\\b'],

  // ── Media & utilities ────────────────────────────────────────────────────────
  vlc:        ['\\bvlc\\b', 'vlc media player', 'media player'],
  '7zip':     ['7zip', '7-zip', '7 zip', 'seven zip', 'sevenzip'],
  ffmpeg:     ['\\bffmpeg\\b'],
  imagemagick:['imagemagick', 'convert image', 'magick'],
  gimp:       ['\\bgimp\\b', 'gnu image'],
  inkscape:   ['\\binkscape\\b'],
  steam:      ['\\bsteam\\b', 'steam gaming', 'valve steam'],
  spotify:    ['\\bspotify\\b'],
  obs:        ['\\bobs\\b', 'obs studio', 'open broadcaster'],

  // ── System & network tools ───────────────────────────────────────────────────
  curl:       ['\\bcurl\\b'],
  wget:       ['\\bwget\\b'],
  htop:       ['\\bhtop\\b', '\\btop\\b process'],
  neofetch:   ['neofetch', 'system info'],
  nmap:       ['\\bnmap\\b', 'network scan'],
  wireshark:  ['wireshark', 'packet capture'],
  openssh:    ['openssh', 'ssh server', 'sshd', 'ssh-keygen'],
  ufw:        ['\\bufw\\b', 'uncomplicated firewall'],
  fail2ban:   ['fail2ban'],
  certbot:    ['certbot', "let's encrypt", 'letsencrypt', 'ssl certificate'],
};

const OS_KEYWORDS = {
  windows: ['windows', 'win10', 'win11', 'windows 10', 'windows 11', 'win 10', 'win 11', 'powershell', '\\bcmd\\b', 'winget', 'chocolatey', 'choco'],
  macos:   ['macos', 'mac os', '\\bmac\\b', 'osx', 'os x', 'apple', 'macbook', 'imac', 'homebrew', '\\bbrew\\b', 'apple silicon', 'm1', 'm2', 'm3'],
  linux:   ['linux', 'ubuntu', 'debian', 'fedora', 'rhel', 'centos', 'arch', 'mint', 'kali', 'opensuse', 'suse', 'manjaro', 'pop!_os', 'elementary'],
};

const DISTRO_KEYWORDS = {
  ubuntu: ['ubuntu', 'debian', 'mint', 'pop!_os', 'elementary', 'kali', '\\bapt\\b', 'apt-get', 'dpkg'],
  fedora: ['fedora', 'rhel', 'centos', 'almalinux', 'rocky', 'opensuse', 'suse', '\\bdnf\\b', '\\byum\\b', 'rpm'],
  arch:   ['arch', 'manjaro', 'endeavouros', '\\bpacman\\b', 'yay', 'aur'],
};

const INSTALL_INTENT_PATTERNS = [
  /\b(install|download|get|setup|set up|add|obtain|deploy|configure)\b/i,
  /\bi want\b/i,
  /\bi need\b/i,
  /\bhow (do i|can i|to)\b.*\b(install|get|download|setup|deploy)\b/i,
  /\b(put|place)\b.*\bon\b/i,
  /\bhow to (install|get|download|setup)\b/i,
  /\bsteps to install\b/i,
  /\bcommands? (for|to) install\b/i,
  /\binstallation (guide|steps|commands|script)\b/i,
  /\bset(ting)? up\b/i,
];

const QUERY_KNOWLEDGE_PATTERNS = [
  /\b(what is|what are|explain|tell me about|describe|summarize|show me|find)\b/i,
  /\b(search|look up|query|retrieve)\b/i,
  /\bin (the )?(document|file|data|csv|json|upload)\b/i,
  /\b(according to|based on)\b/i,
];

function buildPattern(keywords) {
  return new RegExp(keywords.join('|'), 'i');
}

function detectIntent(message) {
  const text = message.toLowerCase();

  // ── 1. Detect OS ──────────────────────────────────────────────────────────
  let detectedOS = null;
  for (const [osName, patterns] of Object.entries(OS_KEYWORDS)) {
    if (buildPattern(patterns).test(text)) {
      detectedOS = osName;
      break;
    }
  }
  if (!detectedOS) detectedOS = 'windows';

  // ── 2. Detect Distro ──────────────────────────────────────────────────────
  let detectedDistro = null;
  if (detectedOS === 'linux') {
    for (const [distroName, patterns] of Object.entries(DISTRO_KEYWORDS)) {
      if (buildPattern(patterns).test(text)) {
        detectedDistro = distroName;
        break;
      }
    }
    if (!detectedDistro) detectedDistro = 'ubuntu';
  }

  // ── 3. Detect Software ────────────────────────────────────────────────────
  let detectedSoftware = null;
  for (const [softName, patterns] of Object.entries(SOFTWARE_KEYWORDS)) {
    if (buildPattern(patterns).test(text)) {
      detectedSoftware = softName;
      break;
    }
  }

  // ── 4. Classify Intent ────────────────────────────────────────────────────
  const hasInstallKeyword = INSTALL_INTENT_PATTERNS.some((p) => p.test(text));
  const hasQueryKeyword   = QUERY_KNOWLEDGE_PATTERNS.some((p) => p.test(text));

  let intent;
  if (hasInstallKeyword && detectedSoftware) {
    intent = 'install_software';
  } else if (detectedSoftware && !hasQueryKeyword) {
    intent = 'install_software';
  } else if (hasQueryKeyword) {
    intent = 'query_knowledge';
  } else {
    intent = 'general_chat';
  }

  return { intent, software: detectedSoftware, os: detectedOS, distro: detectedDistro };
}

module.exports = { detectIntent };
