const { app, BrowserWindow, ipcMain, nativeImage } = require('electron');
const path = require('path');

// Set the app name shown in taskbar / dock
app.setName('Jarvis AI BETA');

function createWindow() {
  const iconPath = path.join(__dirname, '..', 'public', 'jarvis-icon.png');
  const icon = nativeImage.createFromPath(iconPath);

  const win = new BrowserWindow({
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

  // Disable DevTools in production
  if (!isDev) {
    win.webContents.on('before-input-event', (event, input) => {
      // Block Ctrl+Shift+I, Ctrl+Shift+J, F12
      if (
        (input.control && input.shift && (input.key === 'I' || input.key === 'i' || input.key === 'J' || input.key === 'j')) ||
        input.key === 'F12'
      ) {
        event.preventDefault();
      }
    });
    win.webContents.on('devtools-opened', () => {
      win.webContents.closeDevTools();
    });
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
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});