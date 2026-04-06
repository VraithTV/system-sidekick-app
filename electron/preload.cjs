const { contextBridge, ipcRenderer } = require('electron');

const sendWindowCommand = (channel) => () => {
  ipcRenderer.send(channel);
};

const invokeWindowCommand = (channel) => () => ipcRenderer.invoke(channel);

contextBridge.exposeInMainWorld('electronAPI', {
  minimize: sendWindowCommand('window-minimize'),
  maximize: sendWindowCommand('window-maximize'),
  close: invokeWindowCommand('window-close'),
  hideToTray: invokeWindowCommand('window-hide-to-tray'),
  quit: invokeWindowCommand('app-quit'),
  isMaximized: () => ipcRenderer.invoke('window-is-maximized'),
  onMaximizedChange: (callback) => {
    ipcRenderer.on('window-maximized', (_event, value) => callback(value));
  },
  openUrl: (url) => ipcRenderer.send('open-url', url),
  mediaKey: (key) => ipcRenderer.send('media-key', key),
});
