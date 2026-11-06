const { app, BrowserWindow, ipcMain, screen } = require('electron');
const path = require('node:path');

const DEV_URL = 'http://127.0.0.1:5173';
const PRELOAD = path.join(__dirname, 'preload.cjs');
let dashboard = null;
let companion = null;

function showDashboard() {
  if (dashboard && !dashboard.isDestroyed()) {
    if (dashboard.isMinimized()) dashboard.restore();
    dashboard.show();
    dashboard.focus();
    return;
  }
  dashboard = new BrowserWindow({
    width: 1180,
    height: 810,
    minWidth: 920,
    minHeight: 660,
    backgroundColor: '#f8f8fc',
    title: 'HeyBuddy',
    autoHideMenuBar: true,
    webPreferences: {
      preload: PRELOAD,
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });

  if (app.isPackaged) {
    dashboard.loadFile(path.resolve(__dirname, '../web/dist/index.html'));
  } else {
    dashboard.loadURL(DEV_URL);
  }

  // Do not let untrusted websites open inside the privileged Electron app.
  dashboard.webContents.setWindowOpenHandler(() => ({ action: 'deny' }));
  dashboard.on('closed', () => {
    dashboard = null;
    if (!companion || companion.isDestroyed() || !companion.isVisible()) {
      app.quit();
    }
  });
}

function showCompanion() {
  if (companion && !companion.isDestroyed()) {
    companion.show();
    companion.moveTop();
    return;
  }

  const area = screen.getPrimaryDisplay().workArea;
  const width = 170;
  const height = 218;
  companion = new BrowserWindow({
    width,
    height,
    x: Math.round(area.x + area.width - width - 24),
    y: Math.round(area.y + area.height - height - 24),
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    resizable: false,
    movable: true,
    show: false,
    skipTaskbar: true,
    hasShadow: false,
    title: 'HeyBuddy floating companion',
    webPreferences: {
      preload: PRELOAD,
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });

  companion.setAlwaysOnTop(true, 'floating');
  companion.loadFile(path.join(__dirname, 'buddy.html'));
  // Transparent windows may not consistently fire ready-to-show.
  companion.webContents.once('did-finish-load', () => {
    if (companion && !companion.isDestroyed()) companion.showInactive();
  });
  companion.on('closed', () => { companion = null; });
}

app.whenReady().then(() => {
  ipcMain.on('buddy:open-dashboard', showDashboard);
  ipcMain.on('buddy:show', showCompanion);
  ipcMain.on('buddy:hide', () => {
    if (companion && !companion.isDestroyed()) companion.hide();
    if (!dashboard || dashboard.isDestroyed()) app.quit();
  });

  showDashboard();
  showCompanion();

  app.on('activate', () => {
    showDashboard();
    showCompanion();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
