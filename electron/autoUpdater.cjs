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
    request.setHeader('Accept', 'application/vnd.github+json');
    let body = '';

    request.on('response', (response) => {
      response.on('data', (chunk) => { body += chunk.toString(); });
      response.on('end', () => {
        let parsed = null;

        try {
          parsed = JSON.parse(body);
        } catch (e) {}

        if (response.statusCode >= 400) {
          reject(new Error(parsed?.message || `HTTP ${response.statusCode}`));
          return;
        }

        if (!parsed) {
          reject(new Error('Invalid JSON response'));
          return;
        }

        resolve(parsed);
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
    return { status: 'not-configured', currentVersion };
  }

  try {
    const data = await fetchJSON(UPDATE_CHECK_URL);

    const remoteVersion = (data.tag_name || data.version || '').replace(/^v/, '');
    const downloadUrl = data.html_url || data.assets?.[0]?.browser_download_url || data.downloadUrl || '';

    if (!remoteVersion) {
      if (!silent) {
        dialog.showMessageBox({
          type: 'info',
          title: 'Update Check',
          message: `Could not determine the latest version.\nYou are running v${currentVersion}.`,
        });
      }
      return { status: 'error', currentVersion, message: 'Could not determine the latest version.' };
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
      return { status: 'up-to-date', currentVersion, remoteVersion };
    }

    // Skip if user already dismissed this version (only for silent checks)
    if (silent && wasDismissed(remoteVersion)) {
      console.log(`[AutoUpdater] Version ${remoteVersion} was dismissed.`);
      return { status: 'dismissed', currentVersion, remoteVersion, downloadUrl };
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

    return { status: 'available', currentVersion, remoteVersion, downloadUrl };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Could not check for updates.';
    console.warn('[AutoUpdater] Check failed:', message);
    if (!silent) {
      dialog.showMessageBox({
        type: 'error',
        title: 'Update Check Failed',
        message: message.includes('404')
          ? 'Could not find the GitHub release feed. Check that the repository name is correct and the repo is public.'
          : 'Could not check for updates. Please check your internet connection.',
      });
    }
    return { status: 'error', currentVersion, message };
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
