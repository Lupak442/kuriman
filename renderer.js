(() => {
  const charConfigs = window.CHARACTER_CONFIGS || {};
  let spriteConfig = window.KURIMANJU_SPRITES;

  // DOM Elements
  const miniHud = document.getElementById('mini-hud');
  const hudBadgeEl = document.querySelector('.hud-badge');
  const btnToggleFriend = document.getElementById('btn-toggle-friend');
  const btnToggleWander = document.getElementById('btn-toggle-wander');
  const hudTimeDisplay = document.getElementById('hud-time-display');
  const btnToggleSetup = document.getElementById('btn-toggle-setup');
  const btnOpenBagHud = document.getElementById('btn-open-bag-hud');
  const btnMinimizeHud = document.getElementById('btn-minimize-hud');
  const miniHudCollapsed = document.getElementById('mini-hud-collapsed');
  const collapsedIconImg = document.querySelector('.collapsed-icon');
  const collapsedTime = document.getElementById('collapsed-time');
  const btnQuit = document.getElementById('btn-quit');

  const setupPanel = document.getElementById('timer-setup-panel');
  const panelHeader = setupPanel?.querySelector('.panel-header');
  const headerIconImg = document.querySelector('.header-icon-img');
  const panelTitleH1 = document.querySelector('.panel-title-row h1');
  const panelSubtitleP = document.querySelector('.panel-title-row .subtitle');
  const btnMinimizePanel = document.getElementById('btn-Minimize-panel');
  const btnPanelToggleWander = document.getElementById('btn-panel-toggle-wander');
  const btnToggleSpeech = document.getElementById('btn-toggle-speech');
  const modeDesc = document.getElementById('mode-desc');

  // 테마 & 친구 놀러오기 UI 요소
  const btnThemeKurimanju = document.getElementById('btn-theme-kurimanju');
  const btnThemeRakko = document.getElementById('btn-theme-rakko');
  const btnPanelToggleFriend = document.getElementById('btn-panel-toggle-friend');
  const friendStatusDesc = document.getElementById('friend-status-desc');
  const btnShortcutDesktop = document.getElementById('btn-shortcut-desktop');
  const btnShortcutAll = document.getElementById('btn-shortcut-all');

  const presetBtns = document.querySelectorAll('.preset-btn');
  const inputMinutes = document.getElementById('input-minutes');
  const inputSeconds = document.getElementById('input-seconds');
  const btnStartTimer = document.getElementById('btn-start-timer');
  const btnPauseTimer = document.getElementById('btn-pause-timer');
  const btnResetTimer = document.getElementById('btn-reset-timer');
  const gestureBtns = document.querySelectorAll('.gesture-btn');

  // 메인 캐릭터 컨테이너
  const actorEl = document.getElementById('kurimanju-actor');
  const spriteWrapper = document.getElementById('sprite-wrapper');
  const actorImg = document.getElementById('kurimanju-img');
  const actorTimerPill = document.getElementById('actor-timer-pill');
  const actorSpeech = document.getElementById('actor-speech');
  const bagEffectRing = document.getElementById('bag-effect-ring');

  // 친구 캐릭터 컨테이너 (랏코 스승님 or 쿠리만쥬)
  const friendActorEl = document.getElementById('friend-actor');
  const friendSpriteWrapper = document.getElementById('friend-sprite-wrapper');
  const friendImg = document.getElementById('friend-img');
  const friendSpeech = document.getElementById('friend-speech');

  const bagMenu = document.getElementById('bag-menu');
  const btnCloseBag = document.getElementById('btn-close-bag');
  const bookmarkListEl = document.getElementById('bookmark-list');
  const btnShowAddForm = document.getElementById('btn-show-add-form');
  const addBookmarkForm = document.getElementById('add-bookmark-form');
  const emojiSelector = document.getElementById('emoji-selector');
  const bmNameInput = document.getElementById('bm-name-input');
  const bmUrlInput = document.getElementById('bm-url-input');
  const btnCancelAdd = document.getElementById('btn-cancel-add');

  const timerDoneToast = document.getElementById('timer-done-toast');
  const btnToastBreak = document.getElementById('btn-toast-break');
  const btnToastBag = document.getElementById('btn-toast-bag');
  const btnToastDismiss = document.getElementById('btn-toast-dismiss');

  const appVersionText = document.getElementById('app-version-text');
  const btnCheckUpdate = document.getElementById('btn-check-update');
  const btnInstallUpdate = document.getElementById('btn-install-update');
  const updateReadyToast = document.getElementById('update-ready-toast');
  const updateToastTitle = document.getElementById('update-toast-title');
  const updateToastDesc = document.getElementById('update-toast-desc');
  const btnUpdateRestart = document.getElementById('btn-update-restart');
  const btnUpdateLater = document.getElementById('btn-update-later');

  // Web Audio Cute Sound Effects
  const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

  function playTone(freq, type = 'sine', duration = 0.14, delay = 0, gainVal = 0.12) {
    try {
      if (audioCtx.state === 'suspended') audioCtx.resume();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime + delay);
      gain.gain.setValueAtTime(gainVal, audioCtx.currentTime + delay);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + delay + duration);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start(audioCtx.currentTime + delay);
      osc.stop(audioCtx.currentTime + delay + duration);
    } catch (_) { }
  }

  function playPopSound() {
    playTone(520, 'triangle', 0.09, 0, 0.1);
    playTone(740, 'triangle', 0.11, 0.06, 0.1);
  }

  function playRummageSound() {
    playTone(340, 'sine', 0.08, 0, 0.08);
    playTone(420, 'sine', 0.08, 0.08, 0.08);
    playTone(580, 'triangle', 0.12, 0.16, 0.1);
  }

  function playHaaFanfare() {
    playTone(523.25, 'triangle', 0.18, 0, 0.15);
    playTone(659.25, 'triangle', 0.18, 0.12, 0.15);
    playTone(783.99, 'triangle', 0.18, 0.24, 0.15);
    playTone(1046.5, 'triangle', 0.45, 0.36, 0.18);
  }

  // Click-Through & Draggable UI Management
  let lastIgnoreState = false;
  let isAnyUiDragging = false;

  window.addEventListener('mousemove', (e) => {
    const anyDragging = (typeof getActiveActors === 'function')
      ? getActiveActors().some((a) => a.isDragging)
      : (typeof actor !== 'undefined' && actor.isDragging);

    if (anyDragging || isAnyUiDragging) {
      if (lastIgnoreState !== false) {
        lastIgnoreState = false;
        window.electronAPI?.setIgnoreMouseEvents(false);
      }
      return;
    }
    const elem = document.elementFromPoint(e.clientX, e.clientY);
    const isInteractive = Boolean(elem && elem.closest('.interactive-ui'));
    const shouldIgnore = !isInteractive;
    if (shouldIgnore !== lastIgnoreState) {
      lastIgnoreState = shouldIgnore;
      window.electronAPI?.setIgnoreMouseEvents(shouldIgnore);
    }
  });

  function makeDraggable(element, handleElement, storageKey) {
    if (!element || !handleElement) return;

    // 저장된 위치 복원
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const { left, top } = JSON.parse(saved);
        const maxL = Math.max(0, window.innerWidth - (element.offsetWidth || 260));
        const maxT = Math.max(0, window.innerHeight - (element.offsetHeight || 60));
        element.style.left = `${Math.min(Math.max(0, left), maxL)}px`;
        element.style.top = `${Math.min(Math.max(0, top), maxT)}px`;
        element.style.right = 'auto';
      }
    } catch (_) { }

    let isDragging = false;
    let startX = 0;
    let startY = 0;
    let initialL = 0;
    let initialT = 0;

    handleElement.addEventListener('pointerdown', (e) => {
      if (e.target.closest('button, input, select, textarea, a, .icon-close-btn')) return;
      if (e.button !== 0) return;

      isDragging = true;
      isAnyUiDragging = true;
      element.classList.add('dragging');
      if (handleElement !== element) handleElement.classList.add('dragging');

      const rect = element.getBoundingClientRect();
      startX = e.clientX;
      startY = e.clientY;
      initialL = rect.left;
      initialT = rect.top;

      element.style.left = `${initialL}px`;
      element.style.top = `${initialT}px`;
      element.style.right = 'auto';

      try {
        handleElement.setPointerCapture(e.pointerId);
      } catch (_) { }
      e.stopPropagation();
    });

    handleElement.addEventListener('pointermove', (e) => {
      if (!isDragging) return;
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;

      const maxL = Math.max(0, window.innerWidth - element.offsetWidth);
      const maxT = Math.max(0, window.innerHeight - element.offsetHeight);

      const targetL = Math.min(Math.max(0, initialL + dx), maxL);
      const targetT = Math.min(Math.max(0, initialT + dy), maxT);

      const parsedL = parseFloat(element.style.left);
      const parsedT = parseFloat(element.style.top);
      const prevL = !Number.isNaN(parsedL) ? parsedL : initialL;
      const prevT = !Number.isNaN(parsedT) ? parsedT : initialT;
      const deltaL = targetL - prevL;
      const deltaT = targetT - prevT;

      element.style.left = `${targetL}px`;
      element.style.top = `${targetT}px`;
      element.style.right = 'auto';

      // 쿠리만쥬가 미니창 위에 올라타 있으면 미니창 이동 시 함께 이동!
      if (element === miniHud && actor.surfaceType === 'mini-hud' && !actor.isDragging) {
        actor.x += deltaL;
        actor.y += deltaT;
        // 미니창 영역 안쪽으로 안전하게 위치 유지
        actor.x = Math.max(targetL - 10, Math.min(targetL + element.offsetWidth - actor.width + 10, actor.x));
      }
    });

    const stopDrag = (e) => {
      if (!isDragging) return;
      isDragging = false;
      isAnyUiDragging = false;
      element.classList.remove('dragging');
      if (handleElement !== element) handleElement.classList.remove('dragging');

      try {
        if (handleElement.hasPointerCapture(e.pointerId)) {
          handleElement.releasePointerCapture(e.pointerId);
        }
      } catch (_) { }

      try {
        const rect = element.getBoundingClientRect();
        localStorage.setItem(storageKey, JSON.stringify({ left: rect.left, top: rect.top }));
      } catch (_) { }
    };

    handleElement.addEventListener('pointerup', stopDrag);
    handleElement.addEventListener('pointercancel', stopDrag);
  }

  // 미니 HUD와 설정창 패널, 축소형 복원 칩을 드래그 가능하게 활성화
  makeDraggable(miniHud, miniHud, 'kurimanju_mini_hud_pos');
  makeDraggable(miniHudCollapsed, miniHudCollapsed, 'kurimanju_collapsed_hud_pos');
  makeDraggable(setupPanel, panelHeader, 'kurimanju_setup_panel_pos');

  // =========================================================
  // 미니 컨트롤 바 최소화(노트북 화면 공간 절약: 완전 숨김 & 더블클릭 복원)
  // =========================================================
  let isHudMinimized = false;
  try {
    const saved = localStorage.getItem('kurimanju_hud_minimized');
    if (saved !== null) isHudMinimized = JSON.parse(saved);
  } catch (_) { }

  function toggleMinimizeHud(minimized) {
    if (typeof minimized === 'boolean') {
      isHudMinimized = minimized;
    } else {
      isHudMinimized = !isHudMinimized;
    }

    try {
      localStorage.setItem('kurimanju_hud_minimized', JSON.stringify(isHudMinimized));
    } catch (_) { }

    if (isHudMinimized) {
      // 노트북 공간 절약: 미니 타이틀바와 복원 칩을 완전히 숨겨 화면을 100% 비웁니다
      miniHud?.classList.add('hidden');
      miniHudCollapsed?.classList.add('hidden');
      // 만약 쿠리만쥬가 미니바 위에 올라타 있었다면 바닥으로 안전 착지
      if (actor.surfaceType === 'mini-hud') {
        attachToWindow(null, 'screen');
        actor.vy = 0.5;
        setActorState('fall');
        showSpeech(resolveQuote(mainActor, 'hudHideDrop', '미니바가 숨겨져서 아래로 폴짝! 🪂'), 1800);
      }
    } else {
      miniHud?.classList.remove('hidden');
      miniHudCollapsed?.classList.add('hidden');
    }
  }

  btnMinimizeHud?.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleMinimizeHud(true);
    showSpeech(resolveQuote(mainActor, 'hudHidden', '타이틀바 숨겼어! 나를 더블클릭하면 다시 나와~ 🌰'), 2800);
  });

  // 캐릭터를 더블클릭하면 미니 타이틀바가 뿅! 하고 나타나거나 숨겨집니다
  actorEl.addEventListener('dblclick', (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleMinimizeHud(!isHudMinimized);
    if (!isHudMinimized) {
      showSpeech(resolveQuote(mainActor, 'hudShow', '타이틀바 짠! ✨'), 2000);
    }
  });

  friendActorEl?.addEventListener('dblclick', (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleMinimizeHud(!isHudMinimized);
    if (!isHudMinimized) {
      showActorSpeech(friendActor, resolveQuote(friendActor, 'hudShowFriend', '타이틀바를 불렀다! ✨'), 2000);
    }
  });

  // 축소 칩 클릭 시에도 복원 지원
  miniHudCollapsed?.addEventListener('click', () => {
    toggleMinimizeHud(false);
    showSpeech(resolveQuote(mainActor, 'hudRestoreChip', '타이틀바 다시 열었어! 🌰'), 1800);
  });

  // =========================================================
  // 1. 외부 창(크롬, 카카오톡, 탐색기 등) 우선순위 감지 시스템
  // =========================================================
  let trackedWindows = [];
  let priorityWindow = null;

  function getAppScore(proc) {
    const p = (proc || '').toLowerCase();
    if (p.includes('chrome') || p.includes('msedge') || p.includes('whale') || p.includes('brave') || p.includes('firefox')) {
      return 45; // 1순위 앱군: 크롬 및 웹 브라우저
    }
    if (p.includes('kakaotalk')) {
      return 40; // 2순위 앱군: 카카오톡
    }
    if (p === 'explorer') {
      return 35; // 3순위 앱군: 파일 탐색기
    }
    return 20;   // 4순위 앱군: 기타 일반 창 (메모장, 디스코드 등)
  }

  function getFriendlyAppName(win) {
    if (!win) return '바탕화면';
    const p = (win.proc || '').toLowerCase();
    if (p.includes('chrome')) return '크롬 창';
    if (p.includes('kakaotalk')) return '카카오톡 창';
    if (p === 'explorer') return '파일 탐색기 창';
    if (p.includes('msedge')) return '엣지 창';
    if (p.includes('whale')) return '웨일 창';
    return (win.title || '창').slice(0, 10);
  }

  function isClimbableWindow(w) {
    // 풀창(최대화)이 아니고 화면 안에 지붕이나 옆벽이 노출된 창만 등반 대상
    if (!w || w.isMaximized) return false;
    if (w.width < 180 || w.height < 120) return false;
    const hasVisibleRoof = w.y >= 45 && w.y <= window.innerHeight - 100;
    const hasVisibleWall = (w.x >= 25 && w.x <= window.innerWidth - 60) ||
      (w.x + w.width >= 60 && w.x + w.width <= window.innerWidth - 25);
    return hasVisibleRoof || hasVisibleWall;
  }

  function selectPriorityWindow(windows) {
    // 1순위: 사용자가 마우스로 직접 쿠리만쥬를 올려놓은 창이 아직 화면에 있으면 유지
    if (actor.attachedHwnd) {
      const attached = windows.find((w) => w.hwnd === actor.attachedHwnd && isClimbableWindow(w));
      if (attached) return attached;
    }

    // 2순위: 현재 활성화된 맨 앞(Foreground) 창이 '창 모드'라면 최우선 선택
    const fgWin = windows.find((w) => w.isForeground && isClimbableWindow(w));
    if (fgWin) return fgWin;

    // 3순위: 맨 앞 창이 풀창(최대화)이거나 없을 때, 화면에 떠 있는 창 모드 중 (앱 우선순위 + 앞쪽 Z-Order) 최고점 창 선택
    let bestWin = null;
    let bestScore = -9999;
    for (const w of windows) {
      if (!isClimbableWindow(w)) continue;
      const score = getAppScore(w.proc) - (w.z * 7);
      if (score > bestScore) {
        bestScore = score;
        bestWin = w;
      }
    }
    return bestWin; // 없으면 null -> 4순위: 기본 모니터 테두리/작업표시줄 모드
  }

  // =========================================================
  // 2. 캐릭터 테마 & 다중 시메지(Multi-Actor) 물리 시스템
  // =========================================================
  let currentMainChar = 'kurimanju';
  try {
    const savedChar = localStorage.getItem('kurimanju_main_char');
    if (savedChar && charConfigs[savedChar]) currentMainChar = savedChar;
  } catch (_) { }

  let isFriendActive = false;
  try {
    const savedFriend = localStorage.getItem('kurimanju_friend_active');
    if (savedFriend !== null) isFriendActive = JSON.parse(savedFriend);
  } catch (_) { }

  // 발바닥이 지붕(타이틀바)에 자연스럽게 닿도록 하는 오프셋
  const FOOT_OFFSET = 12;

  function createActor(id, charType, isMain) {
    return {
      id,
      charType,
      isMain,
      spawned: false,
      x: Math.floor(window.innerWidth * 0.5 - 65) + (isMain ? -45 : 45),
      y: 60,
      vx: 0,
      vy: 0,
      width: 135,
      height: 135,
      dir: isMain ? 1 : -1,
      climbDir: -1,
      wallSide: isMain ? 'right' : 'left',
      surfaceType: 'screen', // 'screen' | 'win-roof' | 'win-wall'
      attachedHwnd: null,
      lastWinPos: null,
      state: 'idle',
      frameIndex: 0,
      stateTimer: 0,
      isDragging: false,
      dragOffsetX: 65,
      dragOffsetY: 50,
      lastMouseX: 0,
      tiltDeg: 0,
      speechTimeout: null,
      miniHudJumpCooldown: 0,
      winRoofJumpCooldown: 0,
      lastJumpedWinHwnd: null,
      el: isMain ? actorEl : friendActorEl,
      speechEl: isMain ? actorSpeech : friendSpeech,
      wrapperEl: isMain ? spriteWrapper : friendSpriteWrapper,
      imgEl: isMain ? actorImg : friendImg
    };
  }

  const mainActor = createActor('main', currentMainChar, true);
  const friendActor = createActor('friend', currentMainChar === 'kurimanju' ? 'rakko' : 'kurimanju', false);
  const actor = mainActor; // 기존 단일 actor 호출 호환성 유지

  function getActiveActors() {
    return isFriendActive && friendActor.spawned ? [mainActor, friendActor] : [mainActor];
  }

  function getAttachedWindow(act = mainActor) {
    if (!act.attachedHwnd) return null;
    return trackedWindows.find((w) => w.hwnd === act.attachedHwnd && isClimbableWindow(w)) || null;
  }

  function attachToWindow(actOrWin, winOrSurface, maybeSurface) {
    let act = mainActor;
    let win = actOrWin;
    let surfaceType = winOrSurface;

    if (actOrWin && actOrWin.id && (actOrWin.id === 'main' || actOrWin.id === 'friend')) {
      act = actOrWin;
      win = winOrSurface;
      surfaceType = maybeSurface;
    }

    if (!win) {
      act.attachedHwnd = null;
      act.surfaceType = surfaceType || 'screen';
      act.lastWinPos = null;
      return;
    }
    act.attachedHwnd = win.hwnd;
    act.surfaceType = surfaceType;
    act.lastWinPos = { x: win.x, y: win.y, width: win.width, height: win.height };
  }

  window.electronAPI?.onWindowsUpdate((windows) => {
    trackedWindows = windows || [];

    for (const act of [mainActor, friendActor]) {
      const prevAttached = act.attachedHwnd
        ? trackedWindows.find((w) => w.hwnd === act.attachedHwnd)
        : null;

      // 만약 액터가 올라타 있던 창이 닫히거나 최소화/풀창이 되면 바닥으로 낙하!
      if (act.attachedHwnd && (!prevAttached || !isClimbableWindow(prevAttached))) {
        act.attachedHwnd = null;
        act.surfaceType = 'screen';
        if (!act.isDragging && act.state !== 'fall') {
          act.vy = 0.5;
          setSingleActorState(act, 'fall');
          showActorSpeech(act, resolveQuote(act, 'winVanish', '앗! 창이 사라졌다~! 🪂'), 1800);
        }
      } else if (act.attachedHwnd && prevAttached && act.lastWinPos) {
        // 올라타 있는 창을 마우스로 움직이면 액터도 창을 따라 같이 이동!
        const dx = prevAttached.x - act.lastWinPos.x;
        const dy = prevAttached.y - act.lastWinPos.y;
        if (Math.abs(dx) > 0 || Math.abs(dy) > 0) {
          act.x += dx;
          act.y += dy;
        }
        act.lastWinPos = { x: prevAttached.x, y: prevAttached.y, width: prevAttached.width, height: prevAttached.height };
      }
    }

    priorityWindow = selectPriorityWindow(trackedWindows);
  });

  // =========================================================
  // 활동 모드 관리 (자유 산책 vs 얌전 모드 & 자세 고정)
  // =========================================================
  let isWanderEnabled = true;
  try {
    const saved = localStorage.getItem('kurimanju_wander_enabled');
    if (saved !== null) isWanderEnabled = JSON.parse(saved);
  } catch (_) { }

  let lockedPose = null; // null: 자동 스토리 순환, string: 특정 자세로 고정 유지 ("너 이 동작으로 가만히 있어")
  let calmRoutine = 1;   // 1: 일과 스토리, 2: 심심 루틴
  let calmStep = 0;
  let calmTimer = 300;   // 약 5초 (60fps 기준 300프레임)

  // 1. 일과 스토리: idle(5초) -> bag(5초) -> snack(5초) -> haa(5초) -> sleep(5초)
  const DEFAULT_CALM_STORY_STEPS = [
    { state: 'idle', duration: 300, speech: '주인 일하네? 👀' },
    { state: 'bag', duration: 300, speech: '나도 일해야지~ 🎒' },
    { state: 'snack', duration: 300, speech: '나는 술 자격증 보유자 🍶' },
    { state: 'haa', duration: 300, speech: '크아아ー!! 🍺' },
    { state: 'sleep', duration: 300, speech: '윽.. 숙취~~ 💤' }
  ];

  // 2. 심심 루틴: land(바닥에 철퍼덕 엎드림)와 idle을 5초씩 번갈아가며 귀엽게 심심해하는 액션!
  const DEFAULT_CALM_BORED_STEPS = [
    { state: 'land', duration: 300, speech: '바닥에 철퍼덕.. 심심해 놀아줘어~ 🥺' },
    { state: 'idle', duration: 300, speech: '나 돌아다닐래~ 아니면 옮겨줘~~' },
    { state: 'land', duration: 300, speech: '뒹굴뒹굴.. 심심해서 납작해지는 중 🥱' },
    { state: 'idle', duration: 300, speech: '일 언제 끝나..? 지켜보는 중 👀' }
  ];

  function getCalmSteps(routineNum) {
    const quotes = getActorQuotes(mainActor);
    if (routineNum === 1) {
      return Array.isArray(quotes.calmStory) && quotes.calmStory.length > 0
        ? quotes.calmStory
        : DEFAULT_CALM_STORY_STEPS;
    }
    return Array.isArray(quotes.calmBored) && quotes.calmBored.length > 0
      ? quotes.calmBored
      : DEFAULT_CALM_BORED_STEPS;
  }

  function runCalmTick() {
    if (actor.isDragging || actor.state === 'fall' || actor.state === 'grabbed') return;

    // 만약 사용자가 특정 자세로 고정해 둔 경우 ("너 이 동작으로 가만히 있어")
    if (lockedPose) {
      if (actor.state !== lockedPose) {
        setActorState(lockedPose, 9999);
      }
      return;
    }

    calmTimer--;
    if (calmTimer <= 0) {
      const prevList = getCalmSteps(calmRoutine);
      calmStep++;
      if (calmStep >= prevList.length) {
        calmRoutine = calmRoutine === 1 ? 2 : 1;
        calmStep = 0;
      }

      const stepList = getCalmSteps(calmRoutine);
      const current = stepList[calmStep] || stepList[0];
      setActorState(current.state, current.duration);
      calmTimer = current.duration;
      if (current.speech) showSpeech(current.speech, 2200);
    }
  }

  function setWanderMode(enabled, notify = true) {
    isWanderEnabled = Boolean(enabled);
    lockedPose = null;
    try {
      localStorage.setItem('kurimanju_wander_enabled', JSON.stringify(isWanderEnabled));
    } catch (_) { }

    updateWanderModeUI();

    if (isWanderEnabled) {
      if (notify) showSpeech(resolveQuote(mainActor, 'wanderStart', '자유 산책 시작~! 🐾'), 2000);
      pickNextGroundBehavior();
    } else {
      calmRoutine = 1;
      calmStep = 0;
      const initial = getCalmSteps(1)[0];
      setActorState(initial.state, initial.duration);
      calmTimer = initial.duration;
      if (notify) showSpeech(initial.speech, 2200);
    }
  }

  function updateWanderModeUI() {
    if (btnToggleWander) {
      if (isWanderEnabled) {
        btnToggleWander.textContent = '🐾 산책중';
        btnToggleWander.classList.remove('calm');
        btnToggleWander.title = '클릭하면 얌전 모드로 전환합니다';
      } else {
        btnToggleWander.textContent = '🪑 얌전모드';
        btnToggleWander.classList.add('calm');
        btnToggleWander.title = '클릭하면 자유 산책을 시작합니다';
      }
    }
    if (btnPanelToggleWander && modeDesc) {
      if (isWanderEnabled) {
        btnPanelToggleWander.textContent = '🐾 자유 산책 ON';
        btnPanelToggleWander.classList.remove('calm');
        modeDesc.textContent = '현재 자유롭게 창과 화면을 돌아다닙니다.';
      } else {
        btnPanelToggleWander.textContent = '🪑 얌전 모드 ON';
        btnPanelToggleWander.classList.add('calm');
        modeDesc.textContent = '이동을 멈추고 제자리에서 얌전히 행동합니다.';
      }
    }
  }

  // =========================================================
  // 말풍선 대사 ON/OFF 토글 시스템 (유저 요청)
  // =========================================================
  let isSpeechEnabled = true;
  try {
    const saved = localStorage.getItem('kurimanju_speech_enabled');
    if (saved !== null) isSpeechEnabled = JSON.parse(saved);
  } catch (_) { }

  function setSpeechEnabled(enabled, notify = true) {
    isSpeechEnabled = Boolean(enabled);
    try {
      localStorage.setItem('kurimanju_speech_enabled', JSON.stringify(isSpeechEnabled));
    } catch (_) { }

    if (btnToggleSpeech) {
      if (isSpeechEnabled) {
        btnToggleSpeech.textContent = '💬 말풍선 ON';
        btnToggleSpeech.classList.remove('off');
        btnToggleSpeech.title = '클릭하면 말풍선을 끕니다';
      } else {
        btnToggleSpeech.textContent = '🔇 말풍선 OFF';
        btnToggleSpeech.classList.add('off');
        btnToggleSpeech.title = '클릭하면 말풍선을 켭니다';
      }
    }

    if (!isSpeechEnabled) {
      actorSpeech.classList.add('hidden');
      if (actor.speechTimeout) clearTimeout(actor.speechTimeout);
    } else if (notify) {
      showSpeech(resolveQuote(mainActor, 'speechOn', '말풍선 켰어! 🌰'), 2000);
    }
  }

  btnToggleSpeech?.addEventListener('click', () => {
    setSpeechEnabled(!isSpeechEnabled);
  });

  function getActorConfig(act = mainActor) {
    const type = act?.charType || currentMainChar || 'kurimanju';
    return charConfigs[type] || charConfigs.kurimanju || {};
  }

  function getActorQuotes(act = mainActor) {
    return getActorConfig(act).quotes || {};
  }

  function resolveQuote(act, key, fallback, ...args) {
    const val = getActorQuotes(act)?.[key];
    if (typeof val === 'function') return val(...args);
    if (typeof val === 'string') return val;
    return typeof fallback === 'function' ? fallback(...args) : fallback;
  }

  function updateActorSpeechPosition(act) {
    if (!act || !act.speechEl || act.speechEl.classList.contains('hidden')) return;

    const speechW = act.speechEl.offsetWidth || 120;
    const speechH = act.speechEl.offsetHeight || 28;
    const actorCenterX = act.x + act.width * 0.5;
    const margin = 8;

    // 1) 좌·우 사이드 화면 밖 잘림 방지
    let shiftX = 0;
    const idealLeft = actorCenterX - speechW * 0.5;
    const idealRight = actorCenterX + speechW * 0.5;
    if (idealLeft < margin) {
      shiftX = margin - idealLeft;
    } else if (idealRight > window.innerWidth - margin) {
      shiftX = (window.innerWidth - margin) - idealRight;
    }

    const maxTailOffset = Math.max(0, speechW * 0.5 - 12);
    const tailOffset = Math.max(-maxTailOffset, Math.min(maxTailOffset, -shiftX));
    act.speechEl.style.setProperty('--speech-shift-x', `${Math.round(shiftX)}px`);
    act.speechEl.style.setProperty('--tail-offset', `${Math.round(tailOffset)}px`);

    // 2) 천장/상단 근처에서는 말풍선을 캐릭터 아래쪽에 표시해 잘리지 않게 유지
    const topSpaceNeeded = speechH - 2;
    const hasBelowSpace = act.y + act.height + speechH < window.innerHeight - 6;
    if (act.y < topSpaceNeeded && hasBelowSpace) {
      act.speechEl.classList.add('speech-below');
    } else {
      act.speechEl.classList.remove('speech-below');
    }
  }

  function showActorSpeech(act, text, durationMs = 2600) {
    if (!isSpeechEnabled || !act || !act.speechEl) return;
    act.speechEl.textContent = text;
    act.speechEl.classList.remove('hidden');
    updateActorSpeechPosition(act);
    if (act.speechTimeout) clearTimeout(act.speechTimeout);
    if (durationMs > 0) {
      act.speechTimeout = setTimeout(() => {
        act.speechEl.classList.add('hidden');
      }, durationMs);
    }
  }

  function showSpeech(text, durationMs = 2600) {
    showActorSpeech(mainActor, text, durationMs);
  }

  function setSingleActorState(act, newState, durationFrames = 180) {
    if (act.state !== newState) {
      act.state = newState;
      act.frameIndex = 0;
      updateActorSpriteFrame(act);
    }
    act.stateTimer = durationFrames;

    if (act.isMain && bagEffectRing) {
      if (newState === 'bag') {
        bagEffectRing.classList.remove('hidden');
      } else {
        bagEffectRing.classList.add('hidden');
      }
    }
  }

  function setActorState(newState, durationFrames = 180) {
    setSingleActorState(mainActor, newState, durationFrames);
  }

  // =========================================================
  // PNG 자동 인식 & 이미지 싱크(여백/중심/발바닥 위치) 자동 보정 엔진
  // =========================================================
  const alignedSpriteCache = new Map();

  function normalizeFrameEntry(entry) {
    if (typeof entry === 'string') {
      return { src: entry, offsetX: 0, offsetY: 0, scale: 1 };
    }
    return {
      src: entry.src,
      offsetX: entry.offsetX || 0,
      offsetY: entry.offsetY || 0,
      scale: entry.scale || 1
    };
  }

  function autoAlignImageToDataUrl(img, stateName, frameMeta) {
    const canvasW = 135;
    const canvasH = 135;

    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = img.naturalWidth || img.width || canvasW;
    tempCanvas.height = img.naturalHeight || img.height || canvasH;
    const tempCtx = tempCanvas.getContext('2d', { willReadFrequently: true });
    tempCtx.drawImage(img, 0, 0);

    const { width: iw, height: ih } = tempCanvas;
    let minX = iw, minY = ih, maxX = 0, maxY = 0;
    let foundPixel = false;

    try {
      const imgDataObj = tempCtx.getImageData(0, 0, iw, ih);
      const data = imgDataObj.data;

      // 1) 만약 이미지 바깥 배경이 흰색(#FFFFFF)이면 테두리에서부터 Flood-Fill로 바깥 흰 배경만 깔끔하게 투명화 (안쪽 눈동자/맥주거품은 보존!)
      const isWhitePixel = (idx) => data[idx + 3] > 20 && data[idx] > 238 && data[idx + 1] > 238 && data[idx + 2] > 238;
      const corners = [0, (iw - 1) * 4, (ih - 1) * iw * 4, ((ih - 1) * iw + (iw - 1)) * 4];
      const hasWhiteBg = corners.some((c) => isWhitePixel(c));

      if (hasWhiteBg) {
        const visited = new Uint8Array(iw * ih);
        const queue = new Int32Array(iw * ih);
        let head = 0;
        let tail = 0;

        const pushIfBg = (x, y) => {
          const p = y * iw + x;
          if (visited[p]) return;
          const idx = p * 4;
          if (data[idx + 3] <= 20 || (data[idx] > 232 && data[idx + 1] > 232 && data[idx + 2] > 232)) {
            visited[p] = 1;
            queue[tail++] = p;
          }
        };

        for (let x = 0; x < iw; x++) {
          pushIfBg(x, 0);
          pushIfBg(x, ih - 1);
        }
        for (let y = 0; y < ih; y++) {
          pushIfBg(0, y);
          pushIfBg(iw - 1, y);
        }

        while (head < tail) {
          const p = queue[head++];
          const idx = p * 4;
          data[idx + 3] = 0; // 투명화
          const x = p % iw;
          const y = (p - x) / iw;
          if (x > 0) pushIfBg(x - 1, y);
          if (x + 1 < iw) pushIfBg(x + 1, y);
          if (y > 0) pushIfBg(x, y - 1);
          if (y + 1 < ih) pushIfBg(x, y + 1);
        }

        // 외곽선 경계 부드럽게 안티앨리어싱 처리
        for (let y = 1; y < ih - 1; y++) {
          for (let x = 1; x < iw - 1; x++) {
            const p = y * iw + x;
            if (visited[p]) continue;
            const idx = p * 4;
            if (data[idx] > 215 && data[idx + 1] > 215 && data[idx + 2] > 215) {
              if (visited[p - 1] || visited[p + 1] || visited[p - iw] || visited[p + iw]) {
                data[idx + 3] = Math.min(data[idx + 3], 90);
              }
            }
          }
        }
        tempCtx.putImageData(imgDataObj, 0, 0);
      }

      // 2) 투명 여백을 제외한 실제 캐릭터 픽셀 경계(Bounding Box) 측정
      for (let y = 0; y < ih; y++) {
        for (let x = 0; x < iw; x++) {
          const alpha = data[(y * iw + x) * 4 + 3];
          if (alpha > 25) {
            if (x < minX) minX = x;
            if (x > maxX) maxX = x;
            if (y < minY) minY = y;
            if (y > maxY) maxY = y;
            foundPixel = true;
          }
        }
      }
    } catch (_) {
      return frameMeta.src;
    }

    if (!foundPixel) return frameMeta.src;

    const cropW = Math.max(1, maxX - minX + 1);
    const cropH = Math.max(1, maxY - minY + 1);

    const outCanvas = document.createElement('canvas');
    outCanvas.width = canvasW;
    outCanvas.height = canvasH;
    const outCtx = outCanvas.getContext('2d');

    // 3) 동작별 비율 & 기준점(Anchor) 맞춤
    const baseRatio = 0.85 * (frameMeta.scale || 1);
    let scale;

    if (stateName === 'land') {
      scale = (canvasW * 0.90 * (frameMeta.scale || 1)) / cropW;
    } else if (stateName === 'grabbed') {
      scale = Math.min((canvasH * 0.94) / cropH, (canvasW * 0.92) / cropW);
    } else if (stateName === 'walk' || stateName === 'idle' || stateName === 'haa' || stateName === 'bag') {
      scale = Math.min((canvasH * baseRatio) / cropH, (canvasW * 0.92) / cropW);
    } else {
      scale = Math.min((canvasH * baseRatio) / cropH, (canvasW * 0.90) / cropW);
    }

    const drawW = cropW * scale;
    const drawH = cropH * scale;

    let destX;
    if (stateName === 'climb') {
      // 등반 스프라이트는 손·발 끝(오른쪽 끝)을 캔버스 우측 끝 4px 안쪽에 맞춰 벽 테두리에 딱 닿게 정렬
      destX = Math.round(canvasW - 4 - drawW + (frameMeta.offsetX || 0));
    } else {
      destX = Math.round((canvasW - drawW) / 2 + (frameMeta.offsetX || 0));
    }
    let destY;

    if (stateName === 'grabbed') {
      destY = Math.round(2 + (frameMeta.offsetY || 0));
    } else if (stateName === 'ceiling') {
      destY = Math.round(4 + (frameMeta.offsetY || 0));
    } else {
      const footBaseline = canvasH - 6;
      destY = Math.round(footBaseline - drawH + (frameMeta.offsetY || 0));
    }

    outCtx.drawImage(tempCanvas, minX, minY, cropW, cropH, destX, destY, drawW, drawH);
    return outCanvas.toDataURL('image/png');
  }

  async function initSpritesAndAutoAlign() {
    try {
      const files = (await window.electronAPI?.listSpriteFiles?.()) || [];
      const fileSet = new Set(files.map((f) => f.toLowerCase()));
      const extsPriority = ['.png', '.webp', '.gif'];

      for (const [charKey, charObj] of Object.entries(charConfigs)) {
        if (!charObj.states) continue;
        for (const [stateName, frameList] of Object.entries(charObj.states)) {
          charObj.states[stateName] = frameList.map((entry) => {
            const meta = normalizeFrameEntry(entry);
            const baseMatch = meta.src.match(/^assets\/sprites\/([^.]+)\.[a-z0-9]+$/i);
            if (baseMatch) {
              const baseName = baseMatch[1].toLowerCase();
              for (const ext of extsPriority) {
                if (fileSet.has(baseName + ext)) {
                  const actualFile = files.find((f) => f.toLowerCase() === baseName + ext);
                  meta.src = `assets/sprites/${actualFile}`;
                  break;
                }
              }
            }
            return meta;
          });

          for (const meta of charObj.states[stateName]) {
            const cacheKey = `${charKey}:${stateName}:${meta.src}:${meta.offsetX}:${meta.offsetY}:${meta.scale}`;
            if (alignedSpriteCache.has(cacheKey)) continue;

            const img = new Image();
            img.src = meta.src;
            await new Promise((resolve) => {
              img.onload = () => {
                const alignedUrl = autoAlignImageToDataUrl(img, stateName, meta);
                alignedSpriteCache.set(cacheKey, alignedUrl);
                resolve();
              };
              img.onerror = () => resolve();
            });
          }
        }
      }
      updateSpriteFrame();
    } catch (e) {
      console.warn('Sprite auto-align skipped:', e);
    }
  }

  function updateActorSpriteFrame(act) {
    if (!act || !act.imgEl) return;
    const cfg = charConfigs[act.charType] || charConfigs.kurimanju;
    const states = cfg.states || {};
    const frames = states[act.state] || states.idle || [];
    if (!frames.length) return;
    const rawEntry = frames[act.frameIndex % frames.length];
    const meta = normalizeFrameEntry(rawEntry);
    const cacheKey = `${act.charType}:${act.state}:${meta.src}:${meta.offsetX}:${meta.offsetY}:${meta.scale}`;
    const resolvedSrc = alignedSpriteCache.get(cacheKey) || meta.src;

    if (act.imgEl.getAttribute('src') !== resolvedSrc) {
      act.imgEl.setAttribute('src', resolvedSrc);
    }
  }

  function updateSpriteFrame() {
    updateActorSpriteFrame(mainActor);
    if (isFriendActive) updateActorSpriteFrame(friendActor);
  }

  setInterval(() => {
    for (const act of [mainActor, friendActor]) {
      if (!act.spawned) continue;
      const cfg = charConfigs[act.charType] || charConfigs.kurimanju;
      const states = cfg.states || {};
      const frames = states[act.state] || states.idle || [];
      if (frames.length > 1) {
        act.frameIndex = (act.frameIndex + 1) % frames.length;
        updateActorSpriteFrame(act);
      }
    }
  }, 220);

  function spawnActor(act, dropFromTop = true) {
    act.spawned = true;
    act.el?.classList.remove('hidden');
    if (dropFromTop) {
      attachToWindow(act, null, 'screen');
      const maxX = window.innerWidth - act.width;
      if (priorityWindow && priorityWindow.y >= 55) {
        const offset = act.isMain ? 0.35 : 0.65;
        act.x = Math.max(20, Math.min(maxX - 20, priorityWindow.x + Math.floor(priorityWindow.width * offset)));
      } else {
        const center = Math.floor(window.innerWidth * 0.45);
        act.x = Math.max(80, Math.min(window.innerWidth - 200, center + (act.isMain ? -50 : 50)));
      }
      act.y = 10;
      act.vx = (Math.random() - 0.5) * 1.5;
      act.vy = 0.8;
      setSingleActorState(act, 'fall');
      const cfg = charConfigs[act.charType] || charConfigs.kurimanju;
      showActorSpeech(act, cfg.quotes?.spawn || '출근이다! 🐾', 2400);
      playPopSound();
    }
  }

  function spawnKurimanju(dropFromTop = true) {
    spawnActor(mainActor, dropFromTop);
    if (isFriendActive) {
      spawnActor(friendActor, dropFromTop);
    }
  }

  function pickNextGroundBehavior(act = mainActor) {
    const cfg = charConfigs[act.charType] || charConfigs.kurimanju;
    const quotes = cfg.quotes || {};
    const rand = Math.random();

    if (rand < 0.45) {
      act.dir = Math.random() < 0.5 ? -1 : 1;
      setSingleActorState(act, 'walk', 180 + Math.floor(Math.random() * 200));
    } else if (rand < 0.65) {
      setSingleActorState(act, 'snack', 170 + Math.floor(Math.random() * 110));
      const snackList = Array.isArray(quotes.snack) ? quotes.snack : ['오물오물.. 🍘'];
      showActorSpeech(act, snackList[Math.floor(Math.random() * snackList.length)], 2400);
    } else if (rand < 0.80) {
      setSingleActorState(act, 'haa', 130);
      showActorSpeech(act, quotes.haa || '하아ー!! ✨', 2200);
    } else if (rand < 0.88) {
      if (Math.random() < 0.5) {
        setSingleActorState(act, 'dream', 180 + Math.floor(Math.random() * 120));
        showActorSpeech(act, quotes.dream || '쿨쿨.. 낮잠 타임 😴💤', 2500);
      } else {
        setSingleActorState(act, 'sleep', 180 + Math.floor(Math.random() * 120));
        showActorSpeech(act, quotes.sleep || '으윽.. 휴식이다 💤', 2500);
      }
    } else {
      setSingleActorState(act, 'idle', 100 + Math.floor(Math.random() * 90));
    }
  }

  function updateSingleActorPhysics(act) {
    if (!act.spawned) return;

    const cfg = charConfigs[act.charType] || charConfigs.kurimanju;
    const quotes = cfg.quotes || {};
    const screenGroundY = window.innerHeight - act.height - 6;
    const maxX = window.innerWidth - act.width;
    const attachedWin = getAttachedWindow(act);

    // 현재 바닥 높이와 좌우 이동 한계 계산 (미니창 위 vs 창 지붕 위 vs 바탕화면 바닥)
    let currentFloorY = screenGroundY;
    let minWalkX = 0;
    let maxWalkX = maxX;

    if (act.surfaceType === 'mini-hud') {
      const hudRect = (miniHud && !isHudMinimized) ? miniHud.getBoundingClientRect() : null;
      if (hudRect) {
        currentFloorY = Math.max(0, hudRect.top - act.height + FOOT_OFFSET + 2);
        minWalkX = Math.max(0, hudRect.left - Math.floor(act.width * 0.20));
        maxWalkX = Math.min(maxX, hudRect.right - Math.floor(act.width * 0.80));
        if (!act.isDragging && !isWanderEnabled) {
          act.x = Math.max(minWalkX, Math.min(maxWalkX, act.x));
        }
      }
    } else if (act.surfaceType === 'win-roof' && attachedWin) {
      currentFloorY = Math.max(0, attachedWin.y - act.height + FOOT_OFFSET);
      minWalkX = Math.max(0, attachedWin.x - Math.floor(act.width * 0.35));
      maxWalkX = Math.min(maxX, attachedWin.x + attachedWin.width - Math.floor(act.width * 0.65));
    }

    // 마우스 드래그 틸트(기울기) 복원
    if (act.isDragging) {
      act.tiltDeg *= 0.85;
    } else {
      act.tiltDeg = 0;
    }

    if (act.isDragging) {
      // 드래그 중에는 마우스 위치 추종 (mousemove에서 갱신)
    } else if (act.state === 'fall') {
      const prevFootY = act.y + act.height - FOOT_OFFSET;
      // 느긋하고 부드러운 살랑살랑 낙하 물리 (중력 0.22, 최대 속도 4.8)
      act.vy = Math.min(act.vy + 0.22, 4.8);
      act.x += act.vx;
      act.y += act.vy;
      act.vx *= 0.96;
      const newFootY = act.y + act.height - FOOT_OFFSET;
      const centerX = act.x + act.width * 0.5;

      if (act.miniHudJumpCooldown > 0) {
        act.miniHudJumpCooldown--;
      }

      // 0) 낙하 도중 상단 미니창(HUD 타이틀바)에 착지하는지 체크! (쿨다운 중에는 즉시 재착지 방지)
      const hudRect = (miniHud && !isHudMinimized) ? miniHud.getBoundingClientRect() : null;
      if (hudRect && hudRect.width > 50 && act.miniHudJumpCooldown <= 0) {
        const withinHudX = centerX >= hudRect.left - 15 && centerX <= hudRect.right + 15;
        const crossedHudRoof = prevFootY <= hudRect.top + 16 && newFootY >= hudRect.top - 6 && act.vy >= 0;
        if (withinHudX && crossedHudRoof) {
          attachToWindow(act, null, 'mini-hud');
          act.y = hudRect.top - act.height + FOOT_OFFSET + 2;
          act.vx = 0;
          act.vy = 0;
          setSingleActorState(act, isWanderEnabled ? 'land' : 'idle', 20);
          showActorSpeech(act, resolveQuote(act, 'landMiniHud', '미니창 위에 착지! 🌰'), 2000);
          return;
        }
      }

      // 1) 낙하 도중 우선순위 창(크롬/카톡/탐색기 등)의 지붕(상단 테두리)에 착지하는지 체크!
      if (act.winRoofJumpCooldown > 0) {
        act.winRoofJumpCooldown--;
      }

      let landedOnWin = null;
      const candidateWins = priorityWindow
        ? [priorityWindow, ...trackedWindows.filter((w) => w.hwnd !== priorityWindow.hwnd && isClimbableWindow(w))]
        : trackedWindows.filter(isClimbableWindow);

      for (const w of candidateWins) {
        if (w.y < 45) continue;
        if (act.winRoofJumpCooldown > 0 && w.hwnd === act.lastJumpedWinHwnd) continue;

        const withinX = centerX >= w.x + 10 && centerX <= w.x + w.width - 10;
        const crossedRoof = prevFootY <= w.y + 12 && newFootY >= w.y - 4 && act.vy >= 0;
        if (withinX && crossedRoof) {
          landedOnWin = w;
          break;
        }
      }

      if (landedOnWin) {
        attachToWindow(act, landedOnWin, 'win-roof');
        act.y = landedOnWin.y - act.height + FOOT_OFFSET;
        act.vx = 0;
        act.vy = 0;
        setSingleActorState(act, isWanderEnabled ? 'land' : 'idle', 22);
        showActorSpeech(act, resolveQuote(act, 'landOnWin', (n) => `${n} 위에 착지! ✨`, getFriendlyAppName(landedOnWin)), 2200);
      } else {
        // 화면 좌우 벽 반사
        if (act.x <= 0) {
          act.x = 0;
          act.vx = -act.vx * 0.5;
        } else if (act.x >= maxX) {
          act.x = maxX;
          act.vx = -act.vx * 0.5;
        }

        // 화면 맨 아래 바닥(작업표시줄) 착지
        if (act.y >= screenGroundY) {
          attachToWindow(act, null, 'screen');
          act.y = screenGroundY;
          act.vx = 0;
          act.vy = 0;
          setSingleActorState(act, isWanderEnabled ? 'land' : 'idle', 24);
        }
      }
    } else if (!isWanderEnabled) {
      // [비활성화 / 얌전 모드]: 제자리에서 가만히 머물며 스토리/심심 루틴 또는 잠금 자세 유지
      act.y = currentFloorY;
      act.vx = 0;
      act.vy = 0;
      if (act.isMain) {
        runCalmTick();
      } else {
        if (lockedPose) {
          if (act.state !== lockedPose) setSingleActorState(act, lockedPose, 9999);
        } else if (act.state !== 'idle' && act.state !== 'snack' && act.state !== 'sleep' && act.state !== 'dream') {
          setSingleActorState(act, 'idle', 9999);
        }
      }
    } else if (act.state === 'land') {
      act.y = currentFloorY;
      act.stateTimer--;
      if (act.stateTimer <= 0) {
        pickNextGroundBehavior(act);
      }
    } else if (act.state === 'walk') {
      const speed = 1.85;
      act.x += act.dir * speed;
      act.y = currentFloorY;
      act.stateTimer--;

      if (act.surfaceType === 'mini-hud') {
        // [미니창 상단 타이틀바 위를 걷는 중]
        if (act.x <= minWalkX || act.x >= maxWalkX) {
          const r = Math.random();
          // 미니창 끝에서는 75% 확률로 아래로 대각선 점프! 25% 반대로 회전
          if (r < 0.75) {
            const hudRect = miniHud ? miniHud.getBoundingClientRect() : null;
            act.miniHudJumpCooldown = 120;
            attachToWindow(act, null, 'screen');
            const jumpLeft = act.x <= minWalkX;
            act.dir = jumpLeft ? -1 : 1;
            act.vx = jumpLeft ? -3.2 : 3.2;
            act.vy = 1.0;
            if (hudRect) {
              if (jumpLeft) {
                act.x = hudRect.left - Math.floor(act.width * 0.75);
              } else {
                act.x = hudRect.right - Math.floor(act.width * 0.25);
              }
              act.y = hudRect.bottom + 6;
            }
            setSingleActorState(act, 'fall');
            showActorSpeech(act, resolveQuote(act, 'jumpMiniHud', '미니창에서 대각선 폴짝~! 🪂'), 1800);
          } else {
            act.dir = act.x <= minWalkX ? 1 : -1;
            act.x = Math.max(minWalkX, Math.min(maxWalkX, act.x));
          }
        } else if (act.stateTimer <= 0) {
          pickNextGroundBehavior(act);
        }
      } else if (act.surfaceType === 'win-roof' && attachedWin) {
        // [창 지붕 위를 걷는 중]
        if (act.x <= minWalkX || act.x >= maxWalkX) {
          const r = Math.random();
          if (r < 0.65) {
            const jumpLeft = act.x <= minWalkX;
            act.lastJumpedWinHwnd = attachedWin.hwnd;
            act.winRoofJumpCooldown = 120;
            attachToWindow(act, null, 'screen');

            act.dir = jumpLeft ? -1 : 1;
            act.vx = jumpLeft ? -3.5 : 3.5;
            act.vy = 0.8;
            if (jumpLeft) {
              act.x = attachedWin.x - Math.floor(act.width * 0.75);
            } else {
              act.x = attachedWin.x + attachedWin.width - Math.floor(act.width * 0.25);
            }
            act.y = attachedWin.y + 12;

            setSingleActorState(act, 'fall');
            showActorSpeech(act, resolveQuote(act, 'jump', '지붕 끝에서 대각선 폴짝~! 🪂'), 2000);
          } else if (r < 0.85) {
            act.wallSide = act.x <= minWalkX ? 'left' : 'right';
            act.surfaceType = 'win-wall';
            act.climbDir = 1;
            act.x = getWindowWallX(act, attachedWin, maxX);
            setSingleActorState(act, 'climb', 9999);
            showActorSpeech(act, resolveQuote(act, 'climbDownWin', (n) => `${n} 벽 타고 내려가자~`, getFriendlyAppName(attachedWin)), 2000);
          } else {
            act.dir = act.x <= minWalkX ? 1 : -1;
            act.x = Math.max(minWalkX, Math.min(maxWalkX, act.x));
          }
        } else if (act.stateTimer <= 0) {
          pickNextGroundBehavior(act);
        }
      } else {
        // [바탕화면 바닥(작업표시줄 위)을 걷는 중]
        if (priorityWindow && isClimbableWindow(priorityWindow)) {
          const w = priorityWindow;
          const actorCenterX = act.x + act.width * 0.5;
          const leftWallX = w.x;
          const rightWallX = w.x + w.width;
          const wallReachesLowEnough = (w.y + w.height) >= screenGroundY - 120;

          if (wallReachesLowEnough && w.y >= 45) {
            if (Math.abs(actorCenterX - leftWallX) < 14 && leftWallX > 30 && Math.random() < 0.45) {
              attachToWindow(act, w, 'win-wall');
              act.wallSide = 'left';
              act.dir = 1;
              act.climbDir = -1;
              act.x = getWindowWallX(act, w, maxX);
              setSingleActorState(act, 'climb', 300);
              showActorSpeech(act, resolveQuote(act, 'climbUpWin', (n) => `오! ${n} 타고 올라가자! 🧗`, getFriendlyAppName(w)), 2200);
              return;
            } else if (Math.abs(actorCenterX - rightWallX) < 14 && rightWallX < window.innerWidth - 30 && Math.random() < 0.45) {
              attachToWindow(act, w, 'win-wall');
              act.wallSide = 'right';
              act.dir = -1;
              act.climbDir = -1;
              act.x = getWindowWallX(act, w, maxX);
              setSingleActorState(act, 'climb', 300);
              showActorSpeech(act, resolveQuote(act, 'climbUpWin', (n) => `오! ${n} 타고 올라가자! 🧗`, getFriendlyAppName(w)), 2200);
              return;
            }
          }
        }

        // 모니터 좌/우 끝 벽에 도달했을 때
        if (act.x <= 0) {
          act.x = 0;
          if (Math.random() < 0.72) {
            attachToWindow(act, null, 'screen');
            act.wallSide = 'left';
            act.dir = -1;
            act.climbDir = -1;
            setSingleActorState(act, 'climb', 240 + Math.floor(Math.random() * 180));
            showActorSpeech(act, resolveQuote(act, 'climbWallLeft', '영차.. 모니터 벽 등반! 🧗'), 2000);
          } else {
            act.dir = 1;
          }
        } else if (act.x >= maxX) {
          act.x = maxX;
          if (Math.random() < 0.72) {
            attachToWindow(act, null, 'screen');
            act.wallSide = 'right';
            act.dir = 1;
            act.climbDir = -1;
            setSingleActorState(act, 'climb', 240 + Math.floor(Math.random() * 180));
            showActorSpeech(act, resolveQuote(act, 'climbWallRight', '영차.. 올라가볼까 🧗'), 2000);
          } else {
            act.dir = -1;
          }
        } else if (act.stateTimer <= 0) {
          pickNextGroundBehavior(act);
        }
      }
    } else if (act.state === 'climb') {
      const climbSpeed = 2.4;

      if (act.surfaceType === 'win-wall' && attachedWin) {
        act.x = getWindowWallX(act, attachedWin, maxX);
        act.y += act.climbDir * climbSpeed;

        const roofY = Math.max(0, attachedWin.y - act.height + FOOT_OFFSET);
        const bottomY = Math.min(screenGroundY, attachedWin.y + attachedWin.height - act.height);

        if (act.climbDir < 0) {
          if (act.y <= roofY + 6) {
            act.y = roofY;
            act.surfaceType = 'win-roof';
            act.dir = act.wallSide === 'left' ? 1 : -1;
            const safeRoofX = act.wallSide === 'left'
              ? Math.min(maxX, attachedWin.x + 18)
              : Math.max(0, attachedWin.x + attachedWin.width - act.width - 18);
            act.x = safeRoofX;
            setSingleActorState(act, 'land', 20);
            showActorSpeech(act, resolveQuote(act, 'winTop', (n) => `${n} 꼭대기 정복! ✨`, getFriendlyAppName(attachedWin)), 2400);
          }
        } else {
          if (act.y >= bottomY - 6) {
            attachToWindow(act, null, 'screen');
            if (act.y < screenGroundY - 25) {
              act.vx = (act.wallSide === 'left' ? -1 : 1) * 2.2;
              act.vy = 1;
              setSingleActorState(act, 'fall');
              showActorSpeech(act, resolveQuote(act, 'jumpOffWall', '폴짝 뛰어내리기! 🪂'), 1800);
            } else {
              act.y = screenGroundY;
              act.dir = act.wallSide === 'left' ? -1 : 1;
              setSingleActorState(act, 'walk', 200);
            }
          }
        }
      } else {
        // 모니터 좌/우 끝 벽
        act.x = act.wallSide === 'left' ? 0 : maxX;
        act.y += act.climbDir * climbSpeed;

        if (act.climbDir < 0) {
          if (act.y <= 10) {
            act.y = 8;
            const r = Math.random();
            const anyMaximizedFg = trackedWindows.some((w) => w.isForeground && w.isMaximized);
            if (r < 0.70) {
              act.dir = act.wallSide === 'left' ? 1 : -1;
              setSingleActorState(act, 'ceiling', anyMaximizedFg ? 120 : 260);
              showActorSpeech(act, resolveQuote(act, 'ceiling', '천장 산책 중~ 🌟'), 2000);
            } else {
              act.vx = act.wallSide === 'left' ? 3.0 : -3.0;
              act.vy = 0.5;
              setSingleActorState(act, 'fall');
              showActorSpeech(act, resolveQuote(act, 'dive', '슈웅 다이빙~! 🪂'), 2000);
            }
          }
        } else {
          if (act.y >= screenGroundY) {
            act.y = screenGroundY;
            act.dir = act.wallSide === 'left' ? 1 : -1;
            setSingleActorState(act, 'walk', 200);
            showActorSpeech(act, resolveQuote(act, 'floorArrive', '바닥 도착! 총총~'), 1800);
          }
        }
      }
    } else if (act.state === 'ceiling') {
      const ceilingSpeed = 1.45;
      act.y = 8;
      act.x += act.dir * ceilingSpeed;
      act.stateTimer--;

      if (act.x <= 0) {
        act.x = 0;
        act.wallSide = 'left';
        act.climbDir = 1;
        setSingleActorState(act, 'climb', 260);
      } else if (act.x >= maxX) {
        act.x = maxX;
        act.wallSide = 'right';
        act.climbDir = 1;
        setSingleActorState(act, 'climb', 260);
      } else if (act.stateTimer <= 0) {
        act.vx = (Math.random() - 0.5) * 1.2;
        act.vy = 0.5;
        setSingleActorState(act, 'fall');
        showActorSpeech(act, resolveQuote(act, 'fallReady', '착지 준비~! 🪂'), 1600);
      }
    } else {
      act.y = currentFloorY;
      act.stateTimer--;
      if (act.stateTimer <= 0) {
        pickNextGroundBehavior(act);
      }
    }

    // 화면 밖 탈출 방지 절대 안전 클램핑
    if (!act.isDragging) {
      act.x = Math.max(0, Math.min(maxX, act.x));
      act.y = Math.max(0, Math.min(screenGroundY, act.y));
    }

    if (act.el) {
      act.el.style.left = `${Math.round(act.x)}px`;
      act.el.style.top = `${Math.round(act.y)}px`;
    }

    let scaleX = 1;
    if (act.state === 'walk' || act.state === 'ceiling' || act.state === 'fall') {
      scaleX = act.dir >= 0 ? 1 : -1;
    } else if (act.state === 'climb') {
      // 창 옆벽은 창 바깥에서 창 쪽을 향해 손발을 짚고, 모니터 끝벽은 화면 끝 쪽을 향함
      scaleX = act.surfaceType === 'win-wall'
        ? (act.wallSide === 'left' ? 1 : -1)
        : (act.wallSide === 'right' ? 1 : -1);
    } else {
      scaleX = 1;
    }
    if (act.wrapperEl) {
      act.wrapperEl.style.transform = `scaleX(${scaleX}) rotate(${Math.round(act.tiltDeg)}deg)`;
    }
    updateActorSpeechPosition(act);
  }

  function updatePhysics() {
    for (const act of [mainActor, friendActor]) {
      if (act.spawned) {
        updateSingleActorPhysics(act);
      }
    }
    requestAnimationFrame(updatePhysics);
  }
  requestAnimationFrame(updatePhysics);

  // =========================================================
  // 3. 마우스 드래그(잡아서 낑낑) & 창 위에 직접 올려놓기 (1순위)
  // =========================================================
  function getWindowWallX(act, win, maxX) {
    // 135px 캔버스에서 손·발 끝(우측 여백 4px)이 창 테두리에 2px 정도 자연스럽게 맞닿도록 배치
    const edgeOverlap = 6;
    const rawX = act.wallSide === 'left'
      ? win.x - act.width + edgeOverlap
      : win.x + win.width - edgeOverlap;
    return Math.max(0, Math.min(maxX, rawX));
  }

  function handleActorDrop(act) {
    act.isDragging = false;
    act.el?.classList.remove('grabbing');
    act.tiltDeg = 0;

    const maxX = window.innerWidth - act.width;
    const footY = act.y + act.height - FOOT_OFFSET;
    const centerX = act.x + act.width * 0.5;
    const cfg = charConfigs[act.charType] || charConfigs.kurimanju;

    // 0순위: 사용자가 미니창(상단 타이틀바) 위에 놓았을 때! (최소화 상태 아닐 때만)
    const hudRect = (miniHud && !isHudMinimized) ? miniHud.getBoundingClientRect() : null;
    if (hudRect && centerX >= hudRect.left - 25 && centerX <= hudRect.right + 25 && Math.abs(footY - hudRect.top) <= 60) {
      attachToWindow(act, null, 'mini-hud');
      act.y = hudRect.top - act.height + FOOT_OFFSET + 2;
      act.x = Math.max(hudRect.left, Math.min(hudRect.right - act.width, act.x));
      setSingleActorState(act, isWanderEnabled ? 'land' : 'idle', 20);
      showActorSpeech(act, resolveQuote(act, 'dropMiniHud', '미니창 위에 착! ✨'), 2200);
      return;
    }

    // 1순위: 사용자가 마우스로 놓은 위치 근처에 일반 창(크롬/카톡/탐색기 등)의 지붕이나 옆벽이 있는지 확인!
    for (const w of trackedWindows) {
      if (!isClimbableWindow(w)) continue;
      // 창 지붕 근처에 놓았을 때 (타이틀바 상하 65px 범위)
      if (w.y >= 30 && centerX >= w.x - 20 && centerX <= w.x + w.width + 20 && Math.abs(footY - w.y) <= 65) {
        attachToWindow(act, w, 'win-roof');
        act.y = w.y - act.height + FOOT_OFFSET;
        act.x = Math.max(w.x + 10, Math.min(w.x + w.width - act.width - 10, act.x));
        setSingleActorState(act, isWanderEnabled ? 'land' : 'idle', 20);
        showActorSpeech(act, resolveQuote(act, 'dropOnWin', (n) => `${n} 지붕에 착! ✨`, getFriendlyAppName(w)), 2400);
        return;
      }
      // 창 왼쪽/오른쪽 벽 근처에 놓았을 때 (손발을 벽에 갖다 댄 경우도 포함해 자연스럽게 인식)
      if (act.y + act.height > w.y && act.y < w.y + w.height) {
        if ((centerX >= w.x - 85 && centerX <= w.x + 32) || Math.abs((act.x + act.width) - w.x) <= 32) {
          attachToWindow(act, w, 'win-wall');
          act.wallSide = 'left';
          act.climbDir = -1;
          act.x = getWindowWallX(act, w, maxX);
          setSingleActorState(act, 'climb', 260);
          showActorSpeech(act, resolveQuote(act, 'grabWinWall', (n) => `${n} 벽 잡았다! 🧗`, getFriendlyAppName(w)), 2200);
          return;
        }
        if ((centerX >= (w.x + w.width) - 32 && centerX <= (w.x + w.width) + 85) || Math.abs(act.x - (w.x + w.width)) <= 32) {
          attachToWindow(act, w, 'win-wall');
          act.wallSide = 'right';
          act.climbDir = -1;
          act.x = getWindowWallX(act, w, maxX);
          setSingleActorState(act, 'climb', 260);
          showActorSpeech(act, resolveQuote(act, 'grabWinWall', (n) => `${n} 벽 잡았다! 🧗`, getFriendlyAppName(w)), 2200);
          return;
        }
      }
    }

    // 모니터 천장이나 양옆 벽에 놓았을 때
    if (act.y <= 24) {
      act.y = 8;
      setSingleActorState(act, 'ceiling', 220);
      showActorSpeech(act, resolveQuote(act, 'dropCeiling', '천장에 착! 🌟'), 1800);
    } else if (act.x <= 16) {
      act.x = 0;
      act.wallSide = 'left';
      act.climbDir = -1;
      setSingleActorState(act, 'climb', 240);
      showActorSpeech(act, resolveQuote(act, 'climb', '벽 잡았다! 영차~'), 1800);
    } else if (act.x >= maxX - 16) {
      act.x = maxX;
      act.wallSide = 'right';
      act.climbDir = -1;
      setSingleActorState(act, 'climb', 240);
      showActorSpeech(act, resolveQuote(act, 'climb', '벽 잡았다! 영차~'), 1800);
    } else {
      act.vx = 0;
      act.vy = 0.5;
      setSingleActorState(act, 'fall');
      showActorSpeech(act, resolveQuote(act, 'fallSoft', '휴~ 살았다!'), 1400);
    }
  }

  function bindActorDragEvents(act) {
    if (!act.el) return;

    act.el.addEventListener('mousedown', (e) => {
      if (e.button === 0) {
        e.preventDefault();
        closeBagMenu(false);
        act.isDragging = true;
        attachToWindow(act, null, 'screen');
        act.el.classList.add('grabbing');
        act.dragOffsetX = Math.round(act.width * 0.5);
        act.dragOffsetY = 18;
        act.x = Math.max(0, Math.min(window.innerWidth - act.width, e.clientX - act.dragOffsetX));
        act.y = Math.max(0, Math.min(window.innerHeight - act.height, e.clientY - act.dragOffsetY));
        act.lastMouseX = e.clientX;
        setSingleActorState(act, 'grabbed', 9999);
        const quotes = getActorQuotes(act);
        const list = Array.isArray(quotes.struggle) ? quotes.struggle : (Array.isArray(quotes.grabbed) ? quotes.grabbed : ['으으.. 낑낑💦', '파닥파닥.. 내려줘~!']);
        const msg = list[Math.floor(Math.random() * list.length)];
        showActorSpeech(act, msg, 0);
        playPopSound();
      } else if (e.button === 2) {
        e.preventDefault();
        e.stopPropagation();
        act.isDragging = false;
        act.el.classList.remove('grabbing');
        act.tiltDeg = 0;
        openBagMenu();
      }
    });

    act.el.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      e.stopPropagation();
      act.isDragging = false;
      act.el.classList.remove('grabbing');
      act.tiltDeg = 0;
      openBagMenu();
    });
  }

  bindActorDragEvents(mainActor);
  bindActorDragEvents(friendActor);

  window.addEventListener('mousemove', (e) => {
    for (const act of [mainActor, friendActor]) {
      if (!act.isDragging) continue;
      const dx = e.clientX - act.lastMouseX;
      act.lastMouseX = e.clientX;
      act.tiltDeg = Math.max(-28, Math.min(28, dx * 1.4));

      const maxX = window.innerWidth - act.width;
      const maxY = window.innerHeight - act.height;
      act.x = Math.max(0, Math.min(maxX, e.clientX - act.dragOffsetX));
      act.y = Math.max(0, Math.min(maxY, e.clientY - act.dragOffsetY));
    }
  });

  window.addEventListener('mouseup', (e) => {
    if (e.button === 0) {
      for (const act of [mainActor, friendActor]) {
        if (act.isDragging) {
          handleActorDrop(act);
        }
      }
    }
  });

  // =========================================================
  // 4. 가방(보따리) 북마크 메뉴 & 사이트 등록/열기 기능
  // =========================================================
  let bookmarks = [];
  let selectedEmoji = '🌰';

  async function loadBookmarks() {
    if (window.electronAPI?.getBookmarks) {
      bookmarks = await window.electronAPI.getBookmarks();
    }
    renderBookmarks();
  }

  function getDisplayBookmarkIcon(bm) {
    const ui = getActorConfig(mainActor).ui || {};
    const defaultEmoji = ui.bagDefaultEmoji || '🌰';
    const rawIcon = bm?.icon || defaultEmoji;
    if (currentMainChar === 'rakko') {
      const rakkoIconMap = {
        '🌰': '🔑',
        '🍺': '🏎️',
        '🍘': '🚗',
        '☕': '🗝️'
      };
      return rakkoIconMap[rawIcon] || rawIcon;
    }
    return rawIcon;
  }

  function renderEmojiSelector() {
    if (!emojiSelector) return;
    const ui = getActorConfig(mainActor).ui || {};
    const emojiList = Array.isArray(ui.bagEmojiList) && ui.bagEmojiList.length > 0
      ? ui.bagEmojiList
      : ['🌰', '🍺', '🍘', '☕', '📺', '💻', '🎵', '🎮'];

    if (!emojiList.includes(selectedEmoji)) {
      selectedEmoji = ui.bagDefaultEmoji || emojiList[0];
    }

    emojiSelector.innerHTML = '';
    emojiList.forEach((em) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = `emoji-opt${em === selectedEmoji ? ' selected' : ''}`;
      btn.dataset.emoji = em;
      btn.textContent = em;
      emojiSelector.appendChild(btn);
    });
  }

  function renderBookmarks() {
    bookmarkListEl.innerHTML = '';
    if (!bookmarks || bookmarks.length === 0) {
      const emptyText = getActorConfig(mainActor).ui?.bagEmptyText
        || '가방이 비어있어요! 아래 버튼으로 자주 가는 사이트를 넣어보세요 🎒';
      bookmarkListEl.innerHTML = `<div style="text-align:center; padding:14px; font-size:12px; color:#557A64;">${escapeHtml(emptyText)}</div>`;
      return;
    }

    bookmarks.forEach((bm) => {
      const item = document.createElement('div');
      item.className = 'bookmark-item';

      const linkBtn = document.createElement('button');
      linkBtn.className = 'bookmark-link-btn';
      linkBtn.innerHTML = `
        <span class="bm-icon">${getDisplayBookmarkIcon(bm)}</span>
        <div class="bm-info">
          <div class="bm-name">${escapeHtml(bm.name)}</div>
          <div class="bm-url">${escapeHtml(bm.url)}</div>
        </div>
      `;
      linkBtn.addEventListener('click', () => {
        window.electronAPI?.openExternalUrl(bm.url);
        showActorSpeech(mainActor, resolveQuote(mainActor, 'bagPick', (n) => `「${n}」 꺼냈다! 다녀와~ ✨`, bm.name), 2800);
        playHaaFanfare();
        closeBagMenu(true);
      });

      const delBtn = document.createElement('button');
      delBtn.className = 'bm-delete-btn';
      delBtn.title = '사이트 삭제';
      delBtn.textContent = '🗑️';
      delBtn.addEventListener('click', async (ev) => {
        ev.stopPropagation();
        bookmarks = bookmarks.filter((b) => b.id !== bm.id);
        await window.electronAPI?.saveBookmarks(bookmarks);
        renderBookmarks();
      });

      item.appendChild(linkBtn);
      item.appendChild(delBtn);
      bookmarkListEl.appendChild(item);
    });
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function openBagMenu() {
    if (!mainActor.spawned) {
      spawnKurimanju(false);
      mainActor.x = Math.floor(window.innerWidth * 0.5 - 65);
      mainActor.y = window.innerHeight - mainActor.height - 6;
    }

    setSingleActorState(mainActor, 'bag', 9999);
    showActorSpeech(mainActor, resolveQuote(mainActor, 'bagOpen', '부스럭.. 어느 간식을 꺼낼까? 🎒'), 0);
    playRummageSound();

    bagMenu.classList.remove('hidden');

    const menuWidth = 300;
    const menuHeight = 340;
    let left = mainActor.x + mainActor.width + 14;
    if (left + menuWidth > window.innerWidth - 16) {
      left = Math.max(16, mainActor.x - menuWidth - 14);
    }
    let top = Math.min(window.innerHeight - menuHeight - 16, Math.max(16, mainActor.y - 80));

    bagMenu.style.left = `${Math.round(left)}px`;
    bagMenu.style.top = `${Math.round(top)}px`;
  }

  function closeBagMenu(playHaaAfter = false) {
    if (bagMenu.classList.contains('hidden')) return;
    bagMenu.classList.add('hidden');
    addBookmarkForm.classList.add('hidden');
    btnShowAddForm.classList.remove('hidden');

    if (playHaaAfter) {
      setSingleActorState(mainActor, 'haa', 110);
    } else if (mainActor.state === 'bag') {
      const groundY = window.innerHeight - mainActor.height - 6;
      if (mainActor.surfaceType === 'win-roof' && getAttachedWindow(mainActor)) {
        pickNextGroundBehavior(mainActor);
      } else if (mainActor.y < groundY - 4) {
        setSingleActorState(mainActor, 'fall');
      } else {
        pickNextGroundBehavior(mainActor);
      }
      actorSpeech.classList.add('hidden');
    }
  }

  btnCloseBag.addEventListener('click', () => closeBagMenu(false));
  btnOpenBagHud.addEventListener('click', () => {
    if (bagMenu.classList.contains('hidden')) {
      openBagMenu();
    } else {
      closeBagMenu(false);
    }
  });

  btnShowAddForm.addEventListener('click', () => {
    btnShowAddForm.classList.add('hidden');
    addBookmarkForm.classList.remove('hidden');
    bmNameInput.focus();
  });

  btnCancelAdd.addEventListener('click', () => {
    addBookmarkForm.classList.add('hidden');
    btnShowAddForm.classList.remove('hidden');
  });

  emojiSelector.addEventListener('click', (e) => {
    const btn = e.target.closest('.emoji-opt');
    if (!btn) return;
    document.querySelectorAll('.emoji-opt').forEach((el) => el.classList.remove('selected'));
    btn.classList.add('selected');
    selectedEmoji = btn.dataset.emoji;
  });

  addBookmarkForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = bmNameInput.value.trim();
    let url = bmUrlInput.value.trim();
    if (!name || !url) return;
    if (!/^https?:\/\//i.test(url)) {
      url = 'https://' + url;
    }

    const newBm = {
      id: 'bm-' + Date.now(),
      name,
      url,
      icon: selectedEmoji
    };
    bookmarks.push(newBm);
    await window.electronAPI?.saveBookmarks(bookmarks);
    renderBookmarks();

    bmNameInput.value = '';
    bmUrlInput.value = '';
    addBookmarkForm.classList.add('hidden');
    btnShowAddForm.classList.remove('hidden');
    showActorSpeech(mainActor, resolveQuote(mainActor, 'bagAdd', (n) => `「${n}」 가방에 쏙 넣었다! 🎒`, name), 2500);
    playPopSound();
  });

  // =========================================================
  // 5. 타이머 기능
  // =========================================================
  let timerInterval = null;
  let remainingSeconds = 25 * 60;
  let isTimerRunning = false;
  let isTimerPaused = false;

  function formatTime(totalSec) {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }

  function updateTimerDisplays() {
    const formatted = formatTime(remainingSeconds);
    hudTimeDisplay.textContent = formatted;
    if (collapsedTime) collapsedTime.textContent = formatted;
    actorTimerPill.textContent = isTimerPaused ? `⏸ ${formatted}` : `⏱️ ${formatted}`;
  }

  presetBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      presetBtns.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      inputMinutes.value = btn.dataset.min;
      inputSeconds.value = btn.dataset.sec;
      if (!isTimerRunning) {
        remainingSeconds = parseInt(btn.dataset.min, 10) * 60 + parseInt(btn.dataset.sec, 10);
        updateTimerDisplays();
      }
    });
  });

  function startTimer(customSeconds = null) {
    if (customSeconds !== null) {
      remainingSeconds = customSeconds;
    } else if (!isTimerRunning) {
      const m = Math.max(0, parseInt(inputMinutes.value, 10) || 0);
      const s = Math.max(0, parseInt(inputSeconds.value, 10) || 0);
      remainingSeconds = m * 60 + s;
      if (remainingSeconds <= 0) remainingSeconds = 60;
    }

    isTimerRunning = true;
    isTimerPaused = false;
    timerDoneToast.classList.add('hidden');

    if (!mainActor.spawned) {
      spawnKurimanju(true);
    } else if (mainActor.state === 'sleep' || mainActor.state === 'dream') {
      pickNextGroundBehavior(mainActor);
      showActorSpeech(mainActor, resolveQuote(mainActor, 'timerStart', '자, 다시 시작해볼까! ✨'), 2200);
    }

    if (isFriendActive && friendActor.spawned && (friendActor.state === 'sleep' || friendActor.state === 'dream')) {
      pickNextGroundBehavior(friendActor);
    }

    setupPanel.classList.add('hidden');
    btnStartTimer.classList.add('hidden');
    btnPauseTimer.classList.remove('hidden');
    btnPauseTimer.textContent = '⏸ 일시정지';
    btnResetTimer.classList.remove('hidden');

    updateTimerDisplays();

    if (timerInterval) clearInterval(timerInterval);
    timerInterval = setInterval(() => {
      if (isTimerPaused) return;
      if (remainingSeconds > 0) {
        remainingSeconds--;
        updateTimerDisplays();
      } else {
        onTimerCompleted();
      }
    }, 1000);
  }

  function pauseOrResumeTimer() {
    if (!isTimerRunning) return;
    isTimerPaused = !isTimerPaused;
    if (isTimerPaused) {
      btnPauseTimer.textContent = '▶ 계속하기';
      setSingleActorState(mainActor, 'dream', 9999);
      showActorSpeech(mainActor, resolveQuote(mainActor, 'timerPause', '잠시 달콤한 낮잠 시간.. 😴💤'), 0);
      if (isFriendActive && friendActor.spawned) {
        setSingleActorState(friendActor, 'dream', 9999);
        showActorSpeech(friendActor, resolveQuote(friendActor, 'friendPause', '잠시 휴식 중.. 💤'), 0);
      }
    } else {
      btnPauseTimer.textContent = '⏸ 일시정지';
      pickNextGroundBehavior(mainActor);
      showActorSpeech(mainActor, resolveQuote(mainActor, 'timerResume', '다시 집중해서 일해보자구! ✨'), 2000);
      if (isFriendActive && friendActor.spawned) {
        pickNextGroundBehavior(friendActor);
      }
    }
    updateTimerDisplays();
  }

  function resetTimer() {
    if (timerInterval) clearInterval(timerInterval);
    timerInterval = null;
    isTimerRunning = false;
    isTimerPaused = false;

    const m = Math.max(0, parseInt(inputMinutes.value, 10) || 0);
    const s = Math.max(0, parseInt(inputSeconds.value, 10) || 0);
    remainingSeconds = m * 60 + s;
    updateTimerDisplays();

    btnStartTimer.classList.remove('hidden');
    btnPauseTimer.classList.add('hidden');
    btnResetTimer.classList.add('hidden');

    if (mainActor.spawned) {
      pickNextGroundBehavior(mainActor);
    }
    if (isFriendActive && friendActor.spawned) {
      pickNextGroundBehavior(friendActor);
    }
  }

  async function positionDoneToast() {
    try {
      const displays = (await window.electronAPI?.getDisplays?.()) || [];
      if (!displays || displays.length === 0) {
        timerDoneToast.style.left = '50%';
        timerDoneToast.style.top = 'auto';
        timerDoneToast.style.bottom = '28px';
        timerDoneToast.style.transform = 'translateX(-50%)';
        return;
      }

      const actorCenterX = mainActor.x + mainActor.width * 0.5;
      const actorCenterY = mainActor.y + mainActor.height * 0.5;

      let targetDisplay = displays.find((d) =>
        actorCenterX >= d.x && actorCenterX <= d.x + d.width &&
        actorCenterY >= d.y && actorCenterY <= d.y + d.height
      );

      if (!targetDisplay) {
        targetDisplay = displays.find((d) => actorCenterX >= d.x && actorCenterX <= d.x + d.width) || displays[0];
      }

      const displayCenterX = targetDisplay.x + Math.round(targetDisplay.width * 0.5);
      const displayBottomY = targetDisplay.y + targetDisplay.height - 32;

      timerDoneToast.style.left = `${displayCenterX}px`;
      timerDoneToast.style.top = `${displayBottomY}px`;
      timerDoneToast.style.bottom = 'auto';
      timerDoneToast.style.transform = 'translate(-50%, -100%)';
    } catch (_) {
      timerDoneToast.style.left = '50%';
      timerDoneToast.style.top = 'auto';
      timerDoneToast.style.bottom = '28px';
      timerDoneToast.style.transform = 'translateX(-50%)';
    }
  }

  async function onTimerCompleted() {
    if (timerInterval) clearInterval(timerInterval);
    timerInterval = null;
    isTimerRunning = false;
    isTimerPaused = false;

    btnStartTimer.classList.remove('hidden');
    btnPauseTimer.classList.add('hidden');
    btnResetTimer.classList.add('hidden');

    setSingleActorState(mainActor, 'haa', 420);
    const cfg = charConfigs[mainActor.charType] || charConfigs.kurimanju;
    showActorSpeech(mainActor, cfg.quotes?.timerDone || '하아ー(ハーッ)!! 수고했어!! 🍺✨', 8000);
    playHaaFanfare();

    if (isFriendActive && friendActor.spawned) {
      setSingleActorState(friendActor, 'haa', 420);
      const fCfg = charConfigs[friendActor.charType] || charConfigs.rakko;
      showActorSpeech(friendActor, fCfg.quotes?.timerDone || '훌륭한 성취다! ⚔️✨', 8000);
    }

    await positionDoneToast();
    timerDoneToast.classList.remove('hidden');
  }

  btnStartTimer.addEventListener('click', () => startTimer());
  btnPauseTimer.addEventListener('click', () => pauseOrResumeTimer());
  btnResetTimer.addEventListener('click', () => resetTimer());

  btnToggleSetup.addEventListener('click', () => {
    setupPanel.classList.toggle('hidden');
  });

  btnMinimizePanel.addEventListener('click', () => {
    setupPanel.classList.add('hidden');
  });

  btnQuit.addEventListener('click', () => {
    window.electronAPI?.quitApp();
  });

  btnToastBreak.addEventListener('click', () => {
    inputMinutes.value = 5;
    inputSeconds.value = 0;
    startTimer(5 * 60);
    showActorSpeech(mainActor, resolveQuote(mainActor, 'timerBreak', '5분 동안 꿀맛 휴식하자~ 🍘'), 3000);
  });

  btnToastBag.addEventListener('click', () => {
    timerDoneToast.classList.add('hidden');
    openBagMenu();
  });

  btnToastDismiss.addEventListener('click', () => {
    timerDoneToast.classList.add('hidden');
  });

  // =========================================================
  // 6. 테스트용 제스처 즉시 실행 & 자세 지정 버튼들
  // =========================================================
  gestureBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      if (!mainActor.spawned) spawnKurimanju(false);
      closeBagMenu(false);

      const action = btn.dataset.action;
      const groundY = window.innerHeight - mainActor.height - 6;
      const maxX = window.innerWidth - mainActor.width;

      const quotes = getActorQuotes(mainActor);
      const calmPoseQuotes = quotes.calmPose || {};
      const gestureQuotes = quotes.gesture || {};
      const getGestureQuote = (key, fallback, ...args) => {
        const val = gestureQuotes[key];
        if (typeof val === 'function') return val(...args);
        if (typeof val === 'string') return val;
        return typeof fallback === 'function' ? fallback(...args) : fallback;
      };

      if (!isWanderEnabled && action !== 'drop') {
        const poseStateMap = {
          dream: 'dream',
          sleep: 'sleep',
          land: 'land',
          idle: 'idle',
          snack: 'snack',
          haa: 'haa',
          bag: 'bag',
          walk: 'idle',
          'climb-up': 'climb',
          'climb-down': 'climb',
          ceiling: 'ceiling'
        };
        const defaultPoseSpeechMap = {
          dream: '쿨쿨.. 달콤한 낮잠 중 💤',
          sleep: '으윽.. 휴식이다 💤',
          land: '납작하게 엎드려 있는 중~ 🙇',
          idle: '얌전히 멍때리는 중 👀',
          snack: '오물오물.. 간식 먹는 중 🍘',
          haa: '하아ー(ハーッ)!! ✨',
          bag: '가방 뒤적뒤적.. 🎒',
          walk: '얌전 모드라 제자리 대기 중! 🐾',
          'climb-up': '벽에 찰싹 붙어있기! 🧗',
          'climb-down': '벽에 찰싹 붙어있기! 🧗',
          ceiling: '천장에 대롱대롱 매달리기! 🦇'
        };

        const targetState = poseStateMap[action] || action;
        const targetSpeech = calmPoseQuotes[action] || defaultPoseSpeechMap[action] || calmPoseQuotes.default || '이 자세로 가만히 있을게! ✨';
        lockedPose = targetState;
        setSingleActorState(mainActor, targetState, 9999);
        showActorSpeech(mainActor, targetSpeech, 2400);
        if (isFriendActive && friendActor.spawned) {
          setSingleActorState(friendActor, targetState, 9999);
        }
        return;
      }

      // [자유 산책 모드일 때 즉시 제스처 실행]
      if (action === 'walk') {
        if (priorityWindow && priorityWindow.y >= 45) {
          attachToWindow(mainActor, priorityWindow, 'win-roof');
          mainActor.x = Math.max(0, Math.min(maxX, priorityWindow.x + Math.floor(priorityWindow.width * 0.4)));
          mainActor.y = priorityWindow.y - mainActor.height + FOOT_OFFSET;
          mainActor.dir = 1;
          setSingleActorState(mainActor, 'walk', 260);
          showActorSpeech(mainActor, getGestureQuote('walkWin', (n) => `${n} 지붕 산책 중! 🐾`, getFriendlyAppName(priorityWindow)), 2200);
        } else {
          attachToWindow(mainActor, null, 'screen');
          mainActor.y = groundY;
          mainActor.dir = Math.random() < 0.5 ? -1 : 1;
          setSingleActorState(mainActor, 'walk', 260);
          showActorSpeech(mainActor, getGestureQuote('walkFloor', '바닥 총총 산책 중 🐾'), 2000);
        }
      } else if (action === 'dream') {
        setSingleActorState(mainActor, 'dream', 260);
        showActorSpeech(mainActor, getGestureQuote('dream', '쿨쿨.. 달콤한 낮잠 타임 💤'), 2400);
        if (isFriendActive && friendActor.spawned) setSingleActorState(friendActor, 'dream', 260);
      } else if (action === 'sleep') {
        setSingleActorState(mainActor, 'sleep', 260);
        showActorSpeech(mainActor, getGestureQuote('sleep', '으윽.. 휴식이다 💤'), 2400);
        if (isFriendActive && friendActor.spawned) setSingleActorState(friendActor, 'sleep', 260);
      } else if (action === 'land') {
        setSingleActorState(mainActor, 'land', 240);
        showActorSpeech(mainActor, getGestureQuote('land', '납작하게 엎드리기~ 🙇'), 2200);
        if (isFriendActive && friendActor.spawned) setSingleActorState(friendActor, 'land', 240);
      } else if (action === 'idle') {
        setSingleActorState(mainActor, 'idle', 220);
        showActorSpeech(mainActor, getGestureQuote('idle', '물끄러미 바라보기.. 👀'), 2000);
        if (isFriendActive && friendActor.spawned) setSingleActorState(friendActor, 'idle', 220);
      } else if (action === 'climb-up') {
        if (priorityWindow && isClimbableWindow(priorityWindow)) {
          attachToWindow(mainActor, priorityWindow, 'win-wall');
          mainActor.wallSide = priorityWindow.x >= mainActor.width - 10 ? 'left' : 'right';
          mainActor.x = getWindowWallX(mainActor, priorityWindow, maxX);
          mainActor.y = Math.min(groundY, priorityWindow.y + priorityWindow.height - mainActor.height);
          mainActor.climbDir = -1;
          setSingleActorState(mainActor, 'climb', 320);
          showActorSpeech(mainActor, getGestureQuote('climbWin', (n) => `${n} 벽 타고 올라간다~ 🧗`, getFriendlyAppName(priorityWindow)), 2400);
        } else {
          attachToWindow(mainActor, null, 'screen');
          mainActor.wallSide = mainActor.x < window.innerWidth / 2 ? 'left' : 'right';
          mainActor.x = mainActor.wallSide === 'left' ? 0 : maxX;
          mainActor.y = groundY - 10;
          mainActor.climbDir = -1;
          setSingleActorState(mainActor, 'climb', 320);
          showActorSpeech(mainActor, getGestureQuote('climbWall', '모니터 벽 타고 올라간다~ 🧗'), 2400);
        }
      } else if (action === 'climb-down') {
        attachToWindow(mainActor, null, 'screen');
        mainActor.wallSide = mainActor.x < window.innerWidth / 2 ? 'left' : 'right';
        mainActor.x = mainActor.wallSide === 'left' ? 0 : maxX;
        mainActor.y = 20;
        mainActor.climbDir = 1;
        setSingleActorState(mainActor, 'climb', 320);
        showActorSpeech(mainActor, getGestureQuote('climbDown', '조심조심 위에서 내려가는 중~ 🧗‍♂️'), 2400);
      } else if (action === 'ceiling') {
        attachToWindow(mainActor, null, 'screen');
        mainActor.y = 8;
        mainActor.dir = 1;
        setSingleActorState(mainActor, 'ceiling', 300);
        showActorSpeech(mainActor, getGestureQuote('ceiling', '천장에 매달려서 이동 중! ✨'), 2400);
      } else if (action === 'drop') {
        attachToWindow(mainActor, null, 'screen');
        if (isWanderEnabled && priorityWindow && priorityWindow.y >= 55) {
          mainActor.x = Math.max(20, Math.min(maxX - 20, priorityWindow.x + Math.floor(priorityWindow.width * 0.45)));
        } else {
          mainActor.x = Math.max(80, Math.min(maxX - 80, Math.floor(window.innerWidth * 0.5 - mainActor.width * 0.5)));
          if (!isWanderEnabled) {
            mainActor.winRoofJumpCooldown = 9999;
          }
        }
        mainActor.y = 10;
        mainActor.vx = 0;
        mainActor.vy = 0.6;
        setSingleActorState(mainActor, 'fall');
        showActorSpeech(mainActor, getGestureQuote('drop', '제일 높은 곳에서 아래로 슈웅~! 🪂'), 2000);
      } else if (action === 'snack') {
        setSingleActorState(mainActor, 'snack', 240);
        const cfg = charConfigs[mainActor.charType] || charConfigs.kurimanju;
        const snackList = Array.isArray(cfg.quotes?.snack) ? cfg.quotes.snack : ['오물오물.. 🍘'];
        showActorSpeech(mainActor, snackList[Math.floor(Math.random() * snackList.length)], 2600);
        if (isFriendActive && friendActor.spawned) {
          setSingleActorState(friendActor, 'snack', 240);
        }
      } else if (action === 'haa') {
        setSingleActorState(mainActor, 'haa', 200);
        const cfg = charConfigs[mainActor.charType] || charConfigs.kurimanju;
        showActorSpeech(mainActor, cfg.quotes?.haa || '하아ー(ハーッ)!! ✨', 2800);
        playHaaFanfare();
        if (isFriendActive && friendActor.spawned) {
          setSingleActorState(friendActor, 'haa', 200);
        }
      } else if (action === 'bag') {
        openBagMenu();
      }
    });
  });

  // =========================================================
  // 7. 테마 전환 & 친구 초대 시스템
  // =========================================================
  function updateThemeAndFriendUI() {
    const isRakko = currentMainChar === 'rakko';
    const iconSrc = isRakko ? 'assets/rakko.png' : 'assets/icon.png';
    const ui = getActorConfig(mainActor).ui || {};

    document.body.classList.toggle('theme-rakko', isRakko);
    document.title = ui.docTitle || (isRakko ? '랏코 스승님 시메지 타이머' : '쿠리만쥬 시메지 타이머');

    btnThemeKurimanju?.classList.toggle('active', !isRakko);
    btnThemeRakko?.classList.toggle('active', isRakko);

    if (hudBadgeEl) {
      hudBadgeEl.innerHTML = `<img src="${iconSrc}" class="badge-icon" alt="" /> ${isRakko ? '랏코 스승님' : '쿠리만쥬'}`;
    }
    if (collapsedIconImg) {
      collapsedIconImg.setAttribute('src', iconSrc);
    }
    if (headerIconImg) {
      headerIconImg.setAttribute('src', iconSrc);
    }
    if (panelTitleH1) {
      panelTitleH1.textContent = ui.panelTitle || (isRakko ? '랏코 스승님의 모험 타이머' : '쿠리만쥬 뽀모도로 타이머');
    }
    if (panelSubtitleP) {
      panelSubtitleP.textContent = ui.panelSubtitle || (isRakko
        ? '스승님과 함께하는 고요하고 늠름한 집중 시간 ⚔️'
        : '퇴근 후 시원한 한 잔을 기다리며 일하는 미니 시메지 타이머 🍺');
    }
    if (btnStartTimer && !isTimerRunning) {
      btnStartTimer.textContent = ui.startBtn || (isRakko
        ? '▶ 타이머 시작 & 랏코 스승님 소환'
        : '▶ 타이머 시작 & 쿠리만쥬 소환');
    }

    const bagKnotEl = bagMenu?.querySelector('.bag-knot-icon');
    const bagTitleH3 = bagMenu?.querySelector('.bag-title h3');
    const bagTitleP = bagMenu?.querySelector('.bag-title p');
    const bagSaveBtn = bagMenu?.querySelector('.btn-save');
    const bagEffectTagEl = bagEffectRing?.querySelector('.effect-tag');
    if (bagKnotEl && ui.bagKnotIcon) bagKnotEl.textContent = ui.bagKnotIcon;
    if (bagTitleH3 && ui.bagTitle) bagTitleH3.textContent = ui.bagTitle;
    if (bagTitleP && ui.bagDesc) bagTitleP.textContent = ui.bagDesc;
    if (btnCloseBag && ui.bagCloseTitle) btnCloseBag.title = ui.bagCloseTitle;
    if (btnShowAddForm && ui.bagAddBtn) btnShowAddForm.textContent = ui.bagAddBtn;
    if (bagSaveBtn && ui.bagSaveBtn) bagSaveBtn.textContent = ui.bagSaveBtn;
    if (bagEffectTagEl && ui.bagEffectTag) bagEffectTagEl.textContent = ui.bagEffectTag;

    const toastTitleEl = timerDoneToast?.querySelector('.toast-title');
    const toastDescEl = timerDoneToast?.querySelector('.toast-desc');
    if (toastTitleEl && ui.toastTitle) toastTitleEl.textContent = ui.toastTitle;
    if (toastDescEl && ui.toastDesc) toastDescEl.textContent = ui.toastDesc;
    if (btnToastBreak && ui.toastBreakBtn) btnToastBreak.textContent = ui.toastBreakBtn;
    if (btnToastBag && ui.toastBagBtn) btnToastBag.textContent = ui.toastBagBtn;

    const btnSleep = setupPanel?.querySelector('.gesture-btn[data-action="sleep"]');
    const btnSnack = setupPanel?.querySelector('.gesture-btn[data-action="snack"]');
    const btnHaa = setupPanel?.querySelector('.gesture-btn[data-action="haa"]');
    const btnBag = setupPanel?.querySelector('.gesture-btn[data-action="bag"]');
    if (btnSleep && ui.gestureSleep) btnSleep.textContent = ui.gestureSleep;
    if (btnSnack && ui.gestureSnack) btnSnack.textContent = ui.gestureSnack;
    if (btnHaa && ui.gestureHaa) btnHaa.textContent = ui.gestureHaa;
    if (btnBag && ui.bagGestureBtn) btnBag.textContent = ui.bagGestureBtn;

    const guideTipEl = setupPanel?.querySelector('.guide-tip');
    if (guideTipEl && ui.guideTipHtml) guideTipEl.innerHTML = ui.guideTipHtml;

    if (miniHudCollapsed) {
      miniHudCollapsed.title = `클릭하면 ${isRakko ? '랏코 스승님' : '쿠리만쥬'} 타이머 바가 다시 열려요`;
    }
    if (btnOpenBagHud) {
      if (ui.bagHudBtn) btnOpenBagHud.textContent = ui.bagHudBtn;
      btnOpenBagHud.title = ui.bagHudTitle || `${isRakko ? '랏코 스승님' : '쿠리만쥬'} 가방(북마크) 열기`;
    }

    selectedEmoji = ui.bagDefaultEmoji || (isRakko ? '🔑' : '🌰');
    renderEmojiSelector();
    renderBookmarks();

    const friendChar = isRakko ? 'kurimanju' : 'rakko';
    const friendName = friendChar === 'rakko' ? '랏코 스승님' : '쿠리만쥬';
    const friendIcon = friendChar === 'rakko' ? '🦦' : '🌰';

    if (btnToggleFriend) {
      btnToggleFriend.classList.toggle('active', isFriendActive);
      btnToggleFriend.title = isFriendActive ? `친구 ${friendName} 돌려보내기` : `친구 ${friendName} 놀러오기!`;
      btnToggleFriend.textContent = isFriendActive ? `👥 ${friendIcon} 함께 산책 중` : `👥 ${friendIcon} 친구 놀러오기`;
    }
    if (btnPanelToggleFriend) {
      btnPanelToggleFriend.classList.toggle('active', isFriendActive);
      btnPanelToggleFriend.textContent = isFriendActive ? `👋 ${friendIcon} ${friendName} 돌려보내기` : `✨ ${friendIcon} ${friendName} 초대하기`;
    }
    if (friendStatusDesc) {
      friendStatusDesc.textContent = isFriendActive
        ? `현재 ${friendName}가 함께 화면을 산책하고 있어요!`
        : `버튼을 누르면 ${friendName}가 놀러와 둘이서 함께 산책해요!`;
    }
  }

  function applyCharacterTheme(charType, save = true, syncNative = true) {
    if (!charConfigs[charType]) return;
    currentMainChar = charType;
    mainActor.charType = charType;

    // 친구가 활성화되어 있으면 반대 캐릭터로 자동 지정
    if (isFriendActive) {
      friendActor.charType = currentMainChar === 'kurimanju' ? 'rakko' : 'kurimanju';
      updateActorSpriteFrame(friendActor);
    }

    updateActorSpriteFrame(mainActor);
    updateThemeAndFriendUI();

    if (syncNative) {
      window.electronAPI?.setAppTheme?.(charType);
    }

    const cfg = charConfigs[charType];
    if (save) {
      showActorSpeech(mainActor, cfg.quotes?.themeSelect || `${cfg.name} 모드로 전환! ✨`, 2600);
      try {
        localStorage.setItem('kurimanju_main_char', charType);
      } catch (_) {}
    }
  }

  function toggleFriendActor(forceActive = null) {
    isFriendActive = forceActive !== null ? forceActive : !isFriendActive;
    friendActor.charType = currentMainChar === 'kurimanju' ? 'rakko' : 'kurimanju';

    if (isFriendActive) {
      friendActorEl?.classList.remove('hidden');
      spawnActor(friendActor, true);
      const friendCfg = charConfigs[friendActor.charType];
      showActorSpeech(friendActor, friendCfg.quotes?.spawn || '나도 왔다! 🐾', 2800);
      showActorSpeech(mainActor, resolveQuote(mainActor, 'friendSpawn', '친구가 놀러왔다! 🥳'), 2200);
      playHaaFanfare();
    } else {
      friendActor.spawned = false;
      friendActorEl?.classList.add('hidden');
      friendSpeech?.classList.add('hidden');
      showActorSpeech(mainActor, resolveQuote(mainActor, 'dismissFriend', '친구야, 다음에 또 놀러와~ 👋'), 2400);
    }

    updateThemeAndFriendUI();

    try {
      localStorage.setItem('kurimanju_friend_active', JSON.stringify(isFriendActive));
    } catch (_) {}
  }

  async function handleCreateShortcuts(mode) {
    if (!window.electronAPI?.createShortcuts) return;
    if (btnShortcutDesktop) btnShortcutDesktop.disabled = true;
    if (btnShortcutAll) btnShortcutAll.disabled = true;

    try {
      const res = await window.electronAPI.createShortcuts({
        mode,
        theme: currentMainChar
      });
      if (res && res.ok) {
        playHaaFanfare();
        if (mode === 'desktop-single') {
          const charName = currentMainChar === 'rakko' ? '랏코 스승님' : '쿠리만쥬';
          showActorSpeech(mainActor, resolveQuote(mainActor, 'shortcutDesktop', (n) => `바탕화면에 「${n}」 바로가기 생성 완료! 🖥️✨`, charName), 3400);
        } else {
          showActorSpeech(mainActor, resolveQuote(mainActor, 'shortcutAll', '실행 폴더에 쿠리만쥬·랏코 바로가기 모두 생성 완료! 📂✨'), 3600);
        }
      } else {
        showActorSpeech(mainActor, resolveQuote(mainActor, 'shortcutErrDetail', (err) => `바로가기 생성 실패 💦 (${err || '오류'})`, res?.error), 3200);
      }
    } catch (_) {
      showActorSpeech(mainActor, resolveQuote(mainActor, 'shortcutErr', '바로가기 생성 중 오류가 발생했어요 💦'), 3200);
    } finally {
      if (btnShortcutDesktop) btnShortcutDesktop.disabled = false;
      if (btnShortcutAll) btnShortcutAll.disabled = false;
    }
  }

  btnThemeKurimanju?.addEventListener('click', () => applyCharacterTheme('kurimanju'));
  btnThemeRakko?.addEventListener('click', () => applyCharacterTheme('rakko'));
  btnToggleFriend?.addEventListener('click', () => toggleFriendActor());
  btnPanelToggleFriend?.addEventListener('click', () => toggleFriendActor());
  btnShortcutDesktop?.addEventListener('click', () => handleCreateShortcuts('desktop-single'));
  btnShortcutAll?.addEventListener('click', () => handleCreateShortcuts('appdir-all'));

  btnToggleWander?.addEventListener('click', () => {
    setWanderMode(!isWanderEnabled);
  });
  btnPanelToggleWander?.addEventListener('click', () => {
    setWanderMode(!isWanderEnabled);
  });

  window.electronAPI?.onCommand((cmd) => {
    if (cmd === 'toggle-timer-panel') {
      setupPanel.classList.toggle('hidden');
    } else if (cmd === 'toggle-wander-mode') {
      setWanderMode(!isWanderEnabled);
    } else if (cmd === 'respawn-kurimanju') {
      spawnKurimanju(true);
    } else if (cmd === 'trigger-haa') {
      if (!mainActor.spawned) spawnKurimanju(false);
      setSingleActorState(mainActor, 'haa', 220);
      const cfg = charConfigs[mainActor.charType] || charConfigs.kurimanju;
      showActorSpeech(mainActor, cfg.quotes?.haa || '하아ー(ハーッ)!! 🍺', 2800);
      playHaaFanfare();
      if (isFriendActive && friendActor.spawned) {
        setSingleActorState(friendActor, 'haa', 220);
      }
    } else if (cmd === 'open-bag') {
      openBagMenu();
    } else if (cmd === 'toggle-mini-hud') {
      toggleMinimizeHud();
    } else if (cmd === 'toggle-speech') {
      setSpeechEnabled(!isSpeechEnabled);
    } else if (cmd === 'toggle-friend') {
      toggleFriendActor();
    } else if (cmd === 'toggle-theme') {
      applyCharacterTheme(currentMainChar === 'kurimanju' ? 'rakko' : 'kurimanju');
    } else if (cmd === 'create-shortcut-desktop') {
      handleCreateShortcuts('desktop-single');
    } else if (cmd === 'create-shortcuts-all') {
      handleCreateShortcuts('appdir-all');
    } else if (cmd === 'check-updates') {
      triggerManualUpdateCheck();
    }
  });

  // =========================================================
  // 8. 자동 업데이트 UI 및 알림 연동
  // =========================================================
  let currentAppVersion = '1.0.0';

  function renderUpdateState(data) {
    if (!data) return;
    const verPrefix = `v${currentAppVersion}`;

    if (data.status === 'checking') {
      if (appVersionText) appVersionText.textContent = `${verPrefix} · 새 버전 확인 중...`;
      if (btnCheckUpdate) btnCheckUpdate.disabled = true;
    } else if (data.status === 'available') {
      if (appVersionText) appVersionText.textContent = `${verPrefix} · v${data.version} 발견! 다운로드 시작`;
      showActorSpeech(mainActor, resolveQuote(mainActor, 'updateAvailable', (v) => `새 버전(v${v})을 발견해서 받고 있어! 📥`, data.version), 3000);
    } else if (data.status === 'downloading') {
      if (appVersionText) appVersionText.textContent = `${verPrefix} · 다운로드 중 (${data.percent || 0}%)`;
    } else if (data.status === 'downloaded') {
      if (appVersionText) appVersionText.textContent = `v${data.version} 다운로드 완료!`;
      if (btnCheckUpdate) {
        btnCheckUpdate.disabled = false;
        btnCheckUpdate.classList.add('hidden');
      }
      btnInstallUpdate?.classList.remove('hidden');

      if (updateToastTitle) {
        updateToastTitle.textContent = `✨ 새 버전(v${data.version}) 준비 완료!`;
      }
      if (updateToastDesc) {
        updateToastDesc.textContent = '지금 재시작하면 자동으로 최신 버전이 적용됩니다.';
      }
      updateReadyToast?.classList.remove('hidden');
      showActorSpeech(mainActor, resolveQuote(mainActor, 'updateDownloaded', (v) => `업데이트(v${v}) 준비 끝! 재시작할까? 🚀`, data.version), 4000);
      playHaaFanfare();
    } else if (data.status === 'latest') {
      if (appVersionText) appVersionText.textContent = `${verPrefix} · 최신 버전입니다`;
      if (btnCheckUpdate) btnCheckUpdate.disabled = false;
    } else if (data.status === 'error') {
      if (appVersionText) appVersionText.textContent = `${verPrefix} · 확인 실패`;
      if (btnCheckUpdate) btnCheckUpdate.disabled = false;
    }
  }

  async function triggerManualUpdateCheck() {
    if (!window.electronAPI?.checkForUpdates) return;
    if (btnCheckUpdate) btnCheckUpdate.disabled = true;
    if (appVersionText) appVersionText.textContent = `v${currentAppVersion} · 확인 중...`;

    try {
      const res = await window.electronAPI.checkForUpdates();
      if (res?.devMode) {
        if (appVersionText) appVersionText.textContent = `v${currentAppVersion} · 개발 모드`;
        showActorSpeech(mainActor, resolveQuote(mainActor, 'updateDevMode', '설치(.exe) 후에는 자동으로 최신 버전을 받아와요! ✨'), 3200);
      } else if (res && !res.ok) {
        if (appVersionText) appVersionText.textContent = `v${currentAppVersion} · 확인 실패`;
        showActorSpeech(mainActor, resolveQuote(mainActor, 'updateNotFound', '업데이트 서버를 아직 찾지 못했어요 (GitHub Release 확인) 💦'), 3200);
      } else if (res && res.ok && res.version === currentAppVersion) {
        if (appVersionText) appVersionText.textContent = `v${currentAppVersion} · 최신 버전입니다`;
        showActorSpeech(mainActor, resolveQuote(mainActor, 'updateLatest', (v) => `현재 최신 버전(v${v})을 사용 중이야! 🌟`, currentAppVersion), 2600);
      }
    } catch (_) {
      if (appVersionText) appVersionText.textContent = `v${currentAppVersion} · 확인 실패`;
    } finally {
      if (btnCheckUpdate) btnCheckUpdate.disabled = false;
    }
  }

  btnCheckUpdate?.addEventListener('click', () => triggerManualUpdateCheck());
  btnInstallUpdate?.addEventListener('click', () => window.electronAPI?.installUpdateNow());
  btnUpdateRestart?.addEventListener('click', () => window.electronAPI?.installUpdateNow());
  btnUpdateLater?.addEventListener('click', () => {
    updateReadyToast?.classList.add('hidden');
    showActorSpeech(mainActor, resolveQuote(mainActor, 'updateLater', '알겠어! 프로그램 종료 시 자동으로 적용될 거야~ 🌰'), 2800);
  });

  window.electronAPI?.onUpdateStatus?.((data) => renderUpdateState(data));

  (async function initAppVersion() {
    try {
      const ver = await window.electronAPI?.getAppVersion?.();
      if (ver) {
        currentAppVersion = ver;
        if (appVersionText) appVersionText.textContent = `v${ver}`;
      }
    } catch (_) {}
  })();

  // 초기 시작 세팅 (동기 선적용 후 CLI 인자/메인 프로세스 동기화)
  applyCharacterTheme(currentMainChar, false, false);
  if (isFriendActive) {
    friendActor.charType = currentMainChar === 'kurimanju' ? 'rakko' : 'kurimanju';
    spawnActor(friendActor, false);
    friendActorEl?.classList.remove('hidden');
  }
  updateThemeAndFriendUI();

  (async function syncInitialTheme() {
    try {
      const info = await window.electronAPI?.getInitialTheme?.();
      if (info && info.fromCli && charConfigs[info.theme]) {
        currentMainChar = info.theme;
        try {
          localStorage.setItem('kurimanju_main_char', info.theme);
        } catch (_) {}
      }
    } catch (_) {}
    applyCharacterTheme(currentMainChar, false, true);
  })();
  initSpritesAndAutoAlign();
  loadBookmarks();
  updateTimerDisplays();
  updateWanderModeUI();
  setSpeechEnabled(isSpeechEnabled, false);
  toggleMinimizeHud(isHudMinimized);
})();
