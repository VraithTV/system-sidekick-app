const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  minimize: () => ipcRenderer.send('window-minimize'),
  maximize: () => ipcRenderer.send('window-maximize'),
  close: () => ipcRenderer.invoke('window-close'),
  hideToTray: () => ipcRenderer.invoke('window-hide-to-tray'),
  quit: () => ipcRenderer.invoke('app-quit'),
  isMaximized: () => ipcRenderer.invoke('window-is-maximized'),
  onMaximizedChange: (callback) => {
    ipcRenderer.on('window-maximized', (_event, value) => callback(value));
  },
});
