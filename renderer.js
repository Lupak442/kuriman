(() => {
  const spriteConfig = window.KURIMANJU_SPRITES;

  // DOM Elements
  const miniHud = document.getElementById('mini-hud');
  const btnToggleWander = document.getElementById('btn-toggle-wander');
  const hudTimeDisplay = document.getElementById('hud-time-display');
  const btnToggleSetup = document.getElementById('btn-toggle-setup');
  const btnOpenBagHud = document.getElementById('btn-open-bag-hud');
  const btnQuit = document.getElementById('btn-quit');

  const setupPanel = document.getElementById('timer-setup-panel');
  const panelHeader = setupPanel?.querySelector('.panel-header');
  const btnMinimizePanel = document.getElementById('btn-Minimize-panel');
  const btnPanelToggleWander = document.getElementById('btn-panel-toggle-wander');
  const modeDesc = document.getElementById('mode-desc');
  const presetBtns = document.querySelectorAll('.preset-btn');
  const inputMinutes = document.getElementById('input-minutes');
  const inputSeconds = document.getElementById('input-seconds');
  const btnStartTimer = document.getElementById('btn-start-timer');
  const btnPauseTimer = document.getElementById('btn-pause-timer');
  const btnResetTimer = document.getElementById('btn-reset-timer');
  const gestureBtns = document.querySelectorAll('.gesture-btn');

  const actorEl = document.getElementById('kurimanju-actor');
  const spriteWrapper = document.getElementById('sprite-wrapper');
  const actorImg = document.getElementById('kurimanju-img');
  const actorTimerPill = document.getElementById('actor-timer-pill');
  const actorSpeech = document.getElementById('actor-speech');
  const bagEffectRing = document.getElementById('bag-effect-ring');

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
    if (actor.isDragging || isAnyUiDragging) {
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

  // 미니 HUD와 설정창 패널을 드래그 가능하게 활성화
  makeDraggable(miniHud, miniHud, 'kurimanju_mini_hud_pos');
  makeDraggable(setupPanel, panelHeader, 'kurimanju_setup_panel_pos');

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

  window.electronAPI?.onWindowsUpdate((windows) => {
    trackedWindows = windows || [];
    const prevAttached = actor.attachedHwnd
      ? trackedWindows.find((w) => w.hwnd === actor.attachedHwnd)
      : null;

    // 만약 쿠리만쥬가 올라타 있던 창이 닫히거나 최소화/풀창이 되면 바닥으로 낙하!
    if (actor.attachedHwnd && (!prevAttached || !isClimbableWindow(prevAttached))) {
      actor.attachedHwnd = null;
      actor.surfaceType = 'screen';
      if (!actor.isDragging && actor.state !== 'fall') {
        actor.vy = 1;
        setActorState('fall');
        showSpeech('앗! 창이 사라졌다~! 🪂', 1800);
      }
    } else if (actor.attachedHwnd && prevAttached && actor.lastWinPos) {
      // 내가 올라타 있는 창을 마우스로 움직이면 쿠리만쥬도 창을 따라 같이 이동!
      const dx = prevAttached.x - actor.lastWinPos.x;
      const dy = prevAttached.y - actor.lastWinPos.y;
      if (Math.abs(dx) > 0 || Math.abs(dy) > 0) {
        actor.x += dx;
        actor.y += dy;
      }
      actor.lastWinPos = { x: prevAttached.x, y: prevAttached.y, width: prevAttached.width, height: prevAttached.height };
    }

    priorityWindow = selectPriorityWindow(trackedWindows);
  });

  // =========================================================
  // 2. 쿠리만쥬 시메지 물리 & 창 올라타기 상태 머신
  // =========================================================
  const actor = {
    spawned: false,
    x: Math.floor(window.innerWidth * 0.5 - 65),
    y: 60,
    vx: 0,
    vy: 0,
    width: spriteConfig.width || 130,
    height: spriteConfig.height || 130,
    dir: 1,
    climbDir: -1,
    wallSide: 'right',
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
    speechTimeout: null
  };

  // 발바닥이 지붕(타이틀바)에 자연스럽게 닿도록 하는 오프셋
  const FOOT_OFFSET = 12;
  let miniHudJumpCooldown = 0; // 미니창에서 뛰어내렸을 때 즉시 재착지 방지 쿨다운

  function getAttachedWindow() {
    if (!actor.attachedHwnd) return null;
    return trackedWindows.find((w) => w.hwnd === actor.attachedHwnd && isClimbableWindow(w)) || null;
  }

  function attachToWindow(win, surfaceType) {
    if (!win) {
      actor.attachedHwnd = null;
      actor.surfaceType = surfaceType || 'screen';
      actor.lastWinPos = null;
      return;
    }
    actor.attachedHwnd = win.hwnd;
    actor.surfaceType = surfaceType;
    actor.lastWinPos = { x: win.x, y: win.y, width: win.width, height: win.height };
  }

  // =========================================================
  // 활동 모드 관리 (자유 산책 vs 얌전 모드 & 자세 고정)
  // =========================================================
  let isWanderEnabled = true;
  try {
    const saved = localStorage.getItem('kurimanju_wander_enabled');
    if (saved !== null) isWanderEnabled = JSON.parse(saved);
  } catch (_) {}

  let lockedPose = null; // null: 자동 스토리 순환, string: 특정 자세로 고정 유지 ("너 이 동작으로 가만히 있어")
  let calmRoutine = 1;   // 1: 일과 스토리, 2: 심심 루틴
  let calmStep = 0;
  let calmTimer = 300;   // 약 5초 (60fps 기준 300프레임)

  // 1. 일과 스토리: idle(5초) -> bag(5초) -> snack(5초) -> haa(5초) -> sleep(5초)
  const CALM_STORY_STEPS = [
    { state: 'idle', duration: 300, speech: '주인 일하네? 👀' },
    { state: 'bag', duration: 300, speech: '나도 일해야지~ 🎒' },
    { state: 'snack', duration: 300, speech: '나는 술 자격증 보유자 🍶' },
    { state: 'haa', duration: 300, speech: '크아아ー!! 🍺' },
    { state: 'sleep', duration: 300, speech: '윽.. 숙취~~ 💤' }
  ];

  // 2. 심심 루틴: idle 상태에서 다양한 대사로 심심해함 (land 모션 제외)
  const CALM_BORED_STEPS = [
    { state: 'idle', duration: 300, speech: '나 돌아다닐래~ 🥺' },
    { state: 'idle', duration: 300, speech: '심심해.. 옮겨줘~~' },
    { state: 'idle', duration: 300, speech: '딴짓 안 하고 열일 중이네.. 🌰' },
    { state: 'idle', duration: 300, speech: '지켜보는 중 👀' }
  ];

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
      if (calmRoutine === 1) {
        calmStep++;
        if (calmStep >= CALM_STORY_STEPS.length) {
          calmRoutine = 2;
          calmStep = 0;
        }
      } else {
        calmStep++;
        if (calmStep >= CALM_BORED_STEPS.length) {
          calmRoutine = 1;
          calmStep = 0;
        }
      }

      const stepList = calmRoutine === 1 ? CALM_STORY_STEPS : CALM_BORED_STEPS;
      const current = stepList[calmStep];
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
    } catch (_) {}

    updateWanderModeUI();

    if (isWanderEnabled) {
      if (notify) showSpeech('자유 산책 시작~! 🐾', 2000);
      pickNextGroundBehavior();
    } else {
      calmRoutine = 1;
      calmStep = 0;
      const initial = CALM_STORY_STEPS[0];
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

  function showSpeech(text, durationMs = 2600) {
    actorSpeech.textContent = text;
    actorSpeech.classList.remove('hidden');
    if (actor.speechTimeout) clearTimeout(actor.speechTimeout);
    if (durationMs > 0) {
      actor.speechTimeout = setTimeout(() => {
        actorSpeech.classList.add('hidden');
      }, durationMs);
    }
  }

  function setActorState(newState, durationFrames = 180) {
    if (actor.state !== newState) {
      actor.state = newState;
      actor.frameIndex = 0;
      updateSpriteFrame();
    }
    actor.stateTimer = durationFrames;

    if (newState === 'bag') {
      bagEffectRing.classList.remove('hidden');
    } else {
      bagEffectRing.classList.add('hidden');
    }
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
    const canvasW = spriteConfig.width || 135;
    const canvasH = spriteConfig.height || 135;

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
    const baseRatio = (spriteConfig.targetHeightRatio || 0.85) * (frameMeta.scale || 1);
    let scale;

    if (stateName === 'land') {
      // 착지할 때 납작해진 찹쌀떡 포즈는 가로 너비 기준으로 맞춤
      scale = (canvasW * 0.90 * (frameMeta.scale || 1)) / cropW;
    } else if (stateName === 'grabbed') {
      // 머리 위 집는 손이 포함된 잡기 포즈는 전체 높이의 94% 사용
      scale = Math.min((canvasH * 0.94) / cropH, (canvasW * 0.92) / cropW);
    } else if (stateName === 'walk' || stateName === 'idle' || stateName === 'haa' || stateName === 'bag') {
      // 걷기/서있기 프레임들은 키(높이)를 정확히 통일해서 프레임 전환 시 위아래로 튀지 않게 고정!
      scale = Math.min((canvasH * baseRatio) / cropH, (canvasW * 0.92) / cropW);
    } else {
      scale = Math.min((canvasH * baseRatio) / cropH, (canvasW * 0.90) / cropW);
    }

    const drawW = cropW * scale;
    const drawH = cropH * scale;

    const destX = Math.round((canvasW - drawW) / 2 + (frameMeta.offsetX || 0));
    let destY;

    if (stateName === 'grabbed') {
      // 잡힌 모션은 맨 위(집는 손)를 상단에 고정해서 마우스 커서와 손이 일치하도록 정렬
      destY = Math.round(2 + (frameMeta.offsetY || 0));
    } else if (stateName === 'ceiling') {
      // 천장 매달리기는 위로 뻗은 손이 상단에 닿도록 정렬
      destY = Math.round(4 + (frameMeta.offsetY || 0));
    } else {
      // 나머지 모든 지상/등반 동작은 발바닥 끝선을 동일한 바닥선(footBaseline)에 칼같이 정렬!
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

      for (const [stateName, frameList] of Object.entries(spriteConfig.states)) {
        spriteConfig.states[stateName] = frameList.map((entry) => {
          const meta = normalizeFrameEntry(entry);
          // 만약 설정에 .svg로 적혀있더라도 같은 이름의 .png/.webp/.gif가 폴더에 있으면 자동 교체!
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

        // PNG / WebP 정지 이미지는 자동 여백 제거 & 발바닥/중심점 싱크 보정 수행
        if (spriteConfig.autoAlign !== false) {
          for (const meta of spriteConfig.states[stateName]) {
            const isRasterStatic = /\.(png|webp|jpg|jpeg)$/i.test(meta.src);
            if (!isRasterStatic && meta.offsetX === 0 && meta.offsetY === 0 && meta.scale === 1) {
              continue;
            }
            const cacheKey = `${stateName}:${meta.src}:${meta.offsetX}:${meta.offsetY}:${meta.scale}`;
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

  function updateSpriteFrame() {
    const frames = spriteConfig.states[actor.state] || spriteConfig.states.idle;
    const rawEntry = frames[actor.frameIndex % frames.length];
    const meta = normalizeFrameEntry(rawEntry);
    const cacheKey = `${actor.state}:${meta.src}:${meta.offsetX}:${meta.offsetY}:${meta.scale}`;
    const resolvedSrc = alignedSpriteCache.get(cacheKey) || meta.src;

    if (actorImg.getAttribute('src') !== resolvedSrc) {
      actorImg.setAttribute('src', resolvedSrc);
    }
  }

  setInterval(() => {
    if (!actor.spawned) return;
    const frames = spriteConfig.states[actor.state] || spriteConfig.states.idle;
    if (frames.length > 1) {
      actor.frameIndex = (actor.frameIndex + 1) % frames.length;
      updateSpriteFrame();
    }
  }, spriteConfig.frameIntervalMs || 220);

  function spawnKurimanju(dropFromTop = true) {
    actor.spawned = true;
    actorEl.classList.remove('hidden');
    if (dropFromTop) {
      attachToWindow(null, 'screen');
      // 우선순위 창이 있으면 그 창 위쪽으로 소환해서 창 지붕에 착지하도록 유도!
      if (priorityWindow && priorityWindow.y >= 55) {
        actor.x = Math.max(20, Math.min(window.innerWidth - actor.width - 20, priorityWindow.x + Math.floor(priorityWindow.width * 0.4)));
      } else {
        actor.x = Math.max(80, Math.min(window.innerWidth - 200, Math.floor(window.innerWidth * 0.45)));
      }
      actor.y = 10;
      actor.vx = (Math.random() - 0.5) * 2;
      actor.vy = 2;
      setActorState('fall');
      showSpeech('밤만쥬 선배 출근! 🌰', 2400);
      playPopSound();
    }
  }

  function pickNextGroundBehavior() {
    const rand = Math.random();
    if (rand < 0.45) {
      actor.dir = Math.random() < 0.5 ? -1 : 1;
      setActorState('walk', 180 + Math.floor(Math.random() * 200));
    } else if (rand < 0.65) {
      setActorState('snack', 170 + Math.floor(Math.random() * 110));
      const snackLines = ['오물오물.. 🍘', '바삭바삭.. 🥜', '홀짝.. ☕', '창 위에서 먹는 안주 맛 좋구만~'];
      showSpeech(snackLines[Math.floor(Math.random() * snackLines.length)], 2400);
    } else if (rand < 0.80) {
      setActorState('haa', 130);
      showSpeech('하아ー(ハーッ)!! 🍺', 2200);
    } else if (rand < 0.88) {
      setActorState('sleep', 180 + Math.floor(Math.random() * 120));
      showSpeech('으윽.. 숙취... 💤', 2500);
    } else {
      setActorState('idle', 100 + Math.floor(Math.random() * 90));
    }
  }

  function updatePhysics() {
    if (actor.spawned) {
      const screenGroundY = window.innerHeight - actor.height - 6;
      const maxX = window.innerWidth - actor.width;
      const attachedWin = getAttachedWindow();

      // 현재 바닥 높이와 좌우 이동 한계 계산 (미니창 위 vs 창 지붕 위 vs 바탕화면 바닥)
      let currentFloorY = screenGroundY;
      let minWalkX = 0;
      let maxWalkX = maxX;

      if (actor.surfaceType === 'mini-hud') {
        const hudRect = miniHud ? miniHud.getBoundingClientRect() : null;
        if (hudRect) {
          currentFloorY = Math.max(0, hudRect.top - actor.height + FOOT_OFFSET + 2);
          minWalkX = Math.max(0, hudRect.left - Math.floor(actor.width * 0.20));
          maxWalkX = Math.min(maxX, hudRect.right - Math.floor(actor.width * 0.80));
          if (!actor.isDragging && !isWanderEnabled) {
            // 얌전 모드일 때 미니창 안쪽으로 안정적인 위치 유지
            actor.x = Math.max(minWalkX, Math.min(maxWalkX, actor.x));
          }
        }
      } else if (actor.surfaceType === 'win-roof' && attachedWin) {
        currentFloorY = Math.max(0, attachedWin.y - actor.height + FOOT_OFFSET);
        minWalkX = Math.max(0, attachedWin.x - Math.floor(actor.width * 0.35));
        maxWalkX = Math.min(maxX, attachedWin.x + attachedWin.width - Math.floor(actor.width * 0.65));
      }

      // 마우스 드래그 틸트(기울기) 복원
      if (actor.isDragging) {
        actor.tiltDeg *= 0.85;
      } else {
        actor.tiltDeg = 0;
      }

      if (actor.isDragging) {
        // 드래그 중에는 마우스 위치 추종
      } else if (actor.state === 'fall') {
        const prevFootY = actor.y + actor.height - FOOT_OFFSET;
        actor.vy = Math.min(actor.vy + 0.55, 16);
        actor.x += actor.vx;
        actor.y += actor.vy;
        actor.vx *= 0.98;
        const newFootY = actor.y + actor.height - FOOT_OFFSET;
        const centerX = actor.x + actor.width * 0.5;

        if (miniHudJumpCooldown > 0) {
          miniHudJumpCooldown--;
        }

        // 0) 낙하 도중 상단 미니창(HUD 타이틀바)에 착지하는지 체크! (쿨다운 중에는 즉시 재착지 방지)
        const hudRect = miniHud ? miniHud.getBoundingClientRect() : null;
        if (hudRect && hudRect.width > 50 && miniHudJumpCooldown <= 0) {
          const withinHudX = centerX >= hudRect.left - 15 && centerX <= hudRect.right + 15;
          const crossedHudRoof = prevFootY <= hudRect.top + 16 && newFootY >= hudRect.top - 6 && actor.vy >= 0;
          if (withinHudX && crossedHudRoof) {
            attachToWindow(null, 'mini-hud');
            actor.y = hudRect.top - actor.height + FOOT_OFFSET + 2;
            actor.vx = 0;
            actor.vy = 0;
            setActorState(isWanderEnabled ? 'land' : 'idle', 20);
            showSpeech('미니창 위에 착지! 🌰', 2000);
            return requestAnimationFrame(updatePhysics);
          }
        }

        // 1) 낙하 도중 우선순위 창(크롬/카톡/탐색기 등)의 지붕(상단 테두리)에 착지하는지 체크!
        let landedOnWin = null;
        const candidateWins = priorityWindow
          ? [priorityWindow, ...trackedWindows.filter((w) => w.hwnd !== priorityWindow.hwnd && isClimbableWindow(w))]
          : trackedWindows.filter(isClimbableWindow);

        for (const w of candidateWins) {
          if (w.y < 45) continue; // 지붕이 화면 맨 위에 너무 붙어있으면 패스
          const withinX = centerX >= w.x + 10 && centerX <= w.x + w.width - 10;
          const crossedRoof = prevFootY <= w.y + 12 && newFootY >= w.y - 4 && actor.vy >= 0;
          if (withinX && crossedRoof) {
            landedOnWin = w;
            break;
          }
        }

        if (landedOnWin) {
          attachToWindow(landedOnWin, 'win-roof');
          actor.y = landedOnWin.y - actor.height + FOOT_OFFSET;
          actor.vx = 0;
          actor.vy = 0;
          setActorState(isWanderEnabled ? 'land' : 'idle', 22);
          showSpeech(`${getFriendlyAppName(landedOnWin)} 위에 착지! 🌰`, 2200);
        } else {
          // 화면 좌우 벽 반사
          if (actor.x <= 0) {
            actor.x = 0;
            actor.vx = -actor.vx * 0.5;
          } else if (actor.x >= maxX) {
            actor.x = maxX;
            actor.vx = -actor.vx * 0.5;
          }

          // 화면 맨 아래 바닥(작업표시줄) 착지
          if (actor.y >= screenGroundY) {
            attachToWindow(null, 'screen');
            actor.y = screenGroundY;
            actor.vx = 0;
            actor.vy = 0;
            setActorState(isWanderEnabled ? 'land' : 'idle', 24);
          }
        }
      } else if (!isWanderEnabled) {
        // [비활성화 / 얌전 모드]: 제자리에서 가만히 머물며 스토리/심심 루틴 또는 잠금 자세 유지
        actor.y = currentFloorY;
        actor.vx = 0;
        actor.vy = 0;
        runCalmTick();
      } else if (actor.state === 'land') {
        actor.y = currentFloorY;
        actor.stateTimer--;
        if (actor.stateTimer <= 0) {
          pickNextGroundBehavior();
        }
      } else if (actor.state === 'walk') {
        const speed = 1.85;
        actor.x += actor.dir * speed;
        actor.y = currentFloorY;
        actor.stateTimer--;

        if (actor.surfaceType === 'mini-hud') {
          // [미니창 상단 타이틀바 위를 걷는 중]
          if (actor.x <= minWalkX || actor.x >= maxWalkX) {
            const r = Math.random();
            // 미니창 끝에서는 75% 확률로 아래로 시원하게 뛰어내림! 25% 반대로 회전
            if (r < 0.75) {
              const hudRect = miniHud ? miniHud.getBoundingClientRect() : null;
              miniHudJumpCooldown = 100;
              attachToWindow(null, 'screen');
              actor.vx = (actor.x <= minWalkX ? -1 : 1) * 3.5;
              actor.vy = 2.2;
              if (hudRect) {
                actor.y = hudRect.bottom + 4;
              }
              setActorState('fall');
              showSpeech('미니창에서 폴짝~! 🪂', 1800);
            } else {
              actor.dir = actor.x <= minWalkX ? 1 : -1;
              actor.x = Math.max(minWalkX, Math.min(maxWalkX, actor.x));
            }
          } else if (actor.stateTimer <= 0) {
            pickNextGroundBehavior();
          }
        } else if (actor.surfaceType === 'win-roof' && attachedWin) {
          // [창 지붕 위를 걷는 중]
          if (actor.x <= minWalkX || actor.x >= maxWalkX) {
            // 창 지붕 끝에 도달했을 때: 65% 확률로 아래로 폴짝 다이빙 낙하! 20% 벽 타고 내려감, 15% 반대로 회전
            const r = Math.random();
            if (r < 0.65) {
              attachToWindow(null, 'screen');
              actor.vx = (actor.x <= minWalkX ? -1 : 1) * 3.2;
              actor.vy = -2.6;
              setActorState('fall');
              showSpeech('지붕 끝에서 폴짝 뛰어내리기! 🪂', 2000);
            } else if (r < 0.85) {
              actor.wallSide = actor.x <= minWalkX ? 'left' : 'right';
              actor.surfaceType = 'win-wall';
              actor.climbDir = 1; // 아래로 내려감
              setActorState('climb', 9999);
              showSpeech(`${getFriendlyAppName(attachedWin)} 벽 타고 내려가자~`, 2000);
            } else {
              actor.dir = actor.x <= minWalkX ? 1 : -1;
              actor.x = Math.max(minWalkX, Math.min(maxWalkX, actor.x));
            }
          } else if (actor.stateTimer <= 0) {
            pickNextGroundBehavior();
          }
        } else {
          // [바탕화면 바닥(작업표시줄 위)을 걷는 중]
          // 1) 우선순위 창(크롬/카톡/탐색기 등)의 좌/우 옆벽에 닿으면 그 창을 타고 올라가기!
          if (priorityWindow && isClimbableWindow(priorityWindow)) {
            const w = priorityWindow;
            const actorCenterX = actor.x + actor.width * 0.5;
            const leftWallX = w.x;
            const rightWallX = w.x + w.width;
            const wallReachesLowEnough = (w.y + w.height) >= screenGroundY - 120;

            if (wallReachesLowEnough && w.y >= 45) {
              if (Math.abs(actorCenterX - leftWallX) < 14 && leftWallX > 30 && Math.random() < 0.45) {
                attachToWindow(w, 'win-wall');
                actor.wallSide = 'left';
                actor.dir = 1;
                actor.climbDir = -1;
                setActorState('climb', 300);
                showSpeech(`오! ${getFriendlyAppName(w)} 타고 올라가자! 🧗`, 2200);
                return requestAnimationFrame(updatePhysics);
              } else if (Math.abs(actorCenterX - rightWallX) < 14 && rightWallX < window.innerWidth - 30 && Math.random() < 0.45) {
                attachToWindow(w, 'win-wall');
                actor.wallSide = 'right';
                actor.dir = -1;
                actor.climbDir = -1;
                setActorState('climb', 300);
                showSpeech(`오! ${getFriendlyAppName(w)} 타고 올라가자! 🧗`, 2200);
                return requestAnimationFrame(updatePhysics);
              }
            }
          }

          // 2) 모니터 좌/우 끝 벽에 도달했을 때 (창이 풀창이거나 창이 없을 때도 항상 작동)
          if (actor.x <= 0) {
            actor.x = 0;
            if (Math.random() < 0.72) {
              attachToWindow(null, 'screen');
              actor.wallSide = 'left';
              actor.dir = -1;
              actor.climbDir = -1;
              setActorState('climb', 240 + Math.floor(Math.random() * 180));
              showSpeech('영차.. 모니터 벽 등반! 🧗', 2000);
            } else {
              actor.dir = 1;
            }
          } else if (actor.x >= maxX) {
            actor.x = maxX;
            if (Math.random() < 0.72) {
              attachToWindow(null, 'screen');
              actor.wallSide = 'right';
              actor.dir = 1;
              actor.climbDir = -1;
              setActorState('climb', 240 + Math.floor(Math.random() * 180));
              showSpeech('영차.. 올라가볼까 🧗', 2000);
            } else {
              actor.dir = -1;
            }
          } else if (actor.stateTimer <= 0) {
            pickNextGroundBehavior();
          }
        }
      } else if (actor.state === 'climb') {
        const climbSpeed = 2.4;

        if (actor.surfaceType === 'win-wall' && attachedWin) {
          // [크롬/카톡/탐색기 창의 좌우 옆벽을 타고 오르내리는 중]
          const targetWallX = actor.wallSide === 'left'
            ? attachedWin.x - Math.floor(actor.width * 0.42)
            : attachedWin.x + attachedWin.width - Math.floor(actor.width * 0.58);
          actor.x = Math.max(0, Math.min(maxX, targetWallX));
          actor.y += actor.climbDir * climbSpeed;

          const roofY = Math.max(0, attachedWin.y - actor.height + FOOT_OFFSET);
          const bottomY = Math.min(screenGroundY, attachedWin.y + attachedWin.height - actor.height);

          if (actor.climbDir < 0) {
            // [위로 등반 중]: 중간에 멈추거나 유턴하지 않고 꼭대기까지 끝까지 올라가서 100% 지붕 안착!
            if (actor.y <= roofY + 6) {
              actor.y = roofY;
              actor.surfaceType = 'win-roof';
              actor.dir = actor.wallSide === 'left' ? 1 : -1;
              const safeRoofX = actor.wallSide === 'left'
                ? Math.min(maxX, attachedWin.x + 18)
                : Math.max(0, attachedWin.x + attachedWin.width - actor.width - 18);
              actor.x = safeRoofX;
              setActorState('land', 20);
              showSpeech(`${getFriendlyAppName(attachedWin)} 꼭대기 정복! 🌰`, 2400);
            }
          } else {
            // [아래로 내려가는 중]: 창문 바닥에 닿으면 작업표시줄로 착지하거나 뛰어내림
            if (actor.y >= bottomY - 6) {
              attachToWindow(null, 'screen');
              if (actor.y < screenGroundY - 25) {
                actor.vx = (actor.wallSide === 'left' ? -1 : 1) * 2.2;
                actor.vy = 1;
                setActorState('fall');
                showSpeech('폴짝 뛰어내리기! 🪂', 1800);
              } else {
                actor.y = screenGroundY;
                actor.dir = actor.wallSide === 'left' ? -1 : 1;
                setActorState('walk', 200);
              }
            }
          }
        } else {
          // [모니터 좌/우 끝 벽을 타고 오르내리는 중]
          actor.x = actor.wallSide === 'left' ? 0 : maxX;
          actor.y += actor.climbDir * climbSpeed;

          if (actor.climbDir < 0) {
            // 위로 끝까지 올라갔을 때 (모니터 상단)
            if (actor.y <= 10) {
              actor.y = 8;
              const r = Math.random();
              const anyMaximizedFg = trackedWindows.some((w) => w.isForeground && w.isMaximized);
              // 70% 확률로 천장 타기, 30% 확률로 다이빙 낙하
              if (r < 0.70) {
                actor.dir = actor.wallSide === 'left' ? 1 : -1;
                setActorState('ceiling', anyMaximizedFg ? 120 : 260);
                showSpeech('천장 산책 중~ 🌰', 2000);
              } else {
                actor.vx = actor.wallSide === 'left' ? 3.0 : -3.0;
                actor.vy = 0.5;
                setActorState('fall');
                showSpeech('슈웅 다이빙~! 🪂', 2000);
              }
            }
          } else {
            // 아래로 내려와 바닥에 닿았을 때
            if (actor.y >= screenGroundY) {
              actor.y = screenGroundY;
              actor.dir = actor.wallSide === 'left' ? 1 : -1;
              setActorState('walk', 200);
              showSpeech('바닥 도착! 총총~', 1800);
            }
          }
        }
      } else if (actor.state === 'ceiling') {
        const ceilingSpeed = 1.45;
        actor.y = 8;
        actor.x += actor.dir * ceilingSpeed;
        actor.stateTimer--;

        if (actor.x <= 0) {
          actor.x = 0;
          actor.wallSide = 'left';
          actor.climbDir = 1;
          setActorState('climb', 260);
        } else if (actor.x >= maxX) {
          actor.x = maxX;
          actor.wallSide = 'right';
          actor.climbDir = 1;
          setActorState('climb', 260);
        } else if (actor.stateTimer <= 0) {
          actor.vx = (Math.random() - 0.5) * 2;
          actor.vy = 1;
          setActorState('fall');
          showSpeech('착지 준비~! 🪂', 1600);
        }
      } else {
        actor.y = currentFloorY;
        actor.stateTimer--;
        if (actor.stateTimer <= 0) {
          pickNextGroundBehavior();
        }
      }

      // 화면 밖 탈출 방지 절대 안전 클램핑 (사라짐 원천 차단)
      if (!actor.isDragging) {
        actor.x = Math.max(0, Math.min(maxX, actor.x));
        actor.y = Math.max(0, Math.min(screenGroundY, actor.y));
      }

      actorEl.style.left = `${Math.round(actor.x)}px`;
      actorEl.style.top = `${Math.round(actor.y)}px`;

      let scaleX = 1;
      if (actor.state === 'walk' || actor.state === 'ceiling' || actor.state === 'fall') {
        scaleX = actor.dir >= 0 ? 1 : -1;
      } else if (actor.state === 'climb') {
        scaleX = actor.wallSide === 'right' ? 1 : -1;
      } else {
        // snack('꿀꺽 꿀꺽' 글자 보존), haa, bag, sleep, land, grabbed, idle 은 정방향 유지
        scaleX = 1;
      }
      spriteWrapper.style.transform = `scaleX(${scaleX}) rotate(${Math.round(actor.tiltDeg)}deg)`;
    }

    requestAnimationFrame(updatePhysics);
  }
  requestAnimationFrame(updatePhysics);

  // =========================================================
  // 3. 마우스 드래그(잡아서 낑낑) & 창 위에 직접 올려놓기 (1순위)
  // =========================================================
  const struggleQuotes = [
    '으으.. 낑낑💦',
    '파닥파닥.. 내려줘~!',
    '만쥬 쏟겠다구..💦',
    '어느 창 위에 올려줄 거야~?'
  ];

  actorEl.addEventListener('mousedown', (e) => {
    if (e.button === 0) {
      e.preventDefault();
      closeBagMenu(false);
      actor.isDragging = true;
      attachToWindow(null, 'screen');
      actorEl.classList.add('grabbing');
      // grabbed_1.png / grabbed_2.png 상단의 '집는 손' 위치에 마우스 커서가 딱 오도록 설정!
      actor.dragOffsetX = Math.round(actor.width * 0.5);
      actor.dragOffsetY = 18;
      actor.x = Math.max(0, Math.min(window.innerWidth - actor.width, e.clientX - actor.dragOffsetX));
      actor.y = Math.max(0, Math.min(window.innerHeight - actor.height, e.clientY - actor.dragOffsetY));
      actor.lastMouseX = e.clientX;
      setActorState('grabbed', 9999);
      const msg = struggleQuotes[Math.floor(Math.random() * struggleQuotes.length)];
      showSpeech(msg, 0);
      playPopSound();
    } else if (e.button === 2) {
      e.preventDefault();
      e.stopPropagation();
      actor.isDragging = false;
      actorEl.classList.remove('grabbing');
      actor.tiltDeg = 0;
      openBagMenu();
    }
  });

  actorEl.addEventListener('contextmenu', (e) => {
    e.preventDefault();
    e.stopPropagation();
    actor.isDragging = false;
    actorEl.classList.remove('grabbing');
    actor.tiltDeg = 0;
    openBagMenu();
  });

  window.addEventListener('mousemove', (e) => {
    if (!actor.isDragging) return;
    const dx = e.clientX - actor.lastMouseX;
    actor.lastMouseX = e.clientX;
    actor.tiltDeg = Math.max(-28, Math.min(28, dx * 1.4));

    const maxX = window.innerWidth - actor.width;
    const maxY = window.innerHeight - actor.height;
    actor.x = Math.max(0, Math.min(maxX, e.clientX - actor.dragOffsetX));
    actor.y = Math.max(0, Math.min(maxY, e.clientY - actor.dragOffsetY));
  });

  window.addEventListener('mouseup', (e) => {
    if (e.button === 0 && actor.isDragging) {
      actor.isDragging = false;
      actorEl.classList.remove('grabbing');
      actor.tiltDeg = 0;

      const maxX = window.innerWidth - actor.width;
      const footY = actor.y + actor.height - FOOT_OFFSET;
      const centerX = actor.x + actor.width * 0.5;

      // 0순위: 사용자가 미니창(상단 타이틀바) 위에 놓았을 때!
      const hudRect = miniHud ? miniHud.getBoundingClientRect() : null;
      if (hudRect && centerX >= hudRect.left - 25 && centerX <= hudRect.right + 25 && Math.abs(footY - hudRect.top) <= 60) {
        attachToWindow(null, 'mini-hud');
        actor.y = hudRect.top - actor.height + FOOT_OFFSET + 2;
        actor.x = Math.max(hudRect.left, Math.min(hudRect.right - actor.width, actor.x));
        setActorState(isWanderEnabled ? 'land' : 'idle', 20);
        showSpeech('미니창 위에 착! 🌰', 2200);
        return;
      }

      // 1순위: 사용자가 마우스로 놓은 위치 근처에 일반 창(크롬/카톡/탐색기 등)의 지붕이나 옆벽이 있는지 확인!
      for (const w of trackedWindows) {
        if (!isClimbableWindow(w)) continue;
        // 창 지붕 근처에 놓았을 때 (타이틀바 상하 65px 범위)
        if (w.y >= 30 && centerX >= w.x - 20 && centerX <= w.x + w.width + 20 && Math.abs(footY - w.y) <= 65) {
          attachToWindow(w, 'win-roof');
          actor.y = w.y - actor.height + FOOT_OFFSET;
          actor.x = Math.max(w.x + 10, Math.min(w.x + w.width - actor.width - 10, actor.x));
          setActorState(isWanderEnabled ? 'land' : 'idle', 20);
          showSpeech(`${getFriendlyAppName(w)} 지붕에 착! 🌰`, 2400);
          return;
        }
        // 창 왼쪽/오른쪽 벽 근처에 놓았을 때
        if (actor.y + actor.height > w.y && actor.y < w.y + w.height) {
          if (Math.abs(centerX - w.x) <= 32) {
            attachToWindow(w, 'win-wall');
            actor.wallSide = 'left';
            actor.climbDir = -1;
            setActorState('climb', 260);
            showSpeech(`${getFriendlyAppName(w)} 벽 잡았다! 🧗`, 2200);
            return;
          }
          if (Math.abs(centerX - (w.x + w.width)) <= 32) {
            attachToWindow(w, 'win-wall');
            actor.wallSide = 'right';
            actor.climbDir = -1;
            setActorState('climb', 260);
            showSpeech(`${getFriendlyAppName(w)} 벽 잡았다! 🧗`, 2200);
            return;
          }
        }
      }

      // 모니터 천장이나 양옆 벽에 놓았을 때
      if (actor.y <= 24) {
        actor.y = 8;
        setActorState('ceiling', 220);
        showSpeech('천장에 착! 🌰', 1800);
      } else if (actor.x <= 16) {
        actor.x = 0;
        actor.wallSide = 'left';
        actor.climbDir = -1;
        setActorState('climb', 240);
        showSpeech('벽 잡았다! 영차~', 1800);
      } else if (actor.x >= maxX - 16) {
        actor.x = maxX;
        actor.wallSide = 'right';
        actor.climbDir = -1;
        setActorState('climb', 240);
        showSpeech('벽 잡았다! 영차~', 1800);
      } else {
        actor.vx = 0;
        actor.vy = 1;
        setActorState('fall');
        showSpeech('휴~ 살았다!', 1400);
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

  function renderBookmarks() {
    bookmarkListEl.innerHTML = '';
    if (!bookmarks || bookmarks.length === 0) {
      bookmarkListEl.innerHTML = `<div style="text-align:center; padding:14px; font-size:12px; color:#557A64;">가방이 비어있어요! 아래 버튼으로 자주 가는 사이트를 넣어보세요 🎒</div>`;
      return;
    }

    bookmarks.forEach((bm) => {
      const item = document.createElement('div');
      item.className = 'bookmark-item';

      const linkBtn = document.createElement('button');
      linkBtn.className = 'bookmark-link-btn';
      linkBtn.innerHTML = `
        <span class="bm-icon">${bm.icon || '🌰'}</span>
        <div class="bm-info">
          <div class="bm-name">${escapeHtml(bm.name)}</div>
          <div class="bm-url">${escapeHtml(bm.url)}</div>
        </div>
      `;
      linkBtn.addEventListener('click', () => {
        window.electronAPI?.openExternalUrl(bm.url);
        showSpeech(`「${bm.name}」 꺼냈다! 다녀와~ 🍺`, 2800);
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
    if (!actor.spawned) {
      spawnKurimanju(false);
      actor.x = Math.floor(window.innerWidth * 0.5 - 65);
      actor.y = window.innerHeight - actor.height - 6;
    }

    setActorState('bag', 9999);
    showSpeech('부스럭.. 어느 사이트를 꺼낼까? 🎒', 0);
    playRummageSound();

    bagMenu.classList.remove('hidden');

    const menuWidth = 300;
    const menuHeight = 340;
    let left = actor.x + actor.width + 14;
    if (left + menuWidth > window.innerWidth - 16) {
      left = Math.max(16, actor.x - menuWidth - 14);
    }
    let top = Math.min(window.innerHeight - menuHeight - 16, Math.max(16, actor.y - 80));

    bagMenu.style.left = `${Math.round(left)}px`;
    bagMenu.style.top = `${Math.round(top)}px`;
  }

  function closeBagMenu(playHaaAfter = false) {
    if (bagMenu.classList.contains('hidden')) return;
    bagMenu.classList.add('hidden');
    addBookmarkForm.classList.add('hidden');
    btnShowAddForm.classList.remove('hidden');

    if (playHaaAfter) {
      setActorState('haa', 110);
    } else if (actor.state === 'bag') {
      const groundY = window.innerHeight - actor.height - 6;
      if (actor.surfaceType === 'win-roof' && getAttachedWindow()) {
        pickNextGroundBehavior();
      } else if (actor.y < groundY - 4) {
        setActorState('fall');
      } else {
        pickNextGroundBehavior();
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
    showSpeech(`「${name}」 가방에 쏙 넣었다! 🎒`, 2500);
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

    if (!actor.spawned) {
      spawnKurimanju(true);
    } else if (actor.state === 'sleep') {
      pickNextGroundBehavior();
      showSpeech('자, 다시 시작해볼까! 🌰', 2200);
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
      setActorState('sleep', 9999);
      showSpeech('잠시 쉬는 시간.. 으윽.. 💤', 0);
    } else {
      btnPauseTimer.textContent = '⏸ 일시정지';
      pickNextGroundBehavior();
      showSpeech('다시 달려보자구~! 🌰', 2000);
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

    if (actor.spawned) {
      pickNextGroundBehavior();
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

      const actorCenterX = actor.x + actor.width * 0.5;
      const actorCenterY = actor.y + actor.height * 0.5;

      // 쿠리만쥬가 현재 위치한 모니터 디스플레이 찾기
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

    setActorState('haa', 420);
    showSpeech('하아ー(ハーッ)!! 수고했어!! 🍺✨', 8000);
    playHaaFanfare();

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
    showSpeech('5분 동안 맛있는 안주 먹으며 쉬자~ 🍘', 3000);
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
      if (!actor.spawned) spawnKurimanju(false);
      closeBagMenu(false);

      const action = btn.dataset.action;
      const groundY = window.innerHeight - actor.height - 6;
      const maxX = window.innerWidth - actor.width;

      if (!isWanderEnabled && action !== 'drop') {
        // [비활성화 / 얌전 모드일 때]:
        // 선택한 동작으로 자세를 고정하여 가만히 유지! ("너 이 동작으로 가만히 있어")
        const poseMap = {
          sleep: { state: 'sleep', speech: '쿨쿨.. 낮잠 자는 중 💤' },
          land: { state: 'land', speech: '납작하게 엎드려 있는 중~ 🙇' },
          idle: { state: 'idle', speech: '얌전히 멍때리는 중 👀' },
          snack: { state: 'snack', speech: '오물오물.. 안주 먹는 중 🍘' },
          haa: { state: 'haa', speech: '하아ー(ハーッ)!! 🍺' },
          bag: { state: 'bag', speech: '가방 뒤적뒤적.. 🎒' },
          walk: { state: 'idle', speech: '얌전 모드라 제자리 대기 중! 🐾' },
          'climb-up': { state: 'climb', speech: '벽에 찰싹 붙어있기! 🧗' },
          'climb-down': { state: 'climb', speech: '벽에 찰싹 붙어있기! 🧗' },
          ceiling: { state: 'ceiling', speech: '천장에 대롱대롱 매달리기! 🦇' }
        };

        const targetPose = poseMap[action] || { state: action, speech: '이 자세로 가만히 있을게! 🌰' };
        lockedPose = targetPose.state;
        setActorState(targetPose.state, 9999);
        showSpeech(targetPose.speech, 2400);
        return;
      }

      // [자유 산책 모드일 때 즉시 제스처 실행]
      if (action === 'walk') {
        // 만약 창 모드로 떠 있는 우선순위 창이 있으면 그 창 지붕 위로, 아니면 바닥으로!
        if (priorityWindow && priorityWindow.y >= 45) {
          attachToWindow(priorityWindow, 'win-roof');
          actor.x = Math.max(0, Math.min(maxX, priorityWindow.x + Math.floor(priorityWindow.width * 0.4)));
          actor.y = priorityWindow.y - actor.height + FOOT_OFFSET;
          actor.dir = 1;
          setActorState('walk', 260);
          showSpeech(`${getFriendlyAppName(priorityWindow)} 지붕 산책 중! 🐾`, 2200);
        } else {
          attachToWindow(null, 'screen');
          actor.y = groundY;
          actor.dir = Math.random() < 0.5 ? -1 : 1;
          setActorState('walk', 260);
          showSpeech('바닥 총총 산책 중 🐾', 2000);
        }
      } else if (action === 'sleep') {
        setActorState('sleep', 260);
        showSpeech('쿨쿨.. 낮잠 타임 💤', 2400);
      } else if (action === 'land') {
        setActorState('land', 240);
        showSpeech('납작하게 엎드리기~ 🙇', 2200);
      } else if (action === 'idle') {
        setActorState('idle', 220);
        showSpeech('물끄러미 바라보기.. 👀', 2000);
      } else if (action === 'climb-up') {
        if (priorityWindow && isClimbableWindow(priorityWindow)) {
          attachToWindow(priorityWindow, 'win-wall');
          actor.wallSide = priorityWindow.x > 40 ? 'left' : 'right';
          actor.y = Math.min(groundY, priorityWindow.y + priorityWindow.height - actor.height);
          actor.climbDir = -1;
          setActorState('climb', 320);
          showSpeech(`${getFriendlyAppName(priorityWindow)} 벽 타고 올라간다~ 🧗`, 2400);
        } else {
          attachToWindow(null, 'screen');
          actor.wallSide = actor.x < window.innerWidth / 2 ? 'left' : 'right';
          actor.x = actor.wallSide === 'left' ? 0 : maxX;
          actor.y = groundY - 10;
          actor.climbDir = -1;
          setActorState('climb', 320);
          showSpeech('모니터 벽 타고 올라간다~ 🧗', 2400);
        }
      } else if (action === 'climb-down') {
        attachToWindow(null, 'screen');
        actor.wallSide = actor.x < window.innerWidth / 2 ? 'left' : 'right';
        actor.x = actor.wallSide === 'left' ? 0 : maxX;
        actor.y = 20;
        actor.climbDir = 1;
        setActorState('climb', 320);
        showSpeech('조심조심 위에서 내려가는 중~ 🧗‍♂️', 2400);
      } else if (action === 'ceiling') {
        attachToWindow(null, 'screen');
        actor.y = 8;
        actor.dir = 1;
        setActorState('ceiling', 300);
        showSpeech('천장에 매달려서 이동 중! 🌰', 2400);
      } else if (action === 'drop') {
        attachToWindow(null, 'screen');
        if (priorityWindow && priorityWindow.y >= 55) {
          actor.x = Math.max(20, Math.min(maxX - 20, priorityWindow.x + Math.floor(priorityWindow.width * 0.45)));
        }
        actor.y = 10;
        actor.vx = 0;
        actor.vy = 2;
        setActorState('fall');
        showSpeech('위에서 아래로 슈웅~! 🪂', 2000);
      } else if (action === 'snack') {
        setActorState('snack', 240);
        showSpeech('감씨과자에 맥주 한 모금.. 🍘🍺', 2600);
      } else if (action === 'haa') {
        setActorState('haa', 200);
        showSpeech('하아ー(ハーッ)!! 크으~ 🍺', 2800);
        playHaaFanfare();
      } else if (action === 'bag') {
        openBagMenu();
      }
    });
  });

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
      if (!actor.spawned) spawnKurimanju(false);
      setActorState('haa', 220);
      showSpeech('하아ー(ハーッ)!! 🍺', 2800);
      playHaaFanfare();
    } else if (cmd === 'open-bag') {
      openBagMenu();
    }
  });

  initSpritesAndAutoAlign();
  loadBookmarks();
  updateTimerDisplays();
  updateWanderModeUI();
})();
