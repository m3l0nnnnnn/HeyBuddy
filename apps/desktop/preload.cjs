const { contextBridge, ipcRenderer } = require('electron');

// Only permit limited UI operations and explicitly chosen capture sources.
// No arbitrary system, file, shell or microphone APIs are exposed.
contextBridge.exposeInMainWorld('heybuddy', Object.freeze({
  openDashboard: () => ipcRenderer.send('buddy:open-dashboard'),
  openDemoChat: () => ipcRenderer.send('demo:open'),
  showBuddy: () => ipcRenderer.send('buddy:show'),
  hideBuddy: () => ipcRenderer.send('buddy:hide'),
  listCaptureSources: () => ipcRenderer.invoke('capture:list'),
  chooseCaptureSource: (id) => ipcRenderer.invoke('capture:choose', id),
  setRiskAlert: (isWarning) => ipcRenderer.send('buddy:set-alert', isWarning === true),
  onRiskAlert: (callback) => {
    const listener = (_event, flag) => callback(flag === true);
    ipcRenderer.on('buddy:alert', listener);
    return () => ipcRenderer.removeListener('buddy:alert', listener);
  },
}));
