const axios = require('axios');

/** Static fallback versions used when live APIs are unavailable */
const FALLBACK_VERSIONS = {
  ubuntu:  { version: '24.04 LTS',         releaseDate: '2024-04-25' },
  wsl:     { version: '2.2.4',             releaseDate: '2024-05-10' },
  docker:  { version: '26.1.3',            releaseDate: '2024-05-16' },
  nodejs:  { version: '20.14.0 LTS',       releaseDate: '2024-05-28' },
  python:  { version: '3.12.4',            releaseDate: '2024-06-06' },
  git:     { version: '2.45.2',            releaseDate: '2024-06-03' },
  vscode:  { version: '1.90.0',            releaseDate: '2024-06-05' },
  chrome:  { version: '125.0.6422.141',    releaseDate: '2024-05-29' },
  firefox: { version: '127.0',             releaseDate: '2024-06-11' },
  zoom:    { version: '6.1.1',             releaseDate: '2024-06-01' },
  vlc:     { version: '3.0.21',            releaseDate: '2024-03-28' },
  '7zip':  { version: '24.07',             releaseDate: '2024-06-19' },
  steam:   { version: '1721009284',        releaseDate: '2024-07-15' },
};

/**
 * Fetch the latest Node.js version from the official release feed.
 */
async function fetchNodejsVersion() {
  const { data } = await axios.get('https://nodejs.org/dist/index.json', { timeout: 5000 });
  const lts = data.find((r) => r.lts);
  if (lts) {
    return {
      version: `${lts.version} (${lts.lts} LTS)`,
      releaseDate: lts.date,
    };
  }
  return null;
}

/**
 * Fetch the latest Python version by scraping the FTP directory listing.
 */
async function fetchPythonVersion() {
  const { data } = await axios.get('https://www.python.org/ftp/python/', { timeout: 5000 });
  // Match version folders like 3.12.4/
  const matches = data.match(/href="(\d+\.\d+\.\d+)\/"/g) || [];
  const versions = matches
    .map((m) => m.match(/(\d+\.\d+\.\d+)/)[1])
    .filter((v) => !v.startsWith('2.')); // Only Python 3.x
  if (versions.length === 0) return null;

  // Sort semver descending
  versions.sort((a, b) => {
    const pa = a.split('.').map(Number);
    const pb = b.split('.').map(Number);
    for (let i = 0; i < 3; i++) {
      if (pa[i] !== pb[i]) return pb[i] - pa[i];
    }
    return 0;
  });

  return { version: versions[0], releaseDate: null };
}

/**
 * Get the latest version for a given software.
 * Tries live APIs first; falls back to static table on error.
 *
 * @param {string} software - e.g. 'nodejs', 'python', 'docker'
 * @returns {Promise<{ version: string, releaseDate: string|null }>}
 */
async function getLatestVersion(software) {
  const key = (software || '').toLowerCase().trim();

  try {
    if (key === 'nodejs' || key === 'node') {
      const result = await fetchNodejsVersion();
      if (result) return result;
    }

    if (key === 'python') {
      const result = await fetchPythonVersion();
      if (result) return result;
    }

    // For other software, use the static table
    return FALLBACK_VERSIONS[key] || { version: 'Latest', releaseDate: null };
  } catch (err) {
    console.warn(`versionCheckAgent: failed to fetch live version for "${key}":`, err.message);
    return FALLBACK_VERSIONS[key] || { version: 'Latest', releaseDate: null };
  }
}

module.exports = { getLatestVersion };
