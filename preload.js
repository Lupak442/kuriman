const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  setIgnoreMouseEvents: (ignore) => ipcRenderer.send('set-ignore-mouse-events', ignore),
  getBookmarks: () => ipcRenderer.invoke('get-bookmarks'),
  saveBookmarks: (bookmarks) => ipcRenderer.invoke('save-bookmarks', bookmarks),
  openExternalUrl: (url) => ipcRenderer.invoke('open-external-url', url),
  quitApp: () => ipcRenderer.send('quit-app'),
  onCommand: (callback) => ipcRenderer.on('app-command', (_event, cmd) => callback(cmd)),
  onWindowsUpdate: (callback) => ipcRenderer.on('windows-update', (_event, windows) => callback(windows)),
  listSpriteFiles: () => ipcRenderer.invoke('list-sprite-files')
});
