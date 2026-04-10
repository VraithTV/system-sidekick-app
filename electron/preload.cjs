const { contextBridge, ipcRenderer } = require('electron');

const sendWindowCommand = (channel) => () => {
  ipcRenderer.send(channel);
};

const invokeWindowCommand = (channel) => () => ipcRenderer.invoke(channel);

contextBridge.exposeInMainWorld('electronAPI', {
  // Window controls
  minimize: sendWindowCommand('window-minimize'),
  maximize: sendWindowCommand('window-maximize'),
  close: invokeWindowCommand('window-close'),
  hideToTray: invokeWindowCommand('window-hide-to-tray'),
  quit: invokeWindowCommand('app-quit'),
  isMaximized: () => ipcRenderer.invoke('window-is-maximized'),
  onMaximizedChange: (callback) => {
    const handler = (_event, value) => callback(value);
    ipcRenderer.on('window-maximized', handler);
    return () => ipcRenderer.removeListener('window-maximized', handler);
  },
  onRequestCloseAction: (callback) => {
    const handler = () => callback();
    ipcRenderer.on('request-close-action', handler);
    return () => ipcRenderer.removeListener('request-close-action', handler);
  },

  // URLs & media
  openUrl: (url) => ipcRenderer.send('open-url', url),
  mediaKey: (key) => ipcRenderer.send('media-key', key),
  openApp: (appId) => ipcRenderer.invoke('open-app', appId),
  closeApp: (appId) => ipcRenderer.invoke('close-app', appId),
  runCommand: (cmd) => ipcRenderer.invoke('run-command', cmd),
  spotifyAuth: (url) => ipcRenderer.invoke('spotify-auth-flow', url),

  // Clips
  clipNow: (duration) => ipcRenderer.send('clip-now', duration),
  openClipsFolder: () => ipcRenderer.send('open-clips-folder'),
  startRecording: () => ipcRenderer.send('start-recording'),
  stopRecording: () => ipcRenderer.send('stop-recording'),
  playClip: (filename) => ipcRenderer.send('play-clip', filename),
  deleteClip: (clipId) => ipcRenderer.send('delete-clip', clipId),
  getClipsFolder: () => ipcRenderer.invoke('get-clips-folder'),
  onClipSaved: (callback) => {
    const handler = (_event, clip) => callback(clip);
    ipcRenderer.on('clip-saved', handler);
    return () => ipcRenderer.removeListener('clip-saved', handler);
  },

  // Keyboard shortcuts
  onShortcut: (callback) => {
    const handler = (_event, action) => callback(action);
    ipcRenderer.on('shortcut', handler);
    return () => ipcRenderer.removeListener('shortcut', handler);
  },

  // Auto-updater
  checkForUpdates: () => ipcRenderer.invoke('check-for-updates'),
  getAppVersion: () => ipcRenderer.invoke('get-app-version'),
  downloadUpdate: (downloadUrl, assetName) => ipcRenderer.invoke('download-update', downloadUrl, assetName),
  installUpdate: (filePath) => ipcRenderer.invoke('install-update', filePath),
  dismissUpdate: (version) => ipcRenderer.invoke('dismiss-update', version),
  onUpdateDownloadProgress: (callback) => {
    const handler = (_event, percent) => callback(percent);
    ipcRenderer.on('update-download-progress', handler);
    return () => ipcRenderer.removeListener('update-download-progress', handler);
  },
  // System info
  getSystemInfo: () => ipcRenderer.invoke('get-system-info'),
});
