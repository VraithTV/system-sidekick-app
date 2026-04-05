const { app, BrowserWindow, Menu, Tray, dialog, ipcMain, nativeImage } = require('electron');
const fs = require('fs');
const path = require('path');

app.setName('Jarvis AI BETA');
app.setAppUserModelId('com.jarvis.ai');

const isDev = !app.isPackaged;

let win = null;
let tray = null;
let isQuitting = false;
let closeDialogOpen = false;

function getAppIcon() {
  const iconPath = path.join(__dirname, '..', 'public', 'jarvis-icon.png');
  return nativeImage.createFromPath(iconPath);
}

function getInstallFingerprint() {
  try {
    const stats = fs.statSync(app.getPath('exe'));
    return `${app.getVersion()}-${Math.round(stats.mtimeMs)}`;
  } catch {
    return app.getVersion();
  }
}

function showMainWindow() {
  if (!win) return;
  win.setSkipTaskbar(false);
  if (!win.isVisible()) win.show();
  if (win.isMinimized()) win.restore();
  win.focus();
}

function quitApp() {
  isQuitting = true;
  app.quit();
}

function createTray() {
  if (tray) return;

  const icon = getAppIcon();
  tray = new Tray(icon.isEmpty() ? nativeImage.createEmpty() : icon);
  tray.setToolTip('Jarvis AI BETA');
  tray.on('click', showMainWindow);
  tray.on('double-click', showMainWindow);
  tray.setContextMenu(
    Menu.buildFromTemplate([
      { label: 'Open Jarvis', click: showMainWindow },
      { type: 'separator' },
      { label: 'Exit Jarvis', click: quitApp },
    ])
  );
}

function keepRunningInBackground() {
  if (!win) return;
  createTray();
  win.setSkipTaskbar(true);
  win.hide();
}

async function handleCloseRequest() {
  if (!win || isQuitting) return true;
  if (closeDialogOpen) return false;

  closeDialogOpen = true;

  try {
    const { response } = await dialog.showMessageBox(win, {
      type: 'question',
      buttons: ['Keep Running', 'Exit Jarvis'],
      defaultId: 0,
      cancelId: 0,
      noLink: true,
      title: 'Close Jarvis',
      message: 'Would you like to exit Jarvis or keep it running in the background?',
      detail: 'Keeping it running leaves Jarvis available from the system tray.',
    });

    if (response === 0) {
      keepRunningInBackground();
      return false;
    }

    quitApp();
    return true;
  } finally {
    closeDialogOpen = false;
  }
}

function createWindow() {
  const icon = getAppIcon();

  win = new BrowserWindow({
    width: 1280,
    height: 860,
    minWidth: 900,
    minHeight: 600,
    frame: false,
    titleBarStyle: 'hidden',
    icon,
    title: 'Jarvis AI BETA',
    backgroundColor: '#0e1117',
    autoHideMenuBar: !isDev,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      preload: path.join(__dirname, 'preload.cjs'),
      devTools: isDev,
    },
  });

  if (!isDev) {
    win.removeMenu();
  }

  if (isDev) {
    win.loadURL('http://localhost:8080');
  } else {
    win.loadFile(path.join(__dirname, '..', 'dist', 'index.html'));
  }

  if (!isDev) {
    win.webContents.on('before-input-event', (event, input) => {
      const key = String(input.key || '').toLowerCase();
      const blockedCtrlShift = input.control && input.shift && ['i', 'j', 'c'].includes(key);
      const blockedMetaAlt = input.meta && input.alt && ['i', 'j', 'c'].includes(key);

      if (blockedCtrlShift || blockedMetaAlt || key === 'f12') {
        event.preventDefault();
      }
    });

    win.webContents.on('devtools-opened', () => {
      win.webContents.closeDevTools();
    });
  }

  win.on('maximize', () => win?.webContents.send('window-maximized', true));
  win.on('unmaximize', () => win?.webContents.send('window-maximized', false));
  win.on('show', () => win?.setSkipTaskbar(false));
  win.on('closed', () => {
    win = null;
  });
  win.on('close', async (event) => {
    if (isQuitting) return;
    event.preventDefault();
    await handleCloseRequest();
  });
}

ipcMain.on('window-minimize', () => win?.minimize());
ipcMain.on('window-maximize', () => {
  if (!win) return;
  if (win.isMaximized()) win.unmaximize();
  else win.maximize();
});
ipcMain.handle('window-is-maximized', () => win?.isMaximized() ?? false);
ipcMain.handle('window-close-request', () => handleCloseRequest());
ipcMain.on('app-set-launch-on-startup', (_event, enabled) => {
  try {
    app.setLoginItemSettings({ openAtLogin: !!enabled });
  } catch (error) {
    console.error('Failed to update launch-on-startup setting:', error);
  }
});
ipcMain.handle('app-get-launch-on-startup', () => {
  try {
    return app.getLoginItemSettings().openAtLogin;
  } catch {
    return false;
  }
});
ipcMain.handle('app-get-info', () => ({
  version: app.getVersion(),
  installFingerprint: getInstallFingerprint(),
  isPackaged: app.isPackaged,
}));

app.whenReady().then(() => {
  createTray();
  createWindow();
});

app.on('before-quit', () => {
  isQuitting = true;
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
  else showMainWindow();
});