/**
 * 쿠리만쥬 스프라이트(이미지) 설정 파일
 * ---------------------------------------------------------
 * 직접 넣어주신 15종의 PNG 파일이 모두 연결되어 있습니다!
 */

window.KURIMANJU_SPRITES = {
  // 캐릭터 표시 크기 (px)
  width: 135,
  height: 135,

  // 프레임 전환 속도 (밀리초)
  frameIntervalMs: 220,

  // PNG 여백/흰배경 자동 제거 & 동작별 중심/발바닥/집는손 싱크 자동 보정
  autoAlign: true,

  // 캐릭터 표준 높이 비율
  targetHeightRatio: 0.85,

  // 상태별 이미지 경로
  states: {
    // 1. 기본 서있기
    idle: ['assets/sprites/idle.png'],

    // 2. 바닥 총총 걷기
    walk: ['assets/sprites/walk_1.png', 'assets/sprites/walk_2.png'],

    // 3. 마우스로 잡았을 때 낑낑거리는 모션 (머리 위 손으로 잡힌 모션)
    grabbed: ['assets/sprites/grabbed_1.png', 'assets/sprites/grabbed_2.png'],

    // 4. 화면/창 양옆 벽 타고 올라가기 & 내려오기
    climb: ['assets/sprites/climb_1.png', 'assets/sprites/climb_2.png'],

    // 5. 화면 맨 위 천장 매달려 이동하기
    ceiling: ['assets/sprites/ceiling_1.png', 'assets/sprites/ceiling_2.png'],

    // 6. 위에서 아래로 자유낙하
    fall: ['assets/sprites/fall.png'],

    // 7. 바닥/창 지붕에 착지할 때
    land: ['assets/sprites/land.png'],

    // 8. 대기 중 맥주/안주 꿀꺽꿀꺽 먹방
    snack: ['assets/sprites/snack.png'],

    // 9. 우클릭 시 초록 가방 열어 캔 꺼내는 모션
    bag: ['assets/sprites/bag.png'],

    // 10. 타이머 종료 / 휴식 시 시그니처 「하아ー(ハーッ!)」 모션
    haa: ['assets/sprites/haa.png'],

    // 11. 숙취 상태
    sleep: ['assets/sprites/sleep.png'],

    // 12. 달콤한 낮잠 상태
    dream: ['assets/sprites/dream.png']
  }
};
