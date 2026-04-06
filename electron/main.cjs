const { app, BrowserWindow, ipcMain, nativeImage, Tray, Menu, dialog } = require('electron');
const path = require('path');

// Set the app name shown in taskbar / dock
app.setName('Jarvis AI BETA');

// Auto-launch on Windows login
app.setLoginItemSettings({
  openAtLogin: true,
  path: app.getPath('exe'),
});

let mainWindow = null;
let tray = null;
let forceQuit = false;

function createTray() {
  const iconPath = path.join(__dirname, '..', 'public', 'jarvis-icon.png');
  tray = new Tray(nativeImage.createFromPath(iconPath).resize({ width: 16, height: 16 }));
  tray.setToolTip('Jarvis AI BETA');

  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Open Jarvis',
      click: () => {
        if (mainWindow) {
          mainWindow.show();
          mainWindow.focus();
        }
      },
    },
    { type: 'separator' },
    {
      label: 'Quit',
      click: () => {
        forceQuit = true;
        app.quit();
      },
    },
  ]);

  tray.setContextMenu(contextMenu);
  tray.on('double-click', () => {
    if (mainWindow) {
      mainWindow.show();
      mainWindow.focus();
    }
  });
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

  // In dev, load Vite dev server; in prod, load published Lovable URL
  const isDev = !app.isPackaged;
  if (isDev) {
    mainWindow.loadURL('http://localhost:8080');
  } else {
    mainWindow.loadURL('https://system-sidekick-app.lovable.app');
  }

  // Window control IPC
  ipcMain.on('window-minimize', () => mainWindow.minimize());
  ipcMain.on('window-maximize', () => {
    if (mainWindow.isMaximized()) mainWindow.unmaximize();
    else mainWindow.maximize();
  });
  ipcMain.on('window-close', () => mainWindow.close());
  ipcMain.handle('window-is-maximized', () => mainWindow.isMaximized());

  mainWindow.on('maximize', () => mainWindow.webContents.send('window-maximized', true));
  mainWindow.on('unmaximize', () => mainWindow.webContents.send('window-maximized', false));

  // Intercept close to ask user
  mainWindow.on('close', (e) => {
    if (forceQuit) return;

    e.preventDefault();
    dialog
      .showMessageBox(mainWindow, {
        type: 'question',
        buttons: ['Minimize to Tray', 'Exit'],
        defaultId: 0,
        cancelId: 0,
        title: 'Close Jarvis',
        message: 'What would you like to do?',
        detail:
          'Minimize to system tray to keep Jarvis running in the background, or exit completely.',
      })
      .then(({ response }) => {
        if (response === 0) {
          mainWindow.hide();
        } else {
          forceQuit = true;
          mainWindow.destroy();
          app.quit();
        }
      });
  });
}

app.whenReady().then(() => {
  createTray();
  createWindow();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
