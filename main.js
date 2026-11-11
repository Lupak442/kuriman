const { app, BrowserWindow, ipcMain, screen, shell, Tray, Menu, nativeImage } = require('electron');
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

let autoUpdater = null;
try {
  ({ autoUpdater } = require('electron-updater'));
} catch (_) {}

let mainWindow = null;
let tray = null;
let trackerProc = null;
let latestUpdateState = { status: 'idle', version: app.getVersion() };

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

function getSettingsFilePath() {
  if (app.isPackaged) {
    return path.join(app.getPath('userData'), 'app-settings.json');
  }
  return path.join(__dirname, 'app-settings.json');
}

function readAppSettings() {
  try {
    const p = getSettingsFilePath();
    if (fs.existsSync(p)) {
      return JSON.parse(fs.readFileSync(p, 'utf8'));
    }
  } catch (_) {}
  return {};
}

function writeAppSettings(partial) {
  try {
    const cur = readAppSettings();
    const next = { ...cur, ...partial };
    fs.writeFileSync(getSettingsFilePath(), JSON.stringify(next, null, 2), 'utf8');
    return true;
  } catch (_) {
    return false;
  }
}

function getInitialThemeInfo() {
  for (const arg of process.argv) {
    const m = String(arg).match(/^--theme=(kurimanju|rakko)$/i);
    if (m) {
      return { theme: m[1].toLowerCase(), fromCli: true };
    }
  }
  const saved = readAppSettings();
  if (saved.theme === 'rakko' || saved.theme === 'kurimanju') {
    return { theme: saved.theme, fromCli: false };
  }
  return { theme: 'kurimanju', fromCli: false };
}

function resolveAssetPath(filename) {
  const p = path.join(__dirname, 'assets', filename);
  if (app.isPackaged) {
    const unpacked = p.replace('app.asar', 'app.asar.unpacked');
    if (fs.existsSync(unpacked)) return unpacked;
  }
  return p;
}

function getThemeIconPaths(theme = 'kurimanju') {
  const isRakko = theme === 'rakko';
  const icoPath = resolveAssetPath(isRakko ? 'rakko.ico' : 'icon.ico');
  const pngPath = resolveAssetPath(isRakko ? 'rakko.png' : 'icon.png');
  return { icoPath, pngPath };
}

function createTrayIcon(theme = 'kurimanju') {
  const { icoPath, pngPath } = getThemeIconPaths(theme);
  const iconPath = fs.existsSync(pngPath) ? pngPath : (fs.existsSync(icoPath) ? icoPath : null);
  if (iconPath) {
    const img = nativeImage.createFromPath(iconPath);
    if (!img.isEmpty()) {
      return img.resize({ width: 24, height: 24 });
    }
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

function buildTrayMenu(theme = 'kurimanju') {
  const isRakko = theme === 'rakko';
  return Menu.buildFromTemplate([
    {
      label: isRakko ? '🦦 타이머 설정창 열기/닫기' : '🌰 타이머 설정창 열기/닫기',
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
      label: isRakko ? '🏎️ 즉시 「하아아ー!!」 보기' : '🍺 즉시 「하아ー(ハーッ!)」 보기',
      click: () => mainWindow?.webContents.send('app-command', 'trigger-haa')
    },
    {
      label: isRakko ? '🔑 차고지(북마크) 열기' : '🎒 가방(북마크) 열기',
      click: () => mainWindow?.webContents.send('app-command', 'open-bag')
    },
    {
      label: '💬 말풍선 대사 켜기/끄기',
      click: () => mainWindow?.webContents.send('app-command', 'toggle-speech')
    },
    {
      label: '🔽 상단 미니바 보이기/숨기기 (캐릭터 더블클릭도 지원)',
      click: () => mainWindow?.webContents.send('app-command', 'toggle-mini-hud')
    },
    {
      label: '🔗 바로가기 아이콘 만들기',
      submenu: [
        {
          label: '🖥️ 바탕화면에 현재 캐릭터 바로가기 만들기',
          click: () => mainWindow?.webContents.send('app-command', 'create-shortcut-desktop')
        },
        {
          label: '📂 실행 폴더에 캐릭터별 바로가기 모두 만들기',
          click: () => mainWindow?.webContents.send('app-command', 'create-shortcuts-all')
        }
      ]
    },
    {
      label: `🔄 업데이트 확인 (v${app.getVersion()})`,
      click: () => mainWindow?.webContents.send('app-command', 'check-updates')
    },
    { type: 'separator' },
    {
      label: '❌ 종료하기',
      click: () => app.quit()
    }
  ]);
}

function applyMainWindowAndTrayTheme(theme = 'kurimanju') {
  const validTheme = theme === 'rakko' ? 'rakko' : 'kurimanju';
  const isRakko = validTheme === 'rakko';
  const { icoPath, pngPath } = getThemeIconPaths(validTheme);

  const winIconPath = fs.existsSync(icoPath) ? icoPath : (fs.existsSync(pngPath) ? pngPath : null);
  if (mainWindow && !mainWindow.isDestroyed()) {
    if (winIconPath) {
      const winImg = nativeImage.createFromPath(winIconPath);
      if (!winImg.isEmpty()) {
        mainWindow.setIcon(winImg);
      }
    }
    mainWindow.setTitle(isRakko ? '랏코 스승님 시메지 타이머' : '쿠리만쥬 시메지 타이머');
  }

  if (tray && !tray.isDestroyed()) {
    tray.setImage(createTrayIcon(validTheme));
    tray.setToolTip(isRakko ? '랏코 스승님 시메지 타이머 ⚔️' : '쿠리만쥬 시메지 타이머 (밤만쥬 선배) 🌰');
    tray.setContextMenu(buildTrayMenu(validTheme));
  }
}

function ensurePersistentThemeIcon(theme = 'kurimanju') {
  const validTheme = theme === 'rakko' ? 'rakko' : 'kurimanju';
  const iconName = validTheme === 'rakko' ? 'rakko.ico' : 'icon.ico';
  const srcIco = resolveAssetPath(iconName);
  if (!fs.existsSync(srcIco)) return null;

  try {
    const iconDir = path.join(app.getPath('userData'), 'icons');
    if (!fs.existsSync(iconDir)) {
      fs.mkdirSync(iconDir, { recursive: true });
    }
    const destIco = path.join(iconDir, iconName);
    fs.copyFileSync(srcIco, destIco);
    return destIco;
  } catch (_) {
    return srcIco;
  }
}

function getLaunchTargetInfo() {
  if (app.isPackaged) {
    const portableExe = process.env.PORTABLE_EXECUTABLE_FILE;
    const exePath = (portableExe && fs.existsSync(portableExe)) ? portableExe : process.execPath;
    return {
      targetPath: exePath,
      baseArgs: '',
      workingDir: path.dirname(exePath),
      appDir: path.dirname(exePath)
    };
  }
  return {
    targetPath: process.execPath,
    baseArgs: `"${__dirname}" `,
    workingDir: __dirname,
    appDir: __dirname
  };
}

function escapePsSingleQuote(str) {
  return String(str || '').replace(/'/g, "''");
}

function runPowershellEncoded(psScript) {
  return new Promise((resolve) => {
    const encoded = Buffer.from(psScript, 'utf16le').toString('base64');
    const proc = spawn('powershell.exe', [
      '-NoProfile',
      '-NonInteractive',
      '-ExecutionPolicy', 'Bypass',
      '-WindowStyle', 'Hidden',
      '-EncodedCommand', encoded
    ], { windowsHide: true });

    let err = '';
    proc.stderr.on('data', (d) => { err += d.toString('utf8'); });
    proc.on('close', (code) => {
      resolve({ ok: code === 0, error: err.trim() });
    });
    proc.on('error', (e) => {
      resolve({ ok: false, error: e.message });
    });
  });
}

async function createShortcutsByItems(items) {
  if (!items || items.length === 0) return { ok: false, error: '생성할 항목이 없습니다.' };

  const lines = ['$wsh = New-Object -ComObject WScript.Shell'];
  for (const item of items) {
    lines.push(`$sc = $wsh.CreateShortcut('${escapePsSingleQuote(item.lnkPath)}')`);
    lines.push(`$sc.TargetPath = '${escapePsSingleQuote(item.targetPath)}'`);
    lines.push(`$sc.Arguments = '${escapePsSingleQuote(item.args)}'`);
    lines.push(`$sc.WorkingDirectory = '${escapePsSingleQuote(item.workingDir)}'`);
    if (item.iconPath) {
      lines.push(`$sc.IconLocation = '${escapePsSingleQuote(item.iconPath)},0'`);
    }
    lines.push(`$sc.Description = '${escapePsSingleQuote(item.description)}'`);
    lines.push('$sc.Save()');
  }
  lines.push(
    "Add-Type -TypeDefinition 'using System; using System.Runtime.InteropServices; public class ShNotify { [DllImport(\"shell32.dll\")] public static extern void SHChangeNotify(int wEventId, uint uFlags, IntPtr dwItem1, IntPtr dwItem2); }' -ErrorAction SilentlyContinue"
  );
  lines.push("if ([Type]::GetType('ShNotify')) { [ShNotify]::SHChangeNotify(0x08000000, 0x0000, [IntPtr]::Zero, [IntPtr]::Zero) }");

  return runPowershellEncoded(lines.join('\r\n'));
}

async function createThemeShortcuts({ mode = 'desktop-single', theme = 'kurimanju' } = {}) {
  const validTheme = theme === 'rakko' ? 'rakko' : 'kurimanju';
  const launch = getLaunchTargetInfo();
  const desktopDir = app.getPath('desktop');

  const items = [];
  if (mode === 'desktop-single') {
    const isRakko = validTheme === 'rakko';
    items.push({
      lnkPath: path.join(desktopDir, '먼작귀 시메지.lnk'),
      targetPath: launch.targetPath,
      args: `${launch.baseArgs}--theme=${validTheme}`.trim(),
      workingDir: launch.workingDir,
      iconPath: ensurePersistentThemeIcon(validTheme),
      description: isRakko ? '랏코 스승님과 함께하는 먼작귀 시메지 타이머' : '쿠리만쥬와 함께하는 먼작귀 시메지 타이머'
    });
  } else {
    const destDir = mode === 'desktop-all' ? desktopDir : launch.appDir;
    items.push(
      {
        lnkPath: path.join(destDir, '먼작귀 시메지 (쿠리만쥬).lnk'),
        targetPath: launch.targetPath,
        args: `${launch.baseArgs}--theme=kurimanju`.trim(),
        workingDir: launch.workingDir,
        iconPath: ensurePersistentThemeIcon('kurimanju'),
        description: '쿠리만쥬 테마로 먼작귀 시메지 실행'
      },
      {
        lnkPath: path.join(destDir, '먼작귀 시메지 (랏코 스승님).lnk'),
        targetPath: launch.targetPath,
        args: `${launch.baseArgs}--theme=rakko`.trim(),
        workingDir: launch.workingDir,
        iconPath: ensurePersistentThemeIcon('rakko'),
        description: '랏코 스승님 테마로 먼작귀 시메지 실행'
      }
    );
  }

  const res = await createShortcutsByItems(items);
  if (res.ok && mode === 'appdir-all') {
    try { await shell.openPath(launch.appDir); } catch (_) {}
  }
  return {
    ok: res.ok,
    error: res.error,
    files: items.map((i) => i.lnkPath),
    dir: path.dirname(items[0].lnkPath)
  };
}

function syncDefaultDesktopShortcutIfExists(theme) {
  try {
    const defaultLnk = path.join(app.getPath('desktop'), '먼작귀 시메지.lnk');
    if (fs.existsSync(defaultLnk)) {
      createThemeShortcuts({ mode: 'desktop-single', theme }).catch(() => {});
    }
  } catch (_) {}
}

async function ensureInitialDesktopShortcut(theme) {
  if (!app.isPackaged) return;
  try {
    const settings = readAppSettings();
    if (settings.initialShortcutCreated) return;

    const defaultLnk = path.join(app.getPath('desktop'), '먼작귀 시메지.lnk');
    if (!fs.existsSync(defaultLnk)) {
      const res = await createThemeShortcuts({ mode: 'desktop-single', theme });
      if (res && res.ok) {
        writeAppSettings({ initialShortcutCreated: true });
      }
    } else {
      writeAppSettings({ initialShortcutCreated: true });
    }
  } catch (_) {}
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
  const { theme: initialTheme } = getInitialThemeInfo();
  const { icoPath, pngPath } = getThemeIconPaths(initialTheme);
  const winIconPath = fs.existsSync(icoPath) ? icoPath : (fs.existsSync(pngPath) ? pngPath : null);

  mainWindow = new BrowserWindow({
    x: vBounds.x,
    y: vBounds.y,
    width: vBounds.width,
    height: vBounds.height,
    title: initialTheme === 'rakko' ? '랏코 스승님 시메지 타이머' : '쿠리만쥬 시메지 타이머',
    icon: winIconPath || undefined,
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
    tray = new Tray(createTrayIcon(initialTheme));
    tray.setToolTip(
      initialTheme === 'rakko'
        ? '랏코 스승님 시메지 타이머 ⚔️'
        : '쿠리만쥬 시메지 타이머 (밤만쥬 선배) 🌰'
    );
    const contextMenu = buildTrayMenu(initialTheme);
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
  const initialInfo = getInitialThemeInfo();
  ensureInitialDesktopShortcut(initialInfo.theme);

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

  ipcMain.handle('get-initial-theme', () => {
    return getInitialThemeInfo();
  });

  ipcMain.on('set-app-theme', (_event, theme) => {
    const validTheme = theme === 'rakko' ? 'rakko' : 'kurimanju';
    writeAppSettings({ theme: validTheme });
    applyMainWindowAndTrayTheme(validTheme);
    syncDefaultDesktopShortcutIfExists(validTheme);
  });

  ipcMain.handle('create-shortcuts', async (_event, options) => {
    return createThemeShortcuts(options || {});
  });

  ipcMain.handle('get-app-version', () => {
    return app.getVersion();
  });

  ipcMain.handle('get-update-status', () => {
    return latestUpdateState;
  });

  ipcMain.handle('check-for-updates', async () => {
    if (!app.isPackaged) {
      return { ok: false, devMode: true, version: app.getVersion(), status: 'dev' };
    }
    if (!autoUpdater) {
      return { ok: false, error: '업데이터 모듈을 찾을 수 없습니다.', version: app.getVersion() };
    }
    if (latestUpdateState.status === 'downloaded' && latestUpdateState.version && latestUpdateState.version !== app.getVersion()) {
      sendUpdateStatus(latestUpdateState);
      return { ok: true, version: latestUpdateState.version, alreadyDownloaded: true };
    }
    if (latestUpdateState.status === 'downloading') {
      sendUpdateStatus(latestUpdateState);
      return { ok: true, version: latestUpdateState.version || app.getVersion(), downloading: true };
    }
    try {
      const result = await autoUpdater.checkForUpdates();
      const latestVer = result?.updateInfo?.version || app.getVersion();
      return {
        ok: true,
        version: latestVer,
        hasUpdate: Boolean(result?.downloadPromise || latestVer !== app.getVersion())
      };
    } catch (e) {
      return { ok: false, error: e?.message || '업데이트 확인 실패', version: app.getVersion() };
    }
  });

  ipcMain.on('install-update-now', () => {
    if (autoUpdater && app.isPackaged) {
      try {
        autoUpdater.quitAndInstall(true, true);
      } catch (_) {}
    }
  });

  setupAutoUpdater();

  ipcMain.on('quit-app', () => {
    app.quit();
  });
});

function appendUpdaterLog(level, ...args) {
  if (!app.isPackaged) return;
  try {
    const logPath = path.join(app.getPath('userData'), 'updater.log');
    const msg = args
      .map((a) => (typeof a === 'string' ? a : (a instanceof Error ? (a.stack || a.message) : JSON.stringify(a))))
      .join(' ');
    fs.appendFileSync(logPath, `[${new Date().toISOString()}] [${level}] ${msg}\n`, 'utf8');
  } catch (_) {}
}

function sendUpdateStatus(payload) {
  latestUpdateState = { ...latestUpdateState, ...payload };
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send('update-status', latestUpdateState);
  }
}

function setupAutoUpdater() {
  if (!autoUpdater) return;

  autoUpdater.logger = {
    info: (...a) => appendUpdaterLog('INFO', ...a),
    warn: (...a) => appendUpdaterLog('WARN', ...a),
    error: (...a) => appendUpdaterLog('ERROR', ...a),
    debug: (...a) => appendUpdaterLog('DEBUG', ...a)
  };
  autoUpdater.autoDownload = true;
  autoUpdater.autoInstallOnAppQuit = true;

  autoUpdater.on('checking-for-update', () => {
    sendUpdateStatus({ status: 'checking', version: app.getVersion() });
  });

  autoUpdater.on('update-available', (info) => {
    sendUpdateStatus({ status: 'available', version: info?.version || '' });
  });

  autoUpdater.on('update-not-available', () => {
    sendUpdateStatus({ status: 'latest', version: app.getVersion() });
  });

  autoUpdater.on('download-progress', (progress) => {
    sendUpdateStatus({
      status: 'downloading',
      percent: Math.round(progress?.percent || 0)
    });
  });

  autoUpdater.on('update-downloaded', (info) => {
    sendUpdateStatus({ status: 'downloaded', version: info?.version || '' });
  });

  autoUpdater.on('error', (err) => {
    sendUpdateStatus({ status: 'error', message: err?.message || '업데이트 확인 오류' });
  });

  if (app.isPackaged) {
    setTimeout(() => {
      autoUpdater.checkForUpdates().catch(() => {});
    }, 4500);

    setInterval(() => {
      autoUpdater.checkForUpdates().catch(() => {});
    }, 4 * 60 * 60 * 1000);
  }
}

app.on('before-quit', () => {
  if (trackerProc) {
    try { trackerProc.kill(); } catch (_) {}
  }
});

app.on('window-all-closed', () => {
  app.quit();
});
