const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  minimize: () => ipcRenderer.send('window-minimize'),
  maximize: () => ipcRenderer.send('window-maximize'),
  close: () => ipcRenderer.send('window-close'),
  hideToTray: () => ipcRenderer.send('window-hide-to-tray'),
  quit: () => ipcRenderer.send('app-quit'),
  isMaximized: () => ipcRenderer.invoke('window-is-maximized'),
  onMaximizedChange: (callback) => {
    ipcRenderer.on('window-maximized', (_event, value) => callback(value));
  },
});
