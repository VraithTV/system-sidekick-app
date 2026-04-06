const { contextBridge, ipcRenderer } = require('electron');

const sendWindowCommand = (channel) => () => {
  ipcRenderer.send(channel);
};

contextBridge.exposeInMainWorld('electronAPI', {
  minimize: sendWindowCommand('window-minimize'),
  maximize: sendWindowCommand('window-maximize'),
  close: sendWindowCommand('window-close'),
  hideToTray: sendWindowCommand('window-hide-to-tray'),
  quit: sendWindowCommand('app-quit'),
  isMaximized: () => ipcRenderer.invoke('window-is-maximized'),
  onMaximizedChange: (callback) => {
    ipcRenderer.on('window-maximized', (_event, value) => callback(value));
  },
});
