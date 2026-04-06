const { app, BrowserWindow, ipcMain, nativeImage, Tray, Menu, dialog } = require('electron');
const path = require('path');

// Set the app name shown in taskbar / dock
app.setName('Jarvis AI BETA');

let win;
let tray = null;
let isQuitting = false;

function createTray() {
  const iconPath = path.join(__dirname, '..', 'public', 'jarvis-icon.png');
  const icon = nativeImage.createFromPath(iconPath).resize({ width: 16, height: 16 });
  tray = new Tray(icon);
  tray.setToolTip('Jarvis AI');

  const contextMenu = Menu.buildFromTemplate([
    { label: 'Show Jarvis', click: () => { win.show(); win.focus(); } },
    { type: 'separator' },
    { label: 'Quit', click: () => { isQuitting = true; app.quit(); } },
  ]);
  tray.setContextMenu(contextMenu);

  tray.on('double-click', () => { win.show(); win.focus(); });
}

function createWindow() {
  const iconPath = path.join(__dirname, '..', 'public', 'jarvis-icon.png');
  const icon = nativeImage.createFromPath(iconPath);

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
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      preload: path.join(__dirname, 'preload.cjs'),
    },
  });

  // In dev, load Vite dev server; in prod, load built files
  const isDev = !app.isPackaged;
  if (isDev) {
    win.loadURL('http://localhost:8080');
  } else {
    win.loadFile(path.join(__dirname, '..', 'dist', 'index.html'));
  }

  // Window control IPC
  ipcMain.on('window-minimize', () => win.minimize());
  ipcMain.on('window-maximize', () => {
    if (win.isMaximized()) win.unmaximize();
    else win.maximize();
  });
  ipcMain.on('window-close', () => win.close());
  ipcMain.handle('window-is-maximized', () => win.isMaximized());

  win.on('maximize', () => win.webContents.send('window-maximized', true));
  win.on('unmaximize', () => win.webContents.send('window-maximized', false));

  // Intercept close — ask user whether to minimize to tray or quit
  win.on('close', (e) => {
    if (isQuitting) return; // Actually quit

    e.preventDefault();
    win.webContents.send('confirm-close');
  });

  // Listen for the user's choice from the renderer
  ipcMain.on('close-action', (_event, action) => {
    if (action === 'tray') {
      win.hide();
    } else {
      isQuitting = true;
      app.quit();
    }
  });

  createTray();
}

// Auto-launch on boot (Windows/Linux)
const gotLock = app.requestSingleInstanceLock();
if (!gotLock) {
  app.quit();
} else {
  app.on('second-instance', () => {
    if (win) { win.show(); win.focus(); }
  });

  app.whenReady().then(() => {
    // Enable auto-launch
    app.setLoginItemSettings({ openAtLogin: true, name: 'Jarvis AI' });
    createWindow();
  });
}

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (win) { win.show(); win.focus(); }
  else createWindow();
});

app.on('before-quit', () => { isQuitting = true; });
