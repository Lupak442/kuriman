/**
 * 치이카와 시메지 스프라이트(이미지) & 캐릭터 설정 파일
 * ---------------------------------------------------------
 * 🌰 쿠리만쥬 선배 & 🦦 랏코 스승님 캐릭터 및 테마 지원
 */

window.CHARACTER_CONFIGS = {
  kurimanju: {
    id: 'kurimanju',
    name: '쿠리만쥬',
    title: '쿠리만쥬 선배',
    badge: '🌰 쿠리만쥬 타이머',
    emoji: '🌰',
    friendLabel: '🦦 랏코 스승님',
    friendId: 'rakko',
    themeClass: 'theme-kurimanju',
    width: 135,
    height: 135,
    frameIntervalMs: 220,
    autoAlign: true,
    targetHeightRatio: 0.85,
    quotes: {
      spawn: '밤만쥬 선배 출근! 🌰',
      friendSpawn: '오! 랏코 스승님 어서오고~! 🌰🦦',
      dismissFriend: '랏코는 단련하러 돌아갔어~ 👋',
      snack: ['오물오물.. 🍘', '바삭바삭.. 🥜', '홀짝.. ☕', '창 위에서 먹는 안주 맛 좋구만~'],
      haa: '하아ー(ハーッ)!! 🍺',
      sleep: '으윽.. 숙취... 머리야 🍺',
      dream: '쿨쿨.. 달콤한 낮잠 타임 😴💤',
      climb: '벽 잡았다! 영차~ 🧗',
      jump: '지붕 끝에서 대각선 폴짝~! 🪂',
      landOnWin: (appName) => `${appName} 위에 착지! 🌰`,
      struggle: ['으으.. 낑낑💦', '파닥파닥.. 내려줘~!', '만쥬 쏟겠다구..💦', '어느 창 위에 올려줄 거야~?'],
      timerDone: '하아ー(ハーッ)!! 수고했어!! 🍺✨'
    },
    states: {
      idle: ['assets/sprites/idle.png'],
      walk: ['assets/sprites/walk_1.png', 'assets/sprites/walk_2.png'],
      grabbed: ['assets/sprites/grabbed_1.png', 'assets/sprites/grabbed_2.png'],
      climb: ['assets/sprites/climb_1.png', 'assets/sprites/climb_2.png'],
      ceiling: ['assets/sprites/ceiling_1.png', 'assets/sprites/ceiling_2.png'],
      fall: ['assets/sprites/fall.png'],
      land: ['assets/sprites/land.png'],
      snack: ['assets/sprites/snack.png'],
      bag: ['assets/sprites/bag.png'],
      haa: ['assets/sprites/haa.png'],
      sleep: ['assets/sprites/sleep.png'],
      dream: ['assets/sprites/dream.png']
    }
  },
  rakko: {
    id: 'rakko',
    name: '랏코',
    title: '랏코 스승님',
    badge: '🦦 랏코 스승님 타이머',
    emoji: '🦦',
    friendLabel: '🌰 쿠리만쥬 선배',
    friendId: 'kurimanju',
    themeClass: 'theme-rakko',
    width: 135,
    height: 135,
    frameIntervalMs: 220,
    autoAlign: true,
    targetHeightRatio: 0.85,
    quotes: {
      spawn: '맡겨둬라. 랏코 스승 참전! 🦦⚔️',
      friendSpawn: '오, 쿠리만쥬인가! 함께 순찰하지. 🦦🌰',
      dismissFriend: '쿠리만쥬는 한잔하러 돌아갔다. 👋',
      snack: ['파르페.. 달콤하군 🍨', '피로가 싹 가시는 맛이다 ✨', '당분 충전 완료다! 🍓', '스위츠는 최고의 보상이다.'],
      haa: '단련의 성과다!! ⚔️✨',
      sleep: '수련이 과했나.. 쿨.. 💤',
      dream: '조개를 안고 낮잠 타임.. 😴🌊',
      climb: '경계 태세! 높은 곳으로! 🧗',
      jump: '스승의 가벼운 도약이다! 🪂',
      landOnWin: (appName) => `${appName} 점령 완료! 🦦`,
      struggle: ['무, 무슨 짓이냐.. 놓아라!', '스승의 체면이.. 💦', '혼자서도 올라갈 수 있다!'],
      timerDone: '훌륭하다! 오늘의 수련 완수다! ⚔️🎉'
    },
    states: {
      idle: ['assets/sprites/rakko/idle.png'],
      walk: ['assets/sprites/rakko/walk_1.png', 'assets/sprites/rakko/walk_2.png'],
      grabbed: ['assets/sprites/rakko/grabbed_1.png', 'assets/sprites/rakko/grabbed_2.png'],
      climb: ['assets/sprites/rakko/climb_1.png', 'assets/sprites/rakko/climb_2.png'],
      ceiling: ['assets/sprites/rakko/ceiling_1.png', 'assets/sprites/rakko/ceiling_2.png'],
      fall: ['assets/sprites/rakko/fall.png'],
      land: ['assets/sprites/rakko/land.png'],
      snack: ['assets/sprites/rakko/snack.png'],
      bag: ['assets/sprites/rakko/bag.png'],
      haa: ['assets/sprites/rakko/haa.png'],
      sleep: ['assets/sprites/rakko/sleep.png'],
      dream: ['assets/sprites/rakko/dream.png']
    }
  }
};

// 기본 및 하위 호환성 유지
window.KURIMANJU_SPRITES = window.CHARACTER_CONFIGS.kurimanju;
