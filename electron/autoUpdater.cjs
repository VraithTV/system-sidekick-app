const { net, shell, app } = require('electron');
const path = require('path');
const fs = require('fs');

// ─── Configuration ───────────────────────────────────────────
const UPDATE_CHECK_URL = 'https://api.github.com/repos/VraithTV/system-sidekick-app/releases/latest';
const UPDATE_CONFIGURED = !UPDATE_CHECK_URL.includes('YOUR_USERNAME');
const CHECK_INTERVAL_MS = 60 * 60 * 1000;
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
      // Follow redirects manually for net.request
      if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
        const redirectUrl = Array.isArray(response.headers.location) ? response.headers.location[0] : response.headers.location;
        fetchJSON(redirectUrl).then(resolve).catch(reject);
        return;
      }

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

function findInstallerAsset(assets) {
  if (!assets || !Array.isArray(assets)) return null;
  // Prefer .exe installer, then .zip for Windows
  const exeAsset = assets.find(a => a.name && a.name.endsWith('.exe'));
  if (exeAsset) return exeAsset;
  const zipAsset = assets.find(a => a.name && (a.name.endsWith('.zip') && a.name.toLowerCase().includes('win')));
  if (zipAsset) return zipAsset;
  // Fallback: first asset
  return assets[0] || null;
}

async function checkForUpdates(silent = true) {
  const currentVersion = getCurrentVersion();
  console.log(`[AutoUpdater] Current version: ${currentVersion}`);

  if (!UPDATE_CONFIGURED) {
    return { status: 'not-configured', currentVersion, message: 'Update URL not configured.' };
  }

  try {
    const data = await fetchJSON(UPDATE_CHECK_URL);

    const remoteVersion = (data.tag_name || data.version || '').replace(/^v/, '');
    const asset = findInstallerAsset(data.assets);
    const assetDownloadUrl = asset?.browser_download_url || '';
    const assetName = asset?.name || '';
    const releasePageUrl = data.html_url || '';

    if (!remoteVersion) {
      return { status: 'error', currentVersion, message: 'Could not determine the latest version.' };
    }

    if (!isNewer(remoteVersion, currentVersion)) {
      console.log('[AutoUpdater] Already up to date.');
      return { status: 'up-to-date', currentVersion, remoteVersion };
    }

    if (silent && wasDismissed(remoteVersion)) {
      console.log(`[AutoUpdater] Version ${remoteVersion} was dismissed.`);
      return { status: 'dismissed', currentVersion, remoteVersion };
    }

    console.log(`[AutoUpdater] New version available: ${remoteVersion}`);

    return {
      status: 'available',
      currentVersion,
      remoteVersion,
      downloadUrl: assetDownloadUrl,
      assetName,
      releasePageUrl,
    };
  } catch (error) {
    const raw = error instanceof Error ? error.message : 'Could not check for updates.';
    console.warn('[AutoUpdater] Check failed:', raw);

    let message = 'Could not check for updates. Please check your internet connection.';
    if (raw.includes('Not Found') || raw.includes('404')) {
      message = 'No releases found. The GitHub repo may be private or has no releases yet.';
    }

    return { status: 'error', currentVersion, message };
  }
}

/**
 * Download the update asset to a temp file.
 * Returns the path to the downloaded file.
 */
function downloadFile(url, destPath, onProgress) {
  return new Promise((resolve, reject) => {
    const request = net.request(url);
    request.setHeader('User-Agent', 'JarvisAI-Updater');

    request.on('response', (response) => {
      // Follow redirects (GitHub uses 302 for asset downloads)
      if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
        const redirectUrl = Array.isArray(response.headers.location) ? response.headers.location[0] : response.headers.location;
        downloadFile(redirectUrl, destPath, onProgress).then(resolve).catch(reject);
        return;
      }

      if (response.statusCode >= 400) {
        reject(new Error(`Download failed: HTTP ${response.statusCode}`));
        return;
      }

      const contentLength = parseInt(
        (Array.isArray(response.headers['content-length']) ? response.headers['content-length'][0] : response.headers['content-length']) || '0',
        10
      );

      const file = fs.createWriteStream(destPath);
      let downloaded = 0;

      response.on('data', (chunk) => {
        file.write(chunk);
        downloaded += chunk.length;
        if (contentLength > 0 && onProgress) {
          onProgress(Math.min(100, Math.round((downloaded / contentLength) * 100)));
        }
      });

      response.on('end', () => {
        file.end(() => resolve(destPath));
      });

      response.on('error', (err) => {
        file.close();
        fs.unlink(destPath, () => {});
        reject(err);
      });
    });

    request.on('error', reject);
    request.end();
  });
}

async function downloadUpdate(downloadUrl, assetName) {
  if (!downloadUrl) {
    throw new Error('No download URL provided.');
  }

  const tempDir = app.getPath('temp');
  const fileName = assetName || path.basename(new URL(downloadUrl).pathname) || 'jarvis-update.exe';
  const destPath = path.join(tempDir, fileName);

  console.log(`[AutoUpdater] Downloading update to: ${destPath}`);
  await downloadFile(downloadUrl, destPath);
  console.log(`[AutoUpdater] Download complete: ${destPath}`);

  return destPath;
}

async function installAndRestart(filePath) {
  const ext = path.extname(filePath).toLowerCase();

  if (ext === '.exe') {
    // Use shell.openPath which respects Windows security policies
    // (spawn can fail with EACCES on downloaded executables)
    console.log(`[AutoUpdater] Launching installer via shell: ${filePath}`);
    const error = await shell.openPath(filePath);
    if (error) {
      console.error(`[AutoUpdater] Failed to launch installer: ${error}`);
      // Fallback: show the file in explorer so user can run it manually
      shell.showItemInFolder(filePath);
      return false;
    }
    setTimeout(() => app.quit(), 1500);
    return true;
  }

  // For .zip or other files, open the containing folder
  console.log(`[AutoUpdater] Opening download folder for: ${filePath}`);
  shell.showItemInFolder(filePath);
  return false;
}

function startAutoUpdateSchedule() {
  setTimeout(() => checkForUpdates(true), 10_000);
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
  downloadUpdate,
  installAndRestart,
  dismissVersion,
  startAutoUpdateSchedule,
  stopAutoUpdateSchedule,
  getCurrentVersion,
};
