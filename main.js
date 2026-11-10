const { app, BrowserWindow, ipcMain, screen, shell, Tray, Menu, nativeImage } = require('electron');
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

let mainWindow = null;
let tray = null;
let trackerProc = null;

const DEFAULT_BOOKMARKS_PATH = path.join(__dirname, 'bookmarks.json');

function getBookmarksFilePath() {
  if (app.isPackaged) {
    return path.join(app.getPath('userData'), 'bookmarks.json');
  }
  return DEFAULT_BOOKMARKS_PATH;
}

function readBookmarks() {
  const targetPath = getBookmarksFilePath();
  try {
    if (fs.existsSync(targetPath)) {
      const raw = fs.readFileSync(targetPath, 'utf8');
      return JSON.parse(raw);
    }
    if (fs.existsSync(DEFAULT_BOOKMARKS_PATH)) {
      const raw = fs.readFileSync(DEFAULT_BOOKMARKS_PATH, 'utf8');
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error('Failed to read bookmarks.json:', err);
  }
  return [
    { id: 'bm-1', name: '네이버 (Naver)', url: 'https://www.naver.com', icon: '🌰' },
    { id: 'bm-2', name: '유튜브 (YouTube)', url: 'https://www.youtube.com', icon: '🍺' },
    { id: 'bm-3', name: '구글 (Google)', url: 'https://www.google.com', icon: '🍘' }
  ];
}

function writeBookmarks(bookmarks) {
  try {
    const targetPath = getBookmarksFilePath();
    fs.writeFileSync(targetPath, JSON.stringify(bookmarks, null, 2), 'utf8');
    return true;
  } catch (err) {
    console.error('Failed to write bookmarks.json:', err);
    return false;
  }
}

function createTrayIcon() {
  const iconPath = path.join(__dirname, 'assets', 'icon.png');
  if (fs.existsSync(iconPath)) {
    return nativeImage.createFromPath(iconPath).resize({ width: 24, height: 24 });
  }
  const svgIcon = `
    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
      <circle cx="16" cy="17" r="12" fill="#FFF7DF" stroke="#3B2314" stroke-width="2.5"/>
      <path d="M 5 14 Q 16 4 27 14 Z" fill="#7B3F11"/>
      <circle cx="11.5" cy="18" r="1.8" fill="#2B1810"/>
      <circle cx="20.5" cy="18" r="1.8" fill="#2B1810"/>
    </svg>
  `;
  const base64 = Buffer.from(svgIcon).toString('base64');
  return nativeImage.createFromDataURL(`data:image/svg+xml;base64,${base64}`);
}

function startWindowTracker() {
  let scriptPath = path.join(__dirname, 'scripts', 'window-tracker.ps1');
  if (app.isPackaged) {
    scriptPath = scriptPath.replace('app.asar', 'app.asar.unpacked');
  }
  if (!fs.existsSync(scriptPath)) return;

  trackerProc = spawn('powershell.exe', [
    '-NoProfile',
    '-ExecutionPolicy', 'Bypass',
    '-WindowStyle', 'Hidden',
    '-File', scriptPath,
    String(process.pid)
  ], {
    windowsHide: true
  });

  let buffer = '';
  trackerProc.stdout.on('data', (chunk) => {
    buffer += chunk.toString('utf8');
    const lines = buffer.split(/\r?\n/);
    buffer = lines.pop() || '';

    const lastLine = lines.filter((l) => l.trim().startsWith('[')).pop();
    if (!lastLine || !mainWindow || mainWindow.isDestroyed()) return;

    try {
      const rawWindows = JSON.parse(lastLine);
      const vBounds = getVirtualScreenBounds();
      const primary = screen.getPrimaryDisplay();
      const scale = primary.scaleFactor || 1;

      // 물리 픽셀(Physical Pixels)을 Electron 창 내부 CSS 좌표(DIP)로 변환 (멀티모니터 가상좌표계 적용)
      const normalized = rawWindows.map((w) => {
        const dipX = Math.round(w.x / scale) - vBounds.x;
        const dipY = Math.round(w.y / scale) - vBounds.y;
        const dipW = Math.round(w.width / scale);
        const dipH = Math.round(w.height / scale);
        const isNearlyFull = Boolean(
          w.isMaximized ||
          (dipW >= vBounds.width * 0.95 && dipH >= vBounds.height * 0.90)
        );
        return {
          hwnd: w.hwnd,
          title: w.title,
          proc: w.proc,
          x: dipX,
          y: dipY,
          width: dipW,
          height: dipH,
          isForeground: w.isForeground,
          isMaximized: isNearlyFull,
          z: w.z
        };
      });

      mainWindow.webContents.send('windows-update', normalized);
    } catch (_) {}
  });

  trackerProc.on('error', () => {});
}

function getVirtualScreenBounds() {
  const displays = screen.getAllDisplays();
  if (!displays || displays.length === 0) {
    const primary = screen.getPrimaryDisplay();
    return primary.bounds;
  }

  let minX = displays[0].bounds.x;
  let minY = displays[0].bounds.y;
  let maxX = displays[0].bounds.x + displays[0].bounds.width;
  let maxY = displays[0].bounds.y + displays[0].bounds.height;

  for (let i = 1; i < displays.length; i++) {
    const b = displays[i].bounds;
    minX = Math.min(minX, b.x);
    minY = Math.min(minY, b.y);
    maxX = Math.max(maxX, b.x + b.width);
    maxY = Math.max(maxY, b.y + b.height);
  }

  return {
    x: minX,
    y: minY,
    width: maxX - minX,
    height: maxY - minY
  };
}

function createWindow() {
  const vBounds = getVirtualScreenBounds();
  const appIcon = path.join(__dirname, 'assets', 'icon.png');

  mainWindow = new BrowserWindow({
    x: vBounds.x,
    y: vBounds.y,
    width: vBounds.width,
    height: vBounds.height,
    icon: fs.existsSync(appIcon) ? appIcon : undefined,
    transparent: true,
    frame: false,
    alwaysOnTop: true,
    resizable: false,
    movable: false,
    hasShadow: false,
    skipTaskbar: false,
    enableLargerThanScreen: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  mainWindow.setAlwaysOnTop(true, 'screen-saver');
  mainWindow.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });
  mainWindow.setIgnoreMouseEvents(false);
  mainWindow.setBounds(vBounds);

  // 다중 모니터 해상도/연결 변경 시 창 크기 자동 업데이트
  const updateBounds = () => {
    if (!mainWindow || mainWindow.isDestroyed()) return;
    const nb = getVirtualScreenBounds();
    mainWindow.setBounds(nb);
  };
  screen.on('display-metrics-changed', updateBounds);
  screen.on('display-added', updateBounds);
  screen.on('display-removed', updateBounds);

  mainWindow.loadFile('index.html');

  try {
    tray = new Tray(createTrayIcon());
    tray.setToolTip('쿠리만쥬 시메지 타이머 (밤만쥬 선배)');
    const contextMenu = Menu.buildFromTemplate([
      {
        label: '🌰 타이머 설정창 열기/닫기',
        click: () => mainWindow?.webContents.send('app-command', 'toggle-timer-panel')
      },
      {
        label: '🐾 자유 산책 / 🪑 얌전 모드 전환',
        click: () => mainWindow?.webContents.send('app-command', 'toggle-wander-mode')
      },
      {
        label: '👥 친구 놀러오기 / 돌려보내기 (2마리 동시 산책)',
        click: () => mainWindow?.webContents.send('app-command', 'toggle-friend')
      },
      {
        label: '✨ 테마 전환 (쿠리만쥬 ↔ 랏코 스승님)',
        click: () => mainWindow?.webContents.send('app-command', 'toggle-theme')
      },
      {
        label: '🪂 캐릭터 위에서 다시 소환',
        click: () => mainWindow?.webContents.send('app-command', 'respawn-kurimanju')
      },
      {
        label: '🍺 즉시 「하아ー(ハーッ!)」 보기',
        click: () => mainWindow?.webContents.send('app-command', 'trigger-haa')
      },
      {
        label: '🎒 가방(북마크) 열기',
        click: () => mainWindow?.webContents.send('app-command', 'open-bag')
      },
      {
        label: '💬 말풍선 대사 켜기/끄기',
        click: () => mainWindow?.webContents.send('app-command', 'toggle-speech')
      },
      {
        label: '🔽 상단 미니바 보이기/숨기기 (쿠리만쥬 더블클릭도 지원)',
        click: () => mainWindow?.webContents.send('app-command', 'toggle-mini-hud')
      },
      { type: 'separator' },
      {
        label: '❌ 종료하기',
        click: () => app.quit()
      }
    ]);
    tray.setContextMenu(contextMenu);
    tray.on('click', () => {
      mainWindow?.webContents.send('app-command', 'toggle-timer-panel');
    });
  } catch (e) {
    console.warn('Tray creation skipped:', e);
  }

  startWindowTracker();
}

app.whenReady().then(() => {
  createWindow();

  ipcMain.on('set-ignore-mouse-events', (event, ignore) => {
    const win = BrowserWindow.fromWebContents(event.sender);
    if (!win) return;
    if (ignore) {
      win.setIgnoreMouseEvents(true, { forward: true });
    } else {
      win.setIgnoreMouseEvents(false);
    }
  });

  ipcMain.handle('get-bookmarks', () => {
    return readBookmarks();
  });

  ipcMain.handle('get-displays', () => {
    const vBounds = getVirtualScreenBounds();
    return screen.getAllDisplays().map((d) => ({
      id: d.id,
      x: d.bounds.x - vBounds.x,
      y: d.bounds.y - vBounds.y,
      width: d.bounds.width,
      height: d.bounds.height
    }));
  });

  ipcMain.handle('list-sprite-files', () => {
    try {
      const dir = path.join(__dirname, 'assets', 'sprites');
      if (!fs.existsSync(dir)) return [];
      const getFiles = (base, prefix = '') => {
        let results = [];
        const entries = fs.readdirSync(base, { withFileTypes: true });
        for (const ent of entries) {
          const relPath = prefix ? `${prefix}/${ent.name}` : ent.name;
          if (ent.isDirectory()) {
            results = results.concat(getFiles(path.join(base, ent.name), relPath));
          } else {
            results.push(relPath);
          }
        }
        return results;
      };
      return getFiles(dir);
    } catch (_) {
      return [];
    }
  });

  ipcMain.handle('save-bookmarks', (_event, bookmarks) => {
    return writeBookmarks(bookmarks);
  });

  ipcMain.handle('open-external-url', async (_event, rawUrl) => {
    if (!rawUrl || typeof rawUrl !== 'string') return false;
    let target = rawUrl.trim();
    if (!/^https?:\/\//i.test(target)) {
      target = 'https://' + target;
    }
    await shell.openExternal(target);
    return true;
  });

  ipcMain.on('quit-app', () => {
    app.quit();
  });
});

app.on('before-quit', () => {
  if (trackerProc) {
    try { trackerProc.kill(); } catch (_) {}
  }
});

app.on('window-all-closed', () => {
  app.quit();
});
