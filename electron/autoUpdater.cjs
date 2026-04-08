const { net, dialog, shell, app } = require('electron');
const path = require('path');
const fs = require('fs');

// ─── Configuration ───────────────────────────────────────────
// Point this to your GitHub repo's releases API.
// Once you have a GitHub repo, replace YOUR_USERNAME/YOUR_REPO below.
// The endpoint should return JSON with: { tag_name: "v1.0.0", html_url: "https://..." }
const UPDATE_CHECK_URL = 'https://api.github.com/repos/VraithTV/system-sidekick-app/releases/latest';
const UPDATE_CONFIGURED = !UPDATE_CHECK_URL.includes('YOUR_USERNAME');
const CHECK_INTERVAL_MS = 60 * 60 * 1000; // Check every hour
const DISMISSED_FILE = path.join(app.getPath('userData'), '.update-dismissed');

let checkTimer = null;

function getCurrentVersion() {
  try {
    const pkg = JSON.parse(
      fs.readFileSync(path.join(__dirname, '..', 'package.json'), 'utf-8')
    );
    return pkg.version || '0.0.0';
  } catch {
    return '0.0.0';
  }
}

function parseVersion(v) {
  const parts = v.replace(/^v/, '').split('.').map(Number);
  return { major: parts[0] || 0, minor: parts[1] || 0, patch: parts[2] || 0 };
}

function isNewer(remote, local) {
  const r = parseVersion(remote);
  const l = parseVersion(local);
  if (r.major !== l.major) return r.major > l.major;
  if (r.minor !== l.minor) return r.minor > l.minor;
  return r.patch > l.patch;
}

function wasDismissed(version) {
  try {
    const dismissed = fs.readFileSync(DISMISSED_FILE, 'utf-8').trim();
    return dismissed === version;
  } catch {
    return false;
  }
}

function dismissVersion(version) {
  try {
    fs.writeFileSync(DISMISSED_FILE, version, 'utf-8');
  } catch {}
}

function fetchJSON(url) {
  return new Promise((resolve, reject) => {
    const request = net.request(url);
    request.setHeader('User-Agent', 'JarvisAI-Updater');
    let body = '';

    request.on('response', (response) => {
      response.on('data', (chunk) => { body += chunk.toString(); });
      response.on('end', () => {
        try {
          resolve(JSON.parse(body));
        } catch (e) {
          reject(new Error('Invalid JSON response'));
        }
      });
    });

    request.on('error', reject);
    request.end();
  });
}

async function checkForUpdates(silent = true) {
  const currentVersion = getCurrentVersion();
  console.log(`[AutoUpdater] Current version: ${currentVersion}`);

  if (!UPDATE_CONFIGURED) {
    if (!silent) {
      dialog.showMessageBox({
        type: 'info',
        title: 'Jarvis AI',
        message: `You are running Jarvis AI v${currentVersion}.\n\nAutomatic updates will be available once a GitHub releases repository is configured.`,
      });
    }
    return null;
  }

  try {
    const data = await fetchJSON(UPDATE_CHECK_URL);

    const remoteVersion = (data.tag_name || data.version || '').replace(/^v/, '');
    const downloadUrl = data.html_url || data.downloadUrl || '';

    if (!remoteVersion) {
      if (!silent) {
        dialog.showMessageBox({
          type: 'info',
          title: 'Update Check',
          message: `Could not determine the latest version.\nYou are running v${currentVersion}.`,
        });
      }
      return null;
    }

    if (!isNewer(remoteVersion, currentVersion)) {
      console.log('[AutoUpdater] Already up to date.');
      if (!silent) {
        dialog.showMessageBox({
          type: 'info',
          title: 'No Updates',
          message: `You are running the latest version (${currentVersion}).`,
        });
      }
      return null;
    }

    // Skip if user already dismissed this version (only for silent checks)
    if (silent && wasDismissed(remoteVersion)) {
      console.log(`[AutoUpdater] Version ${remoteVersion} was dismissed.`);
      return null;
    }

    console.log(`[AutoUpdater] New version available: ${remoteVersion}`);

    const result = await dialog.showMessageBox({
      type: 'info',
      title: 'Update Available',
      message: `A new version of Jarvis AI is available: v${remoteVersion}\nYou are running v${currentVersion}.`,
      buttons: ['Download Update', 'Remind Me Later', 'Skip This Version'],
      defaultId: 0,
      cancelId: 1,
    });

    if (result.response === 0 && downloadUrl) {
      shell.openExternal(downloadUrl);
    } else if (result.response === 2) {
      dismissVersion(remoteVersion);
    }

    return remoteVersion;
  } catch (error) {
    console.warn('[AutoUpdater] Check failed:', error.message);
    if (!silent) {
      dialog.showMessageBox({
        type: 'error',
        title: 'Update Check Failed',
        message: 'Could not check for updates. Please check your internet connection.',
      });
    }
    return null;
  }
}

function startAutoUpdateSchedule() {
  // Initial check after 10 seconds
  setTimeout(() => checkForUpdates(true), 10_000);

  // Periodic checks
  checkTimer = setInterval(() => checkForUpdates(true), CHECK_INTERVAL_MS);
}

function stopAutoUpdateSchedule() {
  if (checkTimer) {
    clearInterval(checkTimer);
    checkTimer = null;
  }
}

module.exports = {
  checkForUpdates,
  startAutoUpdateSchedule,
  stopAutoUpdateSchedule,
  getCurrentVersion,
};
