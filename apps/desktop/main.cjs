const { app, BrowserWindow, ipcMain, screen, session, desktopCapturer } = require('electron');
const path = require('node:path');

const DEV_URL = 'http://127.0.0.1:5173';
const PRELOAD = path.join(__dirname, 'preload.cjs');
let dashboard = null;
let companion = null;
let approvedSource = null;
let demoWindow = null;


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
      backgroundThrottling: false,
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
  const width = 194;
  const height = 244;
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

function showDemoWindow() {
  if (demoWindow && !demoWindow.isDestroyed()) {
    demoWindow.show();
    demoWindow.focus();
    return;
  }
  demoWindow = new BrowserWindow({
    width: 950,
    height: 820,
    minWidth: 700,
    minHeight: 570,
    backgroundColor: '#f5f3fb',
    title: 'HeyBuddy Fictional Chat Lab',
    autoHideMenuBar: true,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true,
    },
  });
  if (app.isPackaged) {
    demoWindow.loadFile(path.join(__dirname, '../web/dist/demo.html'));
  } else {
    demoWindow.loadURL(DEV_URL + '/demo.html');
  }
  demoWindow.webContents.setWindowOpenHandler(() => ({ action: 'deny' }));
  demoWindow.on('closed', () => { demoWindow = null; });
}

app.whenReady().then(() => {
  // Electron on Windows has no built-in getDisplayMedia system picker.
  // The dashboard shows all available sources and requires the user to select one.
  ipcMain.handle('capture:list', async (event) => {
    if (!dashboard || event.sender !== dashboard.webContents) return [];
    const sources = await desktopCapturer.getSources({ types: ['window', 'screen'] });
    return sources.map(({ id, name }) => ({ id, name }));
  });
  ipcMain.handle('capture:choose', async (event, sourceId) => {
    if (!dashboard || event.sender !== dashboard.webContents || typeof sourceId !== 'string') {
      return false;
    }
    const sources = await desktopCapturer.getSources({ types: ['window', 'screen'] });
    if (!sources.some(source => source.id === sourceId)) return false;
    approvedSource = sourceId;
    return true;
  });
  // Screen sharing is permitted only for the main dashboard, after explicit
  // source selection and a direct click on Start screen protection.
  // Some Electron/Chromium builds ask for display-capture permission before
  // calling the stream handler. Never grant camera or microphone access.
  const canCapture = (wc) => Boolean(
    dashboard && !dashboard.isDestroyed() &&
    wc === dashboard.webContents && approvedSource
  );
  session.defaultSession.setPermissionCheckHandler((wc, permission) => {
    return permission === 'display-capture' && canCapture(wc);
  });
  session.defaultSession.setPermissionRequestHandler((wc, permission, callback) => {
    callback(permission === 'display-capture' && canCapture(wc));
  });

  session.defaultSession.setDisplayMediaRequestHandler(async (request, callback) => {
    const isDashboardFrame = Boolean(
      dashboard && !dashboard.isDestroyed() &&
      request.frame && request.frame === dashboard.webContents.mainFrame
    );

    // Chromium may provide a trailing slash in securityOrigin. Normalise it
    // before checking; a literal string comparison can incorrectly deny capture.
    let originIsAllowed = false;
    try {
      originIsAllowed = new URL(request.securityOrigin).origin === new URL(DEV_URL).origin;
    } catch {
      originIsAllowed = false;
    }

    if (!isDashboardFrame || !originIsAllowed || !approvedSource ||
        request.userGesture !== true || request.videoRequested !== true ||
        request.audioRequested === true) {
      console.warn('[HeyBuddy] Capture request declined. Source selected:', Boolean(approvedSource),
        'dashboard frame:', isDashboardFrame, 'origin valid:', originIsAllowed,
        'user initiated:', request.userGesture === true);
      callback(null);
      return;
    }

    // Each new sharing session needs an explicitly approved source.
    const id = approvedSource;
    approvedSource = null;
    try {
      const sources = await desktopCapturer.getSources({ types: ['window', 'screen'] });
      const selected = sources.find(item => item.id === id);
      if (!selected) console.warn('[HeyBuddy] Capture source no longer exists:', id);
      callback(selected ? { video: selected } : null);
    } catch (error) {
      console.error('[HeyBuddy] Could not grant display sharing:', error.message);
      callback(null);
    }
  });
  ipcMain.on('demo:open', (event) => {
    if (!dashboard || event.sender !== dashboard.webContents) return;
    showDemoWindow();
  });
  ipcMain.on('buddy:set-alert', (event, isWarning) => {
    if (!dashboard || event.sender !== dashboard.webContents) return;
    if (!companion || companion.isDestroyed()) return;
    companion.webContents.send('buddy:alert', isWarning === true);
  });
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
