const { app, BrowserWindow, ipcMain, nativeImage, Tray, Menu, shell, globalShortcut, Notification } = require('electron');
const path = require('path');
const fs = require('fs');
const os = require('os');
const { exec } = require('child_process');
const { checkForUpdates, downloadUpdate, downloadFile, installAndRestart, dismissVersion, startAutoUpdateSchedule, stopAutoUpdateSchedule, getCurrentVersion } = require('./autoUpdater.cjs');

app.setName(`Jarvis AI BETA ${getCurrentVersion()}`);

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
// Use a unique install ID; if the app is uninstalled and reinstalled,
// the installer creates a new directory or clears the old one, so
// the stamp file won't exist and we wipe localStorage.
const STAMP_FILE = path.join(app.getPath('userData'), '.install-stamp');
const APP_VERSION = getCurrentVersion();
function checkFreshInstall() {
  try {
    const saved = fs.readFileSync(STAMP_FILE, 'utf-8').trim();
    if (saved === APP_VERSION) return; // same version, same install
  } catch {}
  // New install or version change: write stamp and clear session data on window load
  fs.writeFileSync(STAMP_FILE, APP_VERSION, 'utf-8');
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
  tray.setToolTip(`Jarvis AI BETA ${getCurrentVersion()}`);
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
    title: `Jarvis AI BETA ${getCurrentVersion()}`, backgroundColor: '#0e1117',
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

// Launch app by ID using a single registry so every listed app has an actual launcher target
ipcMain.handle('open-app', (_event, appId) => {
  if (process.platform !== 'win32' || typeof appId !== 'string') return false;

  const normalizedId = appId.trim().toLowerCase();
  const commandLaunchMap = {
    chrome: 'chrome',
    edge: 'msedge',
    'opera-gx': null,
    opera: null,
    brave: 'brave',
    firefox: 'firefox',
    vivaldi: 'vivaldi',
    vlc: 'vlc',
    obs: 'obs64',
    streamlabs: 'streamlabs',
    explorer: 'explorer',
    notepad: 'notepad',
    photoshop: 'photoshop',
    'premiere-pro': 'premierepro',
    'after-effects': 'afterfx',
    blender: 'blender',
    davinci: 'resolve',
    capcut: 'capcut',
    'task-manager': 'taskmgr',
    terminal: 'wt',
  };

  const externalLaunchMap = {
    discord: 'discord:',
    slack: 'slack:',
    telegram: 'tg:',
    whatsapp: 'whatsapp:',
    teams: 'msteams:',
    zoom: 'zoommtg:',
    spotify: 'spotify:',
    'spotify-web': 'https://open.spotify.com',
    youtube: 'https://youtube.com',
    netflix: 'https://netflix.com',
    twitch: 'https://twitch.tv',
    steam: 'steam:',
    'epic-games': 'com.epicgames.launcher:',
    fortnite: 'com.epicgames.launcher://apps/fn',
    minecraft: 'minecraft:',
    gta5: 'steam://rungameid/271590',
    fivem: 'fivem:',
    valorant: 'valorant:',
    league: 'leagueoflegends:',
    'riot-client': 'riotclient:',
    apex: 'steam://rungameid/1172470',
    csgo: 'steam://rungameid/730',
    roblox: 'roblox:',
    overwatch: 'battlenet://Pro',
    'rocket-league': 'com.epicgames.launcher://apps/Sugar',
    warzone: 'battlenet://ODIN',
    battlenet: 'battlenet:',
    'ea-app': 'origin:',
    ubisoft: 'uplay:',
    xbox: 'xbox:',
    'geforce-now': 'geforcenow:',
    dota2: 'steam://rungameid/570',
    pubg: 'steam://rungameid/578080',
    destiny2: 'steam://rungameid/1085660',
    helldivers2: 'steam://rungameid/553850',
    'rainbow-six-siege': 'steam://rungameid/359550',
    vscode: 'vscode:',
    word: 'ms-word:',
    excel: 'ms-excel:',
    powerpoint: 'ms-powerpoint:',
    notion: 'notion:',
    github: 'https://github.com',
    chatgpt: 'https://chat.openai.com',
    figma: 'https://figma.com',
    calculator: 'calculator:',
    twitter: 'https://x.com',
  };

  if (normalizedId === 'opera-gx' || normalizedId === 'opera' || normalizedId === 'operagx') {
    const localAppData = process.env.LOCALAPPDATA || '';
    const operaGxPaths = [
      path.join(localAppData, 'Programs', 'Opera GX', 'opera.exe'),
      path.join(localAppData, 'Programs', 'Opera GX', 'launcher.exe'),
    ];
    for (const operaPath of operaGxPaths) {
      if (fs.existsSync(operaPath)) {
        exec(`"${operaPath}"`, { shell: 'cmd.exe' }, () => {});
        return true;
      }
    }
    exec('start "" "opera"', { shell: 'cmd.exe' }, () => {});
    return true;
  }

  const command = commandLaunchMap[normalizedId];
  if (command) {
    exec(`start "" ${command}`, { shell: 'cmd.exe' }, () => {});
    return true;
  }

  const externalTarget = externalLaunchMap[normalizedId];
  if (externalTarget) {
    shell.openExternal(externalTarget).catch(() => {});
    return true;
  }

  exec(`start "" ${normalizedId}`, { shell: 'cmd.exe' }, () => {});
  return true;
});

// Close app by ID or process name
ipcMain.handle('close-app', (_event, appId) => {
  if (process.platform !== 'win32') return null;
  
  const processNameMap = {
    chrome: 'chrome.exe',
    edge: 'msedge.exe',
    firefox: 'firefox.exe',
    brave: 'brave.exe',
    'opera-gx': 'opera.exe',
    opera: 'opera.exe',
    discord: 'Discord.exe',
    spotify: 'Spotify.exe',
    steam: 'steam.exe',
    obs: 'obs64.exe',
    vscode: 'Code.exe',
    notepad: 'notepad.exe',
    slack: 'slack.exe',
    vlc: 'vlc.exe',
    blender: 'blender.exe',
    explorer: 'explorer.exe',
  };

  const processName = processNameMap[appId] || `${appId}.exe`;
  exec(`taskkill /im "${processName}" /f`, { shell: 'cmd.exe' }, () => {});
  return null;
});

// Media keys - no-op placeholder (PowerShell keybd_event removed to avoid AV flags)
ipcMain.on('media-key', (_event, _key) => {
  // Media key simulation removed - use Spotify API for playback control instead
});

// Run arbitrary command (used by close-app fallback)
ipcMain.handle('run-command', (_event, cmd) => {
  if (process.platform === 'win32' && typeof cmd === 'string') {
    exec(cmd, { shell: 'cmd.exe' }, () => {});
  }
  return null;
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
    const tempDir = app.getPath('temp');
    const fileName = assetName || 'jarvis-update.exe';
    const destPath = path.join(tempDir, fileName);

    // Download with progress sent to renderer
    await downloadFile(downloadUrl, destPath, (percent) => {
      if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.webContents.send('update-download-progress', percent);
      }
    });

    return { status: 'downloaded', filePath: destPath };
  } catch (error) {
    return { status: 'error', message: error instanceof Error ? error.message : 'Download failed.' };
  }
});
ipcMain.handle('install-update', async (_event, filePath) => {
  const launched = await installAndRestart(filePath);
  return { launched };
});
ipcMain.handle('dismiss-update', (_event, version) => {
  dismissVersion(version);
  return null;
});

// ─── System Info IPC ─────────────────────────────────────────
ipcMain.handle('get-system-info', async () => {
  const cpus = os.cpus();
  const cpuName = cpus.length > 0 ? cpus[0].model : 'Unknown CPU';
  const cores = cpus.length;
  const totalMem = os.totalmem();
  const freeMem = os.freemem();
  const usedMem = totalMem - freeMem;
  const platform = os.platform();
  const uptime = os.uptime();

  const result = {
    cpu: { name: cpuName.trim(), cores, threads: cores },
    ram: {
      used: Math.round((usedMem / (1024 ** 3)) * 100) / 100,
      total: Math.round((totalMem / (1024 ** 3)) * 100) / 100,
      percent: Math.round((usedMem / totalMem) * 1000) / 10,
    },
    gpu: { name: 'Detecting...', vendor: '' },
    storage: [],
    network: { type: os.networkInterfaces() ? 'Connected' : 'Unknown' },
    uptime: formatUptimeSeconds(uptime),
    platform: platform === 'win32' ? 'Windows' : platform === 'darwin' ? 'macOS' : 'Linux',
    hostname: os.hostname(),
  };

  // Get GPU info (Windows)
  if (platform === 'win32') {
    try {
      const gpuInfo = await execPromise('wmic path win32_VideoController get name,adapterram /format:list');
      const nameMatch = gpuInfo.match(/Name=(.+)/i);
      if (nameMatch) result.gpu.name = nameMatch[1].trim();
    } catch {}

    // Get storage drives
    try {
      const diskInfo = await execPromise('wmic logicaldisk get name,size,freespace,description /format:csv');
      const lines = diskInfo.split('\n').filter(l => l.trim() && !l.startsWith('Node'));
      result.storage = lines.map(line => {
        const parts = line.split(',');
        if (parts.length < 4) return null;
        const desc = parts[1] || '';
        const free = parseInt(parts[2]) || 0;
        const name = parts[3] || '';
        const total = parseInt(parts[4]) || 0;
        if (total === 0) return null;
        const totalGB = Math.round((total / (1024 ** 3)) * 10) / 10;
        const usedGB = Math.round(((total - free) / (1024 ** 3)) * 10) / 10;
        return { name: name.trim(), total: totalGB, used: usedGB, type: desc.includes('Fixed') ? 'Local Disk' : desc.trim() || 'Drive' };
      }).filter(Boolean);
    } catch {}

    // Get top processes
    try {
      const procInfo = await execPromise('powershell -command "Get-Process | Sort-Object -Property WorkingSet64 -Descending | Select-Object -First 5 Name,CPU,@{Name=\'MemMB\';Expression={[math]::Round($_.WorkingSet64/1MB,1)}} | ConvertTo-Csv -NoTypeInformation"');
      const procLines = procInfo.split('\n').filter(l => l.trim() && !l.startsWith('"Name"'));
      result.processes = procLines.map(line => {
        const parts = line.replace(/"/g, '').split(',');
        return { name: (parts[0] || '').trim(), cpu: parseFloat(parts[1]) || 0, ram: parseFloat(parts[2]) || 0 };
      }).filter(p => p.name);
    } catch {}
  }

  // macOS/Linux GPU
  if (platform === 'darwin') {
    try {
      const gpuInfo = await execPromise('system_profiler SPDisplaysDataType 2>/dev/null | grep "Chipset Model"');
      const match = gpuInfo.match(/Chipset Model:\s*(.+)/i);
      if (match) result.gpu.name = match[1].trim();
    } catch {}
  }
  if (platform === 'linux') {
    try {
      const gpuInfo = await execPromise('lspci | grep -i vga');
      if (gpuInfo.trim()) result.gpu.name = gpuInfo.split(':').pop().trim();
    } catch {}
  }

  return result;
});

function formatUptimeSeconds(s) {
  const d = Math.floor(s / 86400);
  const h = Math.floor((s % 86400) / 3600);
  const m = Math.floor((s % 3600) / 60);
  if (d > 0) return `${d}d ${h}h ${m}m`;
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

function execPromise(cmd) {
  return new Promise((resolve, reject) => {
    exec(cmd, { timeout: 5000 }, (err, stdout) => {
      if (err) reject(err);
      else resolve(stdout || '');
    });
  });
}

// ─── Discord Rich Presence ───────────────────────────────────
const DiscordRPC = require('discord-rpc');

const DISCORD_CLIENT_ID = '1360649218653225131';
let rpcClient = null;
let rpcReady = false;
const rpcStartTimestamp = new Date();

function initDiscordRPC() {
  try {
    rpcClient = new DiscordRPC.Client({ transport: 'ipc' });

    rpcClient.on('ready', () => {
      rpcReady = true;
      console.log('[Discord RPC] Connected as', rpcClient.user?.username);
      updateDiscordPresence();
    });

    rpcClient.on('disconnected', () => {
      rpcReady = false;
      console.log('[Discord RPC] Disconnected, retrying in 30s...');
      setTimeout(initDiscordRPC, 30000);
    });

    rpcClient.login({ clientId: DISCORD_CLIENT_ID }).catch((err) => {
      console.log('[Discord RPC] Could not connect:', err.message || err);
      rpcReady = false;
      setTimeout(initDiscordRPC, 30000);
    });
  } catch (err) {
    console.log('[Discord RPC] Init error:', err.message || err);
    setTimeout(initDiscordRPC, 30000);
  }
}

function updateDiscordPresence(details, state) {
  if (!rpcClient || !rpcReady) return;
  try {
    rpcClient.setActivity({
      details: details || 'Using Jarvis AI',
      state: state || `v${APP_VERSION} BETA`,
      startTimestamp: rpcStartTimestamp,
      largeImageKey: 'jarvis_logo',
      largeImageText: `Jarvis AI BETA ${APP_VERSION}`,
      smallImageKey: 'status_online',
      smallImageText: 'Online',
      instance: false,
    });
  } catch (err) {
    console.log('[Discord RPC] Activity error:', err.message);
  }
}

function destroyDiscordRPC() {
  if (rpcClient) {
    try { rpcClient.destroy(); } catch {}
    rpcClient = null;
    rpcReady = false;
  }
}

// Allow renderer to update presence details
ipcMain.on('discord-presence-update', (_event, { details, state }) => {
  updateDiscordPresence(details, state);
});

// ─── App Lifecycle ───────────────────────────────────────────

app.on('before-quit', () => { forceQuit = true; });

app.whenReady().then(() => {
  createSplashWindow();
  createTray();
  createWindow();
  registerShortcuts();
  startAutoUpdateSchedule();
  initDiscordRPC();
});

app.on('will-quit', () => {
  globalShortcut.unregisterAll();
  stopAutoUpdateSchedule();
  destroyDiscordRPC();
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
