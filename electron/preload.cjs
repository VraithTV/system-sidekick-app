const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  minimize: () => ipcRenderer.send('window-minimize'),
  maximize: () => ipcRenderer.send('window-maximize'),
  close: () => ipcRenderer.invoke('window-close-request'),
  requestClose: () => ipcRenderer.invoke('window-close-request'),
  isMaximized: () => ipcRenderer.invoke('window-is-maximized'),
  onMaximizedChange: (callback) => {
    ipcRenderer.on('window-maximized', (_event, value) => callback(value));
  },
  getLaunchOnStartup: () => ipcRenderer.invoke('app-get-launch-on-startup'),
  setLaunchOnStartup: (enabled) => ipcRenderer.send('app-set-launch-on-startup', enabled),
  getAppInfo: () => ipcRenderer.invoke('app-get-info'),
  // Auto-update API
  checkForUpdate: () => ipcRenderer.invoke('update-check'),
  downloadUpdate: () => ipcRenderer.invoke('update-download'),
  installUpdate: () => ipcRenderer.send('update-install'),
  onUpdateStatus: (callback) => {
    ipcRenderer.on('update-status', (_event, data) => callback(data));
  },
});