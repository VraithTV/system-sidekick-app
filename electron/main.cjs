const { app, BrowserWindow, ipcMain, nativeImage, Tray, Menu, shell, globalShortcut, Notification } = require('electron');
const path = require('path');
const fs = require('fs');
const os = require('os');
const { exec } = require('child_process');
const { checkForUpdates, downloadUpdate, installAndRestart, dismissVersion, startAutoUpdateSchedule, stopAutoUpdateSchedule, getCurrentVersion } = require('./autoUpdater.cjs');

app.setName('Jarvis AI BETA');

if (process.platform === 'win32') {
  app.setAppUserModelId('com.jarvis.ai');
}

// ─── Single Instance Lock ────────────────────────────────────
const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
  app.quit();
} else {
  app.on('second-instance', () => {
    showMainWindow();
  });
}

// ─── Fresh-install detection ─────────────────────────────────
// When the user uninstalls and reinstalls, the exe path changes.
// We store the exe path in a stamp file; if it differs we wipe
// localStorage so onboarding runs again.
const STAMP_FILE = path.join(app.getPath('userData'), '.install-stamp');
function checkFreshInstall() {
  const currentExe = app.getPath('exe');
  try {
    const saved = fs.readFileSync(STAMP_FILE, 'utf-8').trim();
    if (saved === currentExe) return; // same install, do nothing
  } catch {}
  // New install or first run: write stamp and clear session data on window load
  fs.writeFileSync(STAMP_FILE, currentExe, 'utf-8');
  global.__jarvisFreshInstall = true;
}
checkFreshInstall();

app.setLoginItemSettings({
  openAtLogin: true,
  path: app.getPath('exe'),
});

let mainWindow = null;
let splashWindow = null;
let tray = null;
let forceQuit = false;

// Ensure Jarvis clips folder exists
const JARVIS_FOLDER = path.join('C:', 'Jarvis');
const CLIPS_FOLDER = path.join(JARVIS_FOLDER, 'Clips');
try {
  if (!fs.existsSync(JARVIS_FOLDER)) fs.mkdirSync(JARVIS_FOLDER, { recursive: true });
  if (!fs.existsSync(CLIPS_FOLDER)) fs.mkdirSync(CLIPS_FOLDER, { recursive: true });
} catch (e) {
  console.warn('Could not create Jarvis folder:', e.message);
}

function showMainWindow() {
  if (!mainWindow || mainWindow.isDestroyed()) return;
  mainWindow.setSkipTaskbar(false);
  if (mainWindow.isMinimized()) mainWindow.restore();
  mainWindow.show();
  mainWindow.focus();
}

function hideMainWindowToTray() {
  if (!mainWindow || mainWindow.isDestroyed()) return;
  createTray();
  mainWindow.setSkipTaskbar(true);
  mainWindow.hide();
}

function quitApplication() {
  forceQuit = true;
  if (tray) { tray.destroy(); tray = null; }
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.once('closed', () => app.quit());
    mainWindow.close();
    return;
  }
  app.quit();
}

function getIconPath(name) {
  // In packaged app, public/ is copied into dist/ by Vite; check dist first, then public
  const distPath = path.join(__dirname, '..', 'dist', name);
  if (fs.existsSync(distPath)) return distPath;
  return path.join(__dirname, '..', 'public', name);
}

function createTray() {
  if (tray) return;
  const trayIconName = process.platform === 'win32' ? 'jarvis-icon.ico' : 'jarvis-icon.png';
  const iconPath = getIconPath(trayIconName);
  const trayIcon = nativeImage.createFromPath(iconPath).resize({ width: 16, height: 16 });
  tray = new Tray(trayIcon);
  tray.setToolTip('Jarvis AI BETA');
  tray.setContextMenu(Menu.buildFromTemplate([
    { label: 'Open Jarvis', click: showMainWindow },
    { type: 'separator' },
    { label: 'Quit', click: quitApplication },
  ]));
  tray.on('click', showMainWindow);
  tray.on('double-click', showMainWindow);
}

function createSplashWindow() {
  const iconPath = getIconPath(process.platform === 'win32' ? 'jarvis-icon.ico' : 'jarvis-icon.png');
  const icon = nativeImage.createFromPath(iconPath);

  splashWindow = new BrowserWindow({
    width: 400, height: 350,
    frame: false, transparent: true, resizable: false,
    alwaysOnTop: true, icon,
    skipTaskbar: true,
    webPreferences: { contextIsolation: true, nodeIntegration: false },
  });

  splashWindow.loadFile(path.join(__dirname, 'splash.html'));
  splashWindow.center();
}

function createWindow() {
  const iconPath = getIconPath(process.platform === 'win32' ? 'jarvis-icon.ico' : 'jarvis-icon.png');
  const icon = nativeImage.createFromPath(iconPath);

  mainWindow = new BrowserWindow({
    width: 1280, height: 860, minWidth: 900, minHeight: 600,
    frame: false, titleBarStyle: 'hidden', icon,
    title: 'Jarvis AI BETA', backgroundColor: '#0e1117',
    show: false, // Don't show until ready
    webPreferences: {
      contextIsolation: true, nodeIntegration: false,
      devTools: !app.isPackaged,
      preload: path.join(__dirname, 'preload.cjs'),
    },
  });

  // Auto-grant microphone and camera permissions in Electron
  mainWindow.webContents.session.setPermissionRequestHandler((_webContents, permission, callback) => {
    const allowed = ['media', 'microphone', 'camera', 'audioCapture'].includes(permission);
    callback(allowed);
  });

  mainWindow.webContents.session.setDevicePermissionHandler((_details) => true);

  if (!icon.isEmpty()) {
    mainWindow.setIcon(icon);
  }

  // If fresh install, clear localStorage before loading
  if (global.__jarvisFreshInstall) {
    mainWindow.webContents.session.clearStorageData({ storages: ['localstorage'] }).then(() => {
      global.__jarvisFreshInstall = false;
      loadApp();
    }).catch(() => loadApp());
  } else {
    loadApp();
  }

  function loadApp() {
    const distPath = path.join(__dirname, '..', 'dist', 'index.html');
    const hasDist = fs.existsSync(distPath);
    if (!app.isPackaged && !hasDist) {
      mainWindow.loadURL('http://localhost:8080');
    } else {
      mainWindow.loadFile(distPath);
    }
  }

  // When the main window is ready, close splash and show main
  mainWindow.webContents.on('did-finish-load', () => {
    setTimeout(() => {
      if (splashWindow && !splashWindow.isDestroyed()) {
        splashWindow.close();
        splashWindow = null;
      }
      if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.show();
        mainWindow.focus();
      }
    }, 30000); // 30-second splash screen
  });

  mainWindow.on('maximize', () => {
    if (!mainWindow || mainWindow.isDestroyed()) return;
    mainWindow.webContents.send('window-maximized', true);
  });
  mainWindow.on('unmaximize', () => {
    if (!mainWindow || mainWindow.isDestroyed()) return;
    mainWindow.webContents.send('window-maximized', false);
  });
  mainWindow.on('close', (event) => {
    if (forceQuit || !mainWindow || mainWindow.isDestroyed()) return;
    event.preventDefault();
    showMainWindow();
    mainWindow.webContents.send('request-close-action');
  });
  mainWindow.on('closed', () => { mainWindow = null; });
}

// ─── Global Keyboard Shortcuts ───────────────────────────────

function registerShortcuts() {
  // Show / Hide Jarvis
  globalShortcut.register('CommandOrControl+Shift+J', () => {
    if (!mainWindow || mainWindow.isDestroyed()) return;
    if (mainWindow.isVisible()) {
      hideMainWindowToTray();
    } else {
      showMainWindow();
    }
  });

  // Toggle Mic
  globalShortcut.register('CommandOrControl+Shift+M', () => {
    if (!mainWindow || mainWindow.isDestroyed()) return;
    mainWindow.webContents.send('shortcut', 'toggle-mic');
  });

  // Toggle Recording
  globalShortcut.register('CommandOrControl+Shift+R', () => {
    if (!mainWindow || mainWindow.isDestroyed()) return;
    mainWindow.webContents.send('shortcut', 'toggle-recording');
  });

  // Clip last N seconds
  globalShortcut.register('CommandOrControl+Shift+C', () => {
    if (!mainWindow || mainWindow.isDestroyed()) return;
    mainWindow.webContents.send('shortcut', 'clip-now');
    showClipNotification();
  });

  // Push to Talk (hold)
  globalShortcut.register('CommandOrControl+Space', () => {
    if (!mainWindow || mainWindow.isDestroyed()) return;
    mainWindow.webContents.send('shortcut', 'push-to-talk');
  });
}

function showClipNotification(filename) {
  if (!Notification.isSupported()) return;
  const notif = new Notification({
    title: 'Clip Saved',
    body: filename ? `Saved: ${filename}` : 'Your clip has been saved!',
    icon: path.join(__dirname, '..', 'public', 'jarvis-icon.png'),
    silent: false,
  });
  notif.show();
  notif.on('click', () => {
    shell.openPath(CLIPS_FOLDER);
  });
}

// ─── IPC Handlers ────────────────────────────────────────────

// Window controls
ipcMain.on('window-minimize', () => {
  if (!mainWindow || mainWindow.isDestroyed()) return;
  mainWindow.minimize();
});
ipcMain.on('window-maximize', () => {
  if (!mainWindow || mainWindow.isDestroyed()) return;
  mainWindow.isMaximized() ? mainWindow.unmaximize() : mainWindow.maximize();
});
ipcMain.on('window-close', () => quitApplication());
ipcMain.handle('window-close', async () => { quitApplication(); return null; });
ipcMain.on('window-hide-to-tray', () => hideMainWindowToTray());
ipcMain.handle('window-hide-to-tray', () => { hideMainWindowToTray(); return null; });
ipcMain.on('app-quit', () => quitApplication());
ipcMain.handle('app-quit', () => { quitApplication(); return null; });
ipcMain.handle('window-is-maximized', () => {
  return Boolean(mainWindow && !mainWindow.isDestroyed() && mainWindow.isMaximized());
});

// URL opening
ipcMain.on('open-url', (_event, url) => {
  if (typeof url === 'string' && (url.startsWith('http') || url.startsWith('spotify:'))) {
    shell.openExternal(url);
  }
});

// Launch app by ID using shell.openExternal (no child_process needed)
ipcMain.handle('open-app', (_event, appId) => {
  const windowsCommandMap = {
    chrome: 'chrome',
    edge: 'msedge',
    firefox: 'firefox',
    brave: 'brave',
    explorer: 'explorer',
    notepad: 'notepad',
    'task-manager': 'taskmgr',
    obs: 'obs64',
    terminal: 'wt',
  };

  const urlLaunchMap = {
    spotify: 'spotify:',
    discord: 'discord:',
    steam: 'steam://',
    vscode: 'vscode:',
    slack: 'slack:',
    telegram: 'tg:',
    whatsapp: 'whatsapp:',
    word: 'ms-word:',
    excel: 'ms-excel:',
    youtube: 'https://youtube.com',
    netflix: 'https://netflix.com',
    twitch: 'https://twitch.tv',
    twitter: 'https://x.com',
    github: 'https://github.com',
    chatgpt: 'https://chat.openai.com',
    calculator: 'calculator:',
  };

  const command = windowsCommandMap[appId];
  if (process.platform === 'win32' && command) {
    exec(`start "" ${command}`, { shell: 'cmd.exe' }, () => {});
    return null;
  }

  const uri = urlLaunchMap[appId];
  if (uri) {
    shell.openExternal(uri).catch(() => {});
  }
  return null;
});

// Media keys - no-op placeholder (PowerShell keybd_event removed to avoid AV flags)
ipcMain.on('media-key', (_event, _key) => {
  // Media key simulation removed - use Spotify API for playback control instead
});

// Clips folder
ipcMain.on('open-clips-folder', () => {
  shell.openPath(CLIPS_FOLDER);
});
ipcMain.handle('open-clips-folder', () => {
  shell.openPath(CLIPS_FOLDER);
  return null;
});

// Clip now (save clip notification)
ipcMain.on('clip-now', (_event, duration) => {
  const filename = `Clip_${new Date().toISOString().replace(/[:.]/g, '-')}.mp4`;
  showClipNotification(filename);
  // In a full implementation, this would trigger the screen recorder to save the buffer
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send('clip-saved', {
      id: Date.now().toString(),
      filename,
      duration: duration || 30,
      timestamp: new Date().toISOString(),
      size: `${((duration || 30) * 2.5).toFixed(1)} MB`,
    });
  }
});

// Get clips folder path
ipcMain.handle('get-clips-folder', () => CLIPS_FOLDER);

// Spotify OAuth popup flow
ipcMain.handle('spotify-auth-flow', (_event, authUrl) => {
  return new Promise((resolve) => {
    const authWin = new BrowserWindow({
      width: 500, height: 700,
      parent: mainWindow,
      modal: true,
      webPreferences: { contextIsolation: true, nodeIntegration: false },
    });
    authWin.loadURL(authUrl);

    // Intercept the redirect back to 127.0.0.1:8080
    authWin.webContents.on('will-redirect', (_e, url) => {
      if (url.startsWith('http://127.0.0.1:8080')) {
        const code = new URL(url).searchParams.get('code');
        authWin.close();
        resolve({ code });
      }
    });
    authWin.webContents.on('will-navigate', (_e, url) => {
      if (url.startsWith('http://127.0.0.1:8080')) {
        const code = new URL(url).searchParams.get('code');
        authWin.close();
        resolve({ code });
      }
    });
    authWin.on('closed', () => resolve({ code: null }));
  });
});

// Auto-updater — return version info to renderer (no native dialogs)
ipcMain.handle('check-for-updates', () => checkForUpdates(false));
ipcMain.handle('get-app-version', () => getCurrentVersion());
ipcMain.handle('download-update', async (_event, downloadUrl, assetName) => {
  try {
    const filePath = await downloadUpdate(downloadUrl, assetName);
    return { status: 'downloaded', filePath };
  } catch (error) {
    return { status: 'error', message: error instanceof Error ? error.message : 'Download failed.' };
  }
});
ipcMain.handle('install-update', (_event, filePath) => {
  const launched = installAndRestart(filePath);
  return { launched };
});
ipcMain.handle('dismiss-update', (_event, version) => {
  dismissVersion(version);
  return null;
});

// ─── App Lifecycle ───────────────────────────────────────────

app.on('before-quit', () => { forceQuit = true; });

app.whenReady().then(() => {
  createSplashWindow();
  createTray();
  createWindow();
  registerShortcuts();
  startAutoUpdateSchedule();
});

app.on('will-quit', () => {
  globalShortcut.unregisterAll();
  stopAutoUpdateSchedule();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (mainWindow && !mainWindow.isDestroyed()) {
    showMainWindow();
    return;
  }
  createWindow();
});
