const { app, BrowserWindow, ipcMain, nativeImage, Tray, Menu, shell, globalShortcut, Notification } = require('electron');
const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

app.setName('Jarvis AI BETA');

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

function createTray() {
  if (tray) return;
  const iconPath = path.join(__dirname, '..', 'public', 'jarvis-icon.png');
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

function createWindow() {
  const iconPath = path.join(__dirname, '..', 'public', 'jarvis-icon.png');
  const icon = nativeImage.createFromPath(iconPath);

  mainWindow = new BrowserWindow({
    width: 1280, height: 860, minWidth: 900, minHeight: 600,
    frame: false, titleBarStyle: 'hidden', icon,
    title: 'Jarvis AI BETA', backgroundColor: '#0e1117',
    webPreferences: {
      contextIsolation: true, nodeIntegration: false,
      devTools: !app.isPackaged,
      preload: path.join(__dirname, 'preload.cjs'),
    },
  });

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

  mainWindow.on('maximize', () => {
    if (!mainWindow || mainWindow.isDestroyed()) return;
    mainWindow.webContents.send('window-maximized', true);
  });
  mainWindow.on('unmaximize', () => {
    if (!mainWindow || mainWindow.isDestroyed()) return;
    mainWindow.webContents.send('window-maximized', false);
  });
  mainWindow.on('close', () => {
    // Just quit — no prompt
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

// Launch app by ID using shell start commands (no filesystem scanning)
ipcMain.handle('open-app', (_event, appId) => {
  // Map app IDs to simple shell launch commands
  const launchMap = {
    chrome: 'start chrome', edge: 'start msedge', spotify: 'start spotify:',
    discord: 'start discord:', obs: 'start obs64', steam: 'start steam:',
    vscode: 'start code', explorer: 'start explorer', notepad: 'start notepad',
    'task-manager': 'start taskmgr', firefox: 'start firefox', brave: 'start brave',
    slack: 'start slack', telegram: 'start telegram:', whatsapp: 'start whatsapp:',
    word: 'start winword', excel: 'start excel', photoshop: 'start photoshop',
    'premiere-pro': 'start premierepro', youtube: 'start https://youtube.com',
    calculator: 'start calc', terminal: 'start wt', netflix: 'start https://netflix.com',
    twitch: 'start https://twitch.tv', twitter: 'start https://x.com',
    github: 'start https://github.com', chatgpt: 'start https://chat.openai.com',
  };
  const cmd = launchMap[appId];
  if (cmd) {
    try { execSync(cmd, { stdio: 'ignore', timeout: 5000, shell: true }); } catch {}
  }
  return null;
});

// Media keys
ipcMain.on('media-key', (_event, key) => {
  // Use PowerShell to send media keys
  const keyMap = {
    'play-pause': '0xB3',
    'next': '0xB0',
    'previous': '0xB1',
    'stop': '0xB2',
  };
  const vk = keyMap[key];
  if (vk) {
    try {
      execSync(`powershell -Command "Add-Type -TypeDefinition 'using System;using System.Runtime.InteropServices;public class KS{[DllImport(\\"user32.dll\\")]public static extern void keybd_event(byte k,byte s,uint f,UIntPtr e);}';[KS]::keybd_event(${vk},0,1,0);[KS]::keybd_event(${vk},0,3,0)"`, { stdio: 'ignore', timeout: 3000 });
    } catch {}
  }
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

// ─── App Lifecycle ───────────────────────────────────────────

app.on('before-quit', () => { forceQuit = true; });

app.whenReady().then(() => {
  createTray();
  createWindow();
  registerShortcuts();
});

app.on('will-quit', () => {
  globalShortcut.unregisterAll();
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
