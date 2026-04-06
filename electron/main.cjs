const { app, BrowserWindow, ipcMain, nativeImage, Tray, Menu, dialog, shell } = require('electron');
const { execSync } = require('child_process');
const path = require('path');

app.setName('Jarvis AI BETA');

app.setLoginItemSettings({
  openAtLogin: true,
  path: app.getPath('exe'),
});

let mainWindow = null;
let tray = null;
let forceQuit = false;
let closePromptOpen = false;

function showMainWindow() {
  if (!mainWindow || mainWindow.isDestroyed()) return;

  mainWindow.setSkipTaskbar(false);

  if (mainWindow.isMinimized()) {
    mainWindow.restore();
  }

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
  closePromptOpen = false;

  if (tray) {
    tray.destroy();
    tray = null;
  }

  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.once('closed', () => {
      app.quit();
    });
    mainWindow.close();
    return;
  }

  app.quit();
}

async function promptCloseAction() {
  if (!mainWindow || mainWindow.isDestroyed() || closePromptOpen) return;

  closePromptOpen = true;

  try {
    const { response } = await dialog.showMessageBox(mainWindow, {
      type: 'question',
      buttons: ['Keep Running in Tray', 'Quit Completely'],
      defaultId: 0,
      cancelId: 0,
      noLink: true,
      title: 'Close Jarvis',
      message: 'Keep Jarvis running in the background?',
      detail:
        'Choose “Keep Running in Tray” to hide Jarvis and keep it available from the system tray, or “Quit Completely” to close the app.',
    });

    if (response === 0) {
      setTimeout(() => hideMainWindowToTray(), 0);
      return;
    }

    setTimeout(() => quitApplication(), 0);
  } finally {
    closePromptOpen = false;
  }
}

function createTray() {
  if (tray) return;

  const iconPath = path.join(__dirname, '..', 'public', 'jarvis-icon.png');
  const trayIcon = nativeImage.createFromPath(iconPath).resize({ width: 16, height: 16 });

  tray = new Tray(trayIcon);
  tray.setToolTip('Jarvis AI BETA');
  tray.setContextMenu(
    Menu.buildFromTemplate([
      {
        label: 'Open Jarvis',
        click: showMainWindow,
      },
      { type: 'separator' },
      {
        label: 'Quit',
        click: quitApplication,
      },
    ])
  );

  tray.on('click', showMainWindow);
  tray.on('double-click', showMainWindow);
}

function createWindow() {
  const iconPath = path.join(__dirname, '..', 'public', 'jarvis-icon.png');
  const icon = nativeImage.createFromPath(iconPath);

  mainWindow = new BrowserWindow({
    width: 1280,
    height: 860,
    minWidth: 900,
    minHeight: 600,
    frame: false,
    titleBarStyle: 'hidden',
    icon,
    title: 'Jarvis AI BETA',
    backgroundColor: '#0e1117',
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      preload: path.join(__dirname, 'preload.cjs'),
    },
  });

  const isDev = !app.isPackaged;
  if (isDev) {
    mainWindow.loadURL('http://localhost:8080');
  } else {
    mainWindow.loadFile(path.join(__dirname, '..', 'dist', 'index.html'));
  }

  mainWindow.on('maximize', () => {
    if (!mainWindow || mainWindow.isDestroyed()) return;
    mainWindow.webContents.send('window-maximized', true);
  });

  mainWindow.on('unmaximize', () => {
    if (!mainWindow || mainWindow.isDestroyed()) return;
    mainWindow.webContents.send('window-maximized', false);
  });

  mainWindow.on('close', (event) => {
    if (forceQuit) return;

    event.preventDefault();
    promptCloseAction();
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

ipcMain.on('window-minimize', () => {
  if (!mainWindow || mainWindow.isDestroyed()) return;
  mainWindow.minimize();
});

ipcMain.on('window-maximize', () => {
  if (!mainWindow || mainWindow.isDestroyed()) return;

  if (mainWindow.isMaximized()) {
    mainWindow.unmaximize();
    return;
  }

  mainWindow.maximize();
});

ipcMain.on('window-close', () => {
  promptCloseAction();
});

ipcMain.handle('window-close', async () => {
  await promptCloseAction();
  return null;
});

ipcMain.on('window-hide-to-tray', () => {
  hideMainWindowToTray();
});

ipcMain.handle('window-hide-to-tray', () => {
  hideMainWindowToTray();
  return null;
});

ipcMain.on('app-quit', () => {
  quitApplication();
});

ipcMain.handle('app-quit', () => {
  quitApplication();
  return null;
});

ipcMain.handle('window-is-maximized', () => {
  return Boolean(mainWindow && !mainWindow.isDestroyed() && mainWindow.isMaximized());
});

ipcMain.on('open-url', (_event, url) => {
  if (typeof url === 'string' && (url.startsWith('http') || url.startsWith('spotify:'))) {
    shell.openExternal(url);
  }
});

ipcMain.on('media-key', (_event, key) => {
  const keyMap = {
    'play-pause': 'media_play_pause',
    'next': 'media_next_track',
    'previous': 'media_prev_track',
    'stop': 'media_stop',
  };
  const nircmdKey = keyMap[key];
  if (nircmdKey) {
    try {
      // Use PowerShell to simulate media keys
      execSync(`powershell -Command "(New-Object -ComObject WScript.Shell).SendKeys([char]0xB3)"`, { stdio: 'ignore' });
    } catch {}
  }
});

app.on('before-quit', () => {
  forceQuit = true;
});

app.whenReady().then(() => {
  createTray();
  createWindow();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow && !mainWindow.isDestroyed()) {
    showMainWindow();
    return;
  }

  createWindow();
});
