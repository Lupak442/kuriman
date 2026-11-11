const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  setIgnoreMouseEvents: (ignore) => ipcRenderer.send('set-ignore-mouse-events', ignore),
  getBookmarks: () => ipcRenderer.invoke('get-bookmarks'),
  saveBookmarks: (bookmarks) => ipcRenderer.invoke('save-bookmarks', bookmarks),
  openExternalUrl: (url) => ipcRenderer.invoke('open-external-url', url),
  quitApp: () => ipcRenderer.send('quit-app'),
  onCommand: (callback) => ipcRenderer.on('app-command', (_event, cmd) => callback(cmd)),
  onWindowsUpdate: (callback) => ipcRenderer.on('windows-update', (_event, windows) => callback(windows)),
  listSpriteFiles: () => ipcRenderer.invoke('list-sprite-files'),
  getDisplays: () => ipcRenderer.invoke('get-displays'),
  setAppTheme: (theme) => ipcRenderer.send('set-app-theme', theme),
  getInitialTheme: () => ipcRenderer.invoke('get-initial-theme'),
  createShortcuts: (options) => ipcRenderer.invoke('create-shortcuts', options),
  getAppVersion: () => ipcRenderer.invoke('get-app-version'),
  getUpdateStatus: () => ipcRenderer.invoke('get-update-status'),
  checkForUpdates: () => ipcRenderer.invoke('check-for-updates'),
  installUpdateNow: () => ipcRenderer.send('install-update-now'),
  onUpdateStatus: (callback) => ipcRenderer.on('update-status', (_event, data) => callback(data))
});
