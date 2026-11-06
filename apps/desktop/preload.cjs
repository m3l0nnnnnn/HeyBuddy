const { contextBridge, ipcRenderer } = require('electron');

// Only permit limited UI operations and explicitly chosen capture sources.
// No arbitrary system, file, shell or microphone APIs are exposed.
contextBridge.exposeInMainWorld('heybuddy', Object.freeze({
  openDashboard: () => ipcRenderer.send('buddy:open-dashboard'),
  showBuddy: () => ipcRenderer.send('buddy:show'),
  hideBuddy: () => ipcRenderer.send('buddy:hide'),
  listCaptureSources: () => ipcRenderer.invoke('capture:list'),
  chooseCaptureSource: (id) => ipcRenderer.invoke('capture:choose', id),
}));
