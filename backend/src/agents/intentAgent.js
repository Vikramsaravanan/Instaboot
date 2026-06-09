/**
 * Intent Agent
 * Analyzes a user message using regex/keyword matching to classify intent
 * and extract key entities (software, OS, distro).
 */

const SOFTWARE_KEYWORDS = {
  ubuntu: ['ubuntu'],
  wsl: ['wsl', 'windows subsystem for linux', 'windows subsystem'],
  docker: ['docker', 'docker desktop', 'container', 'containerize'],
  nodejs: ['nodejs', 'node.js', 'node js', '\\bnode\\b', 'npm', 'nvm'],
  python: ['python', 'python3', 'pip', 'py3'],
  git: ['\\bgit\\b', 'git version control', 'github cli'],
  vscode: ['vscode', 'vs code', 'visual studio code', 'code editor'],
  chrome: ['chrome', 'google chrome', 'chromium'],
  firefox: ['firefox', 'mozilla firefox'],
  zoom: ['\\bzoom\\b', 'zoom meetings', 'zoom video'],
  vlc: ['\\bvlc\\b', 'vlc media player', 'media player'],
  '7zip': ['7zip', '7-zip', '7 zip', 'seven zip', 'sevenzip', 'archive manager'],
  steam: ['\\bsteam\\b', 'steam gaming', 'valve steam'],
};

const OS_KEYWORDS = {
  windows: ['windows', 'win10', 'win11', 'windows 10', 'windows 11', 'win 10', 'win 11', 'powershell', '\\bcmd\\b'],
  macos: ['macos', 'mac os', '\\bmac\\b', 'osx', 'os x', 'apple', 'macbook', 'imac', 'homebrew', '\\bbrew\\b'],
  linux: ['linux', 'ubuntu', 'debian', 'fedora', 'rhel', 'centos', 'arch', 'mint', 'kali'],
};

const DISTRO_KEYWORDS = {
  ubuntu: ['ubuntu', 'debian', '\\bapt\\b', 'apt-get'],
  fedora: ['fedora', 'rhel', 'centos', 'almalinux', 'rocky', '\\bdnf\\b', '\\byum\\b'],
};

const INSTALL_INTENT_PATTERNS = [
  /\b(install|download|get|setup|set up|add|obtain)\b/i,
  /\bi want\b/i,
  /\bi need\b/i,
  /\bhow (do i|can i|to)\b.*\b(install|get|download|setup)\b/i,
  /\b(put|place)\b.*\bon\b/i,
  /\bhow to (install|get|download)\b/i,
  /\bsteps to install\b/i,
  /\bcommands? (for|to) install\b/i,
];

const QUERY_KNOWLEDGE_PATTERNS = [
  /\b(what is|what are|explain|tell me about|describe|summarize|show me|find)\b/i,
  /\b(search|look up|query|retrieve)\b/i,
  /\bin (the )?(document|file|data|csv|json|upload)\b/i,
  /\b(according to|based on)\b/i,
];

/**
 * Build a regex from an array of keyword strings (handles word-boundary patterns).
 */
function buildPattern(keywords) {
  return new RegExp(keywords.join('|'), 'i');
}

/**
 * Detect the intent from a user message.
 *
 * @param {string} message
 * @returns {{ intent: 'install_software'|'query_knowledge'|'general_chat', software: string|null, os: string|null, distro: string|null }}
 */
function detectIntent(message) {
  const text = message.toLowerCase();

  // ── 1. Detect OS ────────────────────────────────────────────────────────────
  let detectedOS = null;
  for (const [osName, patterns] of Object.entries(OS_KEYWORDS)) {
    if (buildPattern(patterns).test(text)) {
      detectedOS = osName;
      break;
    }
  }
  // Default to windows if no OS is mentioned
  if (!detectedOS) detectedOS = 'windows';

  // ── 2. Detect Distro (for linux) ────────────────────────────────────────────
  let detectedDistro = null;
  if (detectedOS === 'linux') {
    for (const [distroName, patterns] of Object.entries(DISTRO_KEYWORDS)) {
      if (buildPattern(patterns).test(text)) {
        detectedDistro = distroName;
        break;
      }
    }
    if (!detectedDistro) detectedDistro = 'ubuntu'; // default linux distro
  }

  // ── 3. Detect Software ──────────────────────────────────────────────────────
  let detectedSoftware = null;
  for (const [softName, patterns] of Object.entries(SOFTWARE_KEYWORDS)) {
    if (buildPattern(patterns).test(text)) {
      detectedSoftware = softName;
      break;
    }
  }

  // ── 4. Classify Intent ──────────────────────────────────────────────────────
  const hasInstallKeyword = INSTALL_INTENT_PATTERNS.some((p) => p.test(text));
  const hasQueryKeyword = QUERY_KNOWLEDGE_PATTERNS.some((p) => p.test(text));

  let intent;

  if (hasInstallKeyword && detectedSoftware) {
    intent = 'install_software';
  } else if (detectedSoftware && !hasQueryKeyword) {
    // Mentions a software name even without an explicit "install" keyword
    intent = 'install_software';
  } else if (hasQueryKeyword) {
    intent = 'query_knowledge';
  } else {
    intent = 'general_chat';
  }

  return {
    intent,
    software: detectedSoftware,
    os: detectedOS,
    distro: detectedDistro,
  };
}

module.exports = { detectIntent };
