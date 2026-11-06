const { app, BrowserWindow, shell } = require('electron');
const path = require('node:path');

const LOCAL_FRONTEND = 'http://127.0.0.1:5173';

function createWindow() {
  const window = new BrowserWindow({
    width: 1180,
    height: 810,
    minWidth: 920,
    minHeight: 660,
    backgroundColor: '#f8f8fc',
    title: 'HeyBuddy',
    autoHideMenuBar: true,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true,
    },
  });

  // Desktop shell only: screen capture, microphone and overlays are intentionally absent.
  if (app.isPackaged) {
    window.loadFile(path.resolve(__dirname, '../web/dist/index.html'));
  } else {
    window.loadURL(LOCAL_FRONTEND);
  }

  window.webContents.setWindowOpenHandler(({ url }) => {
    // Block arbitrary in-app navigation. External links require a normal browser.
    if (url.startsWith('https://')) shell.openExternal(url);
    return { action: 'deny' };
  });
}

app.whenReady().then(() => {
  createWindow();
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
