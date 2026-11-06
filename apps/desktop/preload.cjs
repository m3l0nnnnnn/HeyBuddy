const { contextBridge, ipcRenderer } = require('electron');

// Only expose explicit UI controls. No arbitrary Node, microphone,
// screen, file or shell access is available to the renderer.
contextBridge.exposeInMainWorld('heybuddy', Object.freeze({
  openDashboard: () => ipcRenderer.send('buddy:open-dashboard'),
  showBuddy: () => ipcRenderer.send('buddy:show'),
  hideBuddy: () => ipcRenderer.send('buddy:hide'),
}));
