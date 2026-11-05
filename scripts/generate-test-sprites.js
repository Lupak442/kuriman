const fs = require('fs');
const path = require('path');

const spritesDir = path.join(__dirname, '..', 'assets', 'sprites');
fs.mkdirSync(spritesDir, { recursive: true });

// Base Kurimanju helper: Cream body with roasted chestnut brown top
function wrapSvg(content, viewBox = "0 0 140 140") {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}" width="140" height="140">
  <defs>
    <filter id="shadow" x="-15%" y="-15%" width="130%" height="130%">
      <feDropShadow dx="0" dy="3" stdDeviation="2.5" flood-color="#000000" flood-opacity="0.28"/>
    </filter>
    <clipPath id="headClip">
      <ellipse cx="70" cy="66" rx="44" ry="39"/>
    </clipPath>
    <clipPath id="squishClip">
      <ellipse cx="70" cy="76" rx="50" ry="32"/>
    </clipPath>
    <linearGradient id="chestnutGrad" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#6B3710"/>
      <stop offset="65%" stop-color="#8A4B19"/>
      <stop offset="100%" stop-color="#9B5722"/>
    </linearGradient>
  </defs>
  <g filter="url(#shadow)">
    ${content}
  </g>
</svg>`;
}

function drawHead(cx = 70, cy = 66, rx = 44, ry = 39, clipId = "headClip") {
  return `
    <!-- Ears -->
    <circle cx="${cx - 33}" cy="${cy - 26}" r="11" fill="#FFF7DF" stroke="#3B2314" stroke-width="3"/>
    <circle cx="${cx - 33}" cy="${cy - 26}" r="5.5" fill="#F5D5B8"/>
    <circle cx="${cx + 33}" cy="${cy - 26}" r="11" fill="#FFF7DF" stroke="#3B2314" stroke-width="3"/>
    <circle cx="${cx + 33}" cy="${cy - 26}" r="5.5" fill="#F5D5B8"/>
    <!-- Main Head Base -->
    <ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="#FFF7DF" stroke="#3B2314" stroke-width="3"/>
    <!-- Chestnut Brown Top (Kurimanju signature) -->
    <g clip-path="url(#${clipId})">
      <ellipse cx="${cx}" cy="${cy - 23}" rx="${rx + 4}" ry="26" fill="url(#chestnutGrad)"/>
      <!-- Gloss on chestnut top -->
      <ellipse cx="${cx - 12}" cy="${cy - 31}" rx="14" ry="5" fill="#FFFFFF" opacity="0.28" transform="rotate(-10 ${cx - 12} ${cy - 31})"/>
    </g>
    <!-- Re-stroke head outline cleanly -->
    <ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="none" stroke="#3B2314" stroke-width="3"/>
  `;
}

function drawNormalFace(cx = 70, cy = 66) {
  return `
    <!-- Blush -->
    <ellipse cx="${cx - 24}" cy="${cy + 9}" rx="7.5" ry="4.5" fill="#FF9E9E" opacity="0.75"/>
    <ellipse cx="${cx + 24}" cy="${cy + 9}" rx="7.5" ry="4.5" fill="#FF9E9E" opacity="0.75"/>
    <!-- Eyes -->
    <circle cx="${cx - 14}" cy="${cy + 2}" r="4.2" fill="#2B1810"/>
    <circle cx="${cx - 15.5}" cy="${cy + 0.5}" r="1.4" fill="#FFFFFF"/>
    <circle cx="${cx + 14}" cy="${cy + 2}" r="4.2" fill="#2B1810"/>
    <circle cx="${cx + 12.5}" cy="${cy + 0.5}" r="1.4" fill="#FFFFFF"/>
    <!-- Under-eye cute lines -->
    <path d="M ${cx - 17} ${cy + 9} Q ${cx - 14} ${cy + 10.5} ${cx - 11} ${cy + 9}" fill="none" stroke="#3B2314" stroke-width="1.6" stroke-linecap="round"/>
    <path d="M ${cx + 11} ${cy + 9} Q ${cx + 14} ${cy + 10.5} ${cx + 17} ${cy + 9}" fill="none" stroke="#3B2314" stroke-width="1.6" stroke-linecap="round"/>
    <!-- Mouth (ω) -->
    <path d="M ${cx - 6} ${cy + 9} Q ${cx - 3} ${cy + 13} ${cx} ${cy + 9.5} Q ${cx + 3} ${cy + 13} ${cx + 6} ${cy + 9}" fill="none" stroke="#3B2314" stroke-width="2.3" stroke-linecap="round"/>
  `;
}

const sprites = {
  // 1. IDLE
  'idle.svg': wrapSvg(`
    <!-- Feet -->
    <ellipse cx="56" cy="123" rx="9" ry="6" fill="#FFF7DF" stroke="#3B2314" stroke-width="3"/>
    <ellipse cx="84" cy="123" rx="9" ry="6" fill="#FFF7DF" stroke="#3B2314" stroke-width="3"/>
    <!-- Body -->
    <ellipse cx="70" cy="103" rx="28" ry="22" fill="#FFF7DF" stroke="#3B2314" stroke-width="3"/>
    <!-- Arms -->
    <ellipse cx="41" cy="100" rx="8" ry="12" transform="rotate(20 41 100)" fill="#FFF7DF" stroke="#3B2314" stroke-width="3"/>
    <ellipse cx="99" cy="100" rx="8" ry="12" transform="rotate(-20 99 100)" fill="#FFF7DF" stroke="#3B2314" stroke-width="3"/>
    ${drawHead()}
    ${drawNormalFace()}
  `),

  // 2. WALK 1
  'walk_1.svg': wrapSvg(`
    <!-- Feet stepping -->
    <ellipse cx="52" cy="120" rx="9" ry="6" transform="rotate(-15 52 120)" fill="#FFF7DF" stroke="#3B2314" stroke-width="3"/>
    <ellipse cx="86" cy="125" rx="9" ry="6" transform="rotate(10 86 125)" fill="#FFF7DF" stroke="#3B2314" stroke-width="3"/>
    <!-- Body -->
    <ellipse cx="70" cy="102" rx="28" ry="22" fill="#FFF7DF" stroke="#3B2314" stroke-width="3"/>
    <!-- Arms swinging -->
    <ellipse cx="39" cy="96" rx="8" ry="12" transform="rotate(38 39 96)" fill="#FFF7DF" stroke="#3B2314" stroke-width="3"/>
    <ellipse cx="100" cy="103" rx="8" ry="12" transform="rotate(-12 100 103)" fill="#FFF7DF" stroke="#3B2314" stroke-width="3"/>
    ${drawHead(70, 64)}
    ${drawNormalFace(70, 64)}
  `),

  // 3. WALK 2
  'walk_2.svg': wrapSvg(`
    <!-- Feet stepping opposite -->
    <ellipse cx="54" cy="125" rx="9" ry="6" transform="rotate(-10 54 125)" fill="#FFF7DF" stroke="#3B2314" stroke-width="3"/>
    <ellipse cx="88" cy="120" rx="9" ry="6" transform="rotate(15 88 120)" fill="#FFF7DF" stroke="#3B2314" stroke-width="3"/>
    <!-- Body -->
    <ellipse cx="70" cy="104" rx="28" ry="22" fill="#FFF7DF" stroke="#3B2314" stroke-width="3"/>
    <!-- Arms swinging -->
    <ellipse cx="40" cy="103" rx="8" ry="12" transform="rotate(12 40 103)" fill="#FFF7DF" stroke="#3B2314" stroke-width="3"/>
    <ellipse cx="101" cy="96" rx="8" ry="12" transform="rotate(-38 101 96)" fill="#FFF7DF" stroke="#3B2314" stroke-width="3"/>
    ${drawHead(70, 66)}
    ${drawNormalFace(70, 66)}
  `),

  // 4. GRABBED 1 (Struggling / 낑낑 1)
  'grabbed_1.svg': wrapSvg(`
    <!-- Dangling legs kicking -->
    <ellipse cx="52" cy="126" rx="8" ry="10" transform="rotate(28 52 126)" fill="#FFF7DF" stroke="#3B2314" stroke-width="3"/>
    <ellipse cx="87" cy="121" rx="8" ry="10" transform="rotate(-25 87 121)" fill="#FFF7DF" stroke="#3B2314" stroke-width="3"/>
    <!-- Stretched Body -->
    <ellipse cx="70" cy="105" rx="25" ry="24" fill="#FFF7DF" stroke="#3B2314" stroke-width="3"/>
    <!-- Flailing Arms up -->
    <ellipse cx="36" cy="86" rx="8" ry="13" transform="rotate(-55 36 86)" fill="#FFF7DF" stroke="#3B2314" stroke-width="3"/>
    <ellipse cx="104" cy="92" rx="8" ry="13" transform="rotate(45 104 92)" fill="#FFF7DF" stroke="#3B2314" stroke-width="3"/>
    ${drawHead(70, 66)}
    <!-- Struggling Face (> <) -->
    <ellipse cx="46" cy="75" rx="8" ry="4.5" fill="#FF8585" opacity="0.8"/>
    <ellipse cx="94" cy="75" rx="8" ry="4.5" fill="#FF8585" opacity="0.8"/>
    <path d="M 51 64 L 59 68 L 51 72" fill="none" stroke="#3B2314" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M 89 64 L 81 68 L 89 72" fill="none" stroke="#3B2314" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
    <!-- Wrinkled forehead -->
    <path d="M 66 57 L 68 62 M 74 57 L 72 62" stroke="#3B2314" stroke-width="2" stroke-linecap="round"/>
    <!-- Wavy struggling mouth -->
    <path d="M 61 78 Q 65 74 70 78 Q 75 82 79 78" fill="none" stroke="#3B2314" stroke-width="2.5" stroke-linecap="round"/>
    <!-- Sweat drops -->
    <path d="M 22 52 Q 16 58 22 62 Q 26 58 22 52 Z" fill="#6EC6FF" stroke="#3B2314" stroke-width="1.8"/>
    <path d="M 118 58 Q 124 64 118 68 Q 114 64 118 58 Z" fill="#6EC6FF" stroke="#3B2314" stroke-width="1.8"/>
  `),

  // 5. GRABBED 2 (Struggling / 낑낑 2)
  'grabbed_2.svg': wrapSvg(`
    <!-- Dangling legs kicking opposite -->
    <ellipse cx="53" cy="121" rx="8" ry="10" transform="rotate(-20 53 121)" fill="#FFF7DF" stroke="#3B2314" stroke-width="3"/>
    <ellipse cx="88" cy="126" rx="8" ry="10" transform="rotate(30 88 126)" fill="#FFF7DF" stroke="#3B2314" stroke-width="3"/>
    <!-- Stretched Body -->
    <ellipse cx="70" cy="105" rx="25" ry="24" fill="#FFF7DF" stroke="#3B2314" stroke-width="3"/>
    <!-- Flailing Arms -->
    <ellipse cx="36" cy="94" rx="8" ry="13" transform="rotate(-35 36 94)" fill="#FFF7DF" stroke="#3B2314" stroke-width="3"/>
    <ellipse cx="104" cy="84" rx="8" ry="13" transform="rotate(60 104 84)" fill="#FFF7DF" stroke="#3B2314" stroke-width="3"/>
    ${drawHead(70, 66)}
    <!-- Struggling Face (> <) -->
    <ellipse cx="46" cy="75" rx="8" ry="4.5" fill="#FF8585" opacity="0.8"/>
    <ellipse cx="94" cy="75" rx="8" ry="4.5" fill="#FF8585" opacity="0.8"/>
    <path d="M 51 64 L 59 68 L 51 72" fill="none" stroke="#3B2314" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M 89 64 L 81 68 L 89 72" fill="none" stroke="#3B2314" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M 66 57 L 68 62 M 74 57 L 72 62" stroke="#3B2314" stroke-width="2" stroke-linecap="round"/>
    <ellipse cx="70" cy="78" rx="5" ry="4" fill="#D96B6B" stroke="#3B2314" stroke-width="2.2"/>
    <!-- Motion lines -->
    <path d="M 18 82 L 26 85 M 122 78 L 114 82" stroke="#3B2314" stroke-width="2.5" stroke-linecap="round"/>
  `),

  // 6. CLIMB 1 (Wall climbing)
  'climb_1.svg': wrapSvg(`
    <!-- Legs climbing -->
    <ellipse cx="52" cy="118" rx="9" ry="6" transform="rotate(-30 52 118)" fill="#FFF7DF" stroke="#3B2314" stroke-width="3"/>
    <ellipse cx="84" cy="125" rx="9" ry="6" transform="rotate(15 84 125)" fill="#FFF7DF" stroke="#3B2314" stroke-width="3"/>
    <!-- Body -->
    <ellipse cx="68" cy="102" rx="26" ry="22" fill="#FFF7DF" stroke="#3B2314" stroke-width="3"/>
    <!-- Reaching arm up -->
    <ellipse cx="36" cy="78" rx="8" ry="13" transform="rotate(-35 36 78)" fill="#FFF7DF" stroke="#3B2314" stroke-width="3"/>
    <ellipse cx="96" cy="98" rx="8" ry="12" transform="rotate(-15 96 98)" fill="#FFF7DF" stroke="#3B2314" stroke-width="3"/>
    ${drawHead(68, 64)}
    ${drawNormalFace(65, 64)}
    <!-- Effort puff -->
    <path d="M 108 52 Q 115 48 112 56" fill="none" stroke="#3B2314" stroke-width="2" stroke-linecap="round"/>
  `),

  // 7. CLIMB 2 (Wall climbing 2)
  'climb_2.svg': wrapSvg(`
    <!-- Legs climbing opposite -->
    <ellipse cx="54" cy="125" rx="9" ry="6" transform="rotate(-10 54 125)" fill="#FFF7DF" stroke="#3B2314" stroke-width="3"/>
    <ellipse cx="82" cy="117" rx="9" ry="6" transform="rotate(25 82 117)" fill="#FFF7DF" stroke="#3B2314" stroke-width="3"/>
    <!-- Body -->
    <ellipse cx="68" cy="100" rx="26" ry="22" fill="#FFF7DF" stroke="#3B2314" stroke-width="3"/>
    <!-- Reaching arm -->
    <ellipse cx="38" cy="92" rx="8" ry="13" transform="rotate(-15 38 92)" fill="#FFF7DF" stroke="#3B2314" stroke-width="3"/>
    <ellipse cx="94" cy="84" rx="8" ry="12" transform="rotate(25 94 84)" fill="#FFF7DF" stroke="#3B2314" stroke-width="3"/>
    ${drawHead(68, 62)}
    ${drawNormalFace(65, 62)}
  `),

  // 8. CEILING 1 (Hanging on ceiling)
  'ceiling_1.svg': wrapSvg(`
    <!-- Arms holding ceiling at top -->
    <ellipse cx="46" cy="24" rx="8" ry="13" transform="rotate(-15 46 24)" fill="#FFF7DF" stroke="#3B2314" stroke-width="3"/>
    <ellipse cx="94" cy="28" rx="8" ry="13" transform="rotate(15 94 28)" fill="#FFF7DF" stroke="#3B2314" stroke-width="3"/>
    <!-- Feet dangling -->
    <ellipse cx="55" cy="126" rx="9" ry="6" transform="rotate(15 55 126)" fill="#FFF7DF" stroke="#3B2314" stroke-width="3"/>
    <ellipse cx="85" cy="123" rx="9" ry="6" transform="rotate(-10 85 123)" fill="#FFF7DF" stroke="#3B2314" stroke-width="3"/>
    <!-- Body -->
    <ellipse cx="70" cy="104" rx="27" ry="22" fill="#FFF7DF" stroke="#3B2314" stroke-width="3"/>
    ${drawHead(70, 66)}
    ${drawNormalFace(70, 66)}
  `),

  // 9. CEILING 2
  'ceiling_2.svg': wrapSvg(`
    <!-- Arms holding ceiling opposite -->
    <ellipse cx="46" cy="28" rx="8" ry="13" transform="rotate(10 46 28)" fill="#FFF7DF" stroke="#3B2314" stroke-width="3"/>
    <ellipse cx="94" cy="24" rx="8" ry="13" transform="rotate(-10 94 24)" fill="#FFF7DF" stroke="#3B2314" stroke-width="3"/>
    <!-- Feet dangling -->
    <ellipse cx="55" cy="123" rx="9" ry="6" transform="rotate(-15 55 123)" fill="#FFF7DF" stroke="#3B2314" stroke-width="3"/>
    <ellipse cx="85" cy="126" rx="9" ry="6" transform="rotate(15 85 126)" fill="#FFF7DF" stroke="#3B2314" stroke-width="3"/>
    <!-- Body -->
    <ellipse cx="70" cy="104" rx="27" ry="22" fill="#FFF7DF" stroke="#3B2314" stroke-width="3"/>
    ${drawHead(70, 66)}
    ${drawNormalFace(70, 66)}
  `),

  // 10. FALL (Falling through air)
  'fall.svg': wrapSvg(`
    <!-- Wind lines -->
    <path d="M 24 25 L 24 45 M 116 20 L 116 42 M 70 10 L 70 22" stroke="#88C8FF" stroke-width="2.5" stroke-linecap="round"/>
    <!-- Feet up slightly -->
    <ellipse cx="52" cy="122" rx="9" ry="6" transform="rotate(25 52 122)" fill="#FFF7DF" stroke="#3B2314" stroke-width="3"/>
    <ellipse cx="88" cy="122" rx="9" ry="6" transform="rotate(-25 88 122)" fill="#FFF7DF" stroke="#3B2314" stroke-width="3"/>
    <!-- Body -->
    <ellipse cx="70" cy="102" rx="27" ry="22" fill="#FFF7DF" stroke="#3B2314" stroke-width="3"/>
    <!-- Arms raised high -->
    <ellipse cx="35" cy="82" rx="8" ry="13" transform="rotate(-55 35 82)" fill="#FFF7DF" stroke="#3B2314" stroke-width="3"/>
    <ellipse cx="105" cy="82" rx="8" ry="13" transform="rotate(55 105 82)" fill="#FFF7DF" stroke="#3B2314" stroke-width="3"/>
    ${drawHead(70, 66)}
    <!-- Surprised cute face -->
    <ellipse cx="46" cy="75" rx="7.5" ry="4.5" fill="#FF9E9E" opacity="0.75"/>
    <ellipse cx="94" cy="75" rx="7.5" ry="4.5" fill="#FF9E9E" opacity="0.75"/>
    <circle cx="56" cy="67" r="4.5" fill="#2B1810"/>
    <circle cx="54.5" cy="65.5" r="1.6" fill="#FFFFFF"/>
    <circle cx="84" cy="67" r="4.5" fill="#2B1810"/>
    <circle cx="82.5" cy="65.5" r="1.6" fill="#FFFFFF"/>
    <ellipse cx="70" cy="77" rx="4.2" ry="5" fill="#D96B6B" stroke="#3B2314" stroke-width="2.2"/>
  `),

  // 11. LAND (Squished landing)
  'land.svg': wrapSvg(`
    <!-- Impact dust puffs -->
    <circle cx="22" cy="124" r="6" fill="#FFFFFF" opacity="0.8"/>
    <circle cx="118" cy="124" r="6" fill="#FFFFFF" opacity="0.8"/>
    <!-- Squished feet -->
    <ellipse cx="48" cy="126" rx="11" ry="5" fill="#FFF7DF" stroke="#3B2314" stroke-width="3"/>
    <ellipse cx="92" cy="126" rx="11" ry="5" fill="#FFF7DF" stroke="#3B2314" stroke-width="3"/>
    <!-- Squished Wide Body -->
    <ellipse cx="70" cy="110" rx="34" ry="17" fill="#FFF7DF" stroke="#3B2314" stroke-width="3"/>
    <!-- Arms out -->
    <ellipse cx="34" cy="108" rx="11" ry="7" transform="rotate(-15 34 108)" fill="#FFF7DF" stroke="#3B2314" stroke-width="3"/>
    <ellipse cx="106" cy="108" rx="11" ry="7" transform="rotate(15 106 108)" fill="#FFF7DF" stroke="#3B2314" stroke-width="3"/>
    ${drawHead(70, 76, 50, 32, "squishClip")}
    ${drawNormalFace(70, 77)}
  `),

  // 12. SNACK (Eating kakino-tane / drinking coffee or beer on break)
  'snack.svg': wrapSvg(`
    <!-- Sitting feet forward -->
    <ellipse cx="48" cy="123" rx="10" ry="7" fill="#FFF7DF" stroke="#3B2314" stroke-width="3"/>
    <ellipse cx="92" cy="123" rx="10" ry="7" fill="#FFF7DF" stroke="#3B2314" stroke-width="3"/>
    <!-- Body sitting -->
    <ellipse cx="70" cy="105" rx="30" ry="20" fill="#FFF7DF" stroke="#3B2314" stroke-width="3"/>
    ${drawHead(70, 66)}
    <!-- Happy chewing face -->
    <ellipse cx="45" cy="75" rx="8" ry="5" fill="#FF8E8E" opacity="0.85"/>
    <ellipse cx="95" cy="75" rx="8" ry="5" fill="#FF8E8E" opacity="0.85"/>
    <path d="M 51 67 Q 56 62 61 67" fill="none" stroke="#3B2314" stroke-width="3" stroke-linecap="round"/>
    <path d="M 79 67 Q 84 62 89 67" fill="none" stroke="#3B2314" stroke-width="3" stroke-linecap="round"/>
    <!-- Chewing mouth -->
    <path d="M 65 76 Q 70 81 75 76" fill="none" stroke="#3B2314" stroke-width="2.5" stroke-linecap="round"/>
    <!-- Left Arm holding Drink Can -->
    <ellipse cx="43" cy="99" rx="8" ry="11" transform="rotate(25 43 99)" fill="#FFF7DF" stroke="#3B2314" stroke-width="3"/>
    <rect x="26" y="88" width="16" height="24" rx="3" fill="#F4C430" stroke="#3B2314" stroke-width="2.5"/>
    <rect x="26" y="88" width="16" height="6" rx="1" fill="#FFF" stroke="#3B2314" stroke-width="2"/>
    <!-- Right Arm + Snack Pouch -->
    <rect x="76" y="94" width="22" height="24" rx="3" fill="#E85D3F" stroke="#3B2314" stroke-width="2.5"/>
    <circle cx="87" cy="106" r="5" fill="#FFE599"/>
    <ellipse cx="97" cy="100" rx="8" ry="11" transform="rotate(-30 97 100)" fill="#FFF7DF" stroke="#3B2314" stroke-width="3"/>
    <!-- Music note -->
    <text x="108" y="42" font-size="18" font-weight="bold" fill="#FF7B54">♪</text>
  `),

  // 13. BAG (Rummaging through green furoshiki bundle on right click)
  'bag.svg': wrapSvg(`
    <!-- Feet -->
    <ellipse cx="54" cy="124" rx="9" ry="6" fill="#FFF7DF" stroke="#3B2314" stroke-width="3"/>
    <ellipse cx="86" cy="124" rx="9" ry="6" fill="#FFF7DF" stroke="#3B2314" stroke-width="3"/>
    <!-- Body -->
    <ellipse cx="70" cy="102" rx="28" ry="22" fill="#FFF7DF" stroke="#3B2314" stroke-width="3"/>
    ${drawHead(70, 62)}
    <!-- Looking down into the bag face -->
    <ellipse cx="46" cy="73" rx="7.5" ry="4.5" fill="#FF9E9E" opacity="0.75"/>
    <ellipse cx="94" cy="73" rx="7.5" ry="4.5" fill="#FF9E9E" opacity="0.75"/>
    <circle cx="56" cy="69" r="4" fill="#2B1810"/>
    <circle cx="84" cy="69" r="4" fill="#2B1810"/>
    <path d="M 65 76 Q 70 79 75 76" fill="none" stroke="#3B2314" stroke-width="2.3" stroke-linecap="round"/>
    <!-- Green Furoshiki Bag in front -->
    <ellipse cx="70" cy="112" rx="28" ry="18" fill="#3B9E66" stroke="#3B2314" stroke-width="3"/>
    <!-- Knot at top of bag -->
    <path d="M 58 95 Q 70 102 82 95 Q 76 89 70 94 Q 64 89 58 95 Z" fill="#4BB578" stroke="#3B2314" stroke-width="2.5"/>
    <!-- White swirl dots on bag -->
    <circle cx="56" cy="112" r="3" fill="#FFF" opacity="0.85"/>
    <circle cx="72" cy="118" r="3" fill="#FFF" opacity="0.85"/>
    <circle cx="84" cy="110" r="3" fill="#FFF" opacity="0.85"/>
    <!-- Hands rummaging -->
    <ellipse cx="48" cy="102" rx="8" ry="11" transform="rotate(-30 48 102)" fill="#FFF7DF" stroke="#3B2314" stroke-width="3"/>
    <ellipse cx="92" cy="102" rx="8" ry="11" transform="rotate(30 92 102)" fill="#FFF7DF" stroke="#3B2314" stroke-width="3"/>
    <!-- Rummage effect lines (부스럭) -->
    <path d="M 32 94 L 24 90 M 30 104 L 21 104 M 108 94 L 116 90 M 110 104 L 119 104" stroke="#F59E0B" stroke-width="2.8" stroke-linecap="round"/>
  `),

  // 14. HAA (Kurimanju signature "ハーッ!!" / "하아ー!!" face)
  'haa.svg': wrapSvg(`
    <!-- Sparkle aura -->
    <path d="M 20 35 L 28 35 M 24 31 L 24 39" stroke="#FFB800" stroke-width="3" stroke-linecap="round"/>
    <path d="M 114 30 L 122 30 M 118 26 L 118 34" stroke="#FFB800" stroke-width="3" stroke-linecap="round"/>
    <!-- Feet -->
    <ellipse cx="55" cy="123" rx="9" ry="6" fill="#FFF7DF" stroke="#3B2314" stroke-width="3"/>
    <ellipse cx="85" cy="123" rx="9" ry="6" fill="#FFF7DF" stroke="#3B2314" stroke-width="3"/>
    <!-- Body -->
    <ellipse cx="70" cy="103" rx="29" ry="22" fill="#FFF7DF" stroke="#3B2314" stroke-width="3"/>
    ${drawHead(70, 65)}
    <!-- Deeply satisfied crinkled "HAA~" face (미간 주름 팍!) -->
    <ellipse cx="44" cy="74" rx="9" ry="5" fill="#FF7373" opacity="0.85"/>
    <ellipse cx="96" cy="74" rx="9" ry="5" fill="#FF7373" opacity="0.85"/>
    <!-- Tightly closed eyes -->
    <path d="M 48 64 L 61 68 L 49 71" fill="none" stroke="#3B2314" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M 92 64 L 79 68 L 91 71" fill="none" stroke="#3B2314" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
    <!-- Signature Kurimanju nose/brow wrinkles -->
    <path d="M 65 56 L 67 65 M 70 55 L 70 65 M 75 56 L 73 65" stroke="#3B2314" stroke-width="2.2" stroke-linecap="round"/>
    <!-- Wide open "HAA!" mouth -->
    <path d="M 59 75 Q 70 71 81 75 Q 84 86 70 86 Q 56 86 59 75 Z" fill="#E05A5A" stroke="#3B2314" stroke-width="2.5"/>
    <ellipse cx="70" cy="82" rx="6" ry="3" fill="#FF9E9E"/>
    <!-- Left arm holding mug/cup -->
    <ellipse cx="38" cy="94" rx="8" ry="12" transform="rotate(40 38 94)" fill="#FFF7DF" stroke="#3B2314" stroke-width="3"/>
    <rect x="16" y="76" width="18" height="22" rx="3" fill="#FFE066" stroke="#3B2314" stroke-width="2.5"/>
    <path d="M 16 76 Q 25 70 34 76 Z" fill="#FFFFFF" stroke="#3B2314" stroke-width="2"/>
    <ellipse cx="102" cy="96" rx="8" ry="12" transform="rotate(-35 102 96)" fill="#FFF7DF" stroke="#3B2314" stroke-width="3"/>
  `),

  // 15. SLEEP (Paused / Resting)
  'sleep.svg': wrapSvg(`
    <!-- Lying down / sitting sleepy -->
    <ellipse cx="52" cy="124" rx="10" ry="6" fill="#FFF7DF" stroke="#3B2314" stroke-width="3"/>
    <ellipse cx="88" cy="124" rx="10" ry="6" fill="#FFF7DF" stroke="#3B2314" stroke-width="3"/>
    <ellipse cx="70" cy="107" rx="31" ry="19" fill="#FFF7DF" stroke="#3B2314" stroke-width="3"/>
    <ellipse cx="42" cy="108" rx="8" ry="11" transform="rotate(25 42 108)" fill="#FFF7DF" stroke="#3B2314" stroke-width="3"/>
    <ellipse cx="98" cy="108" rx="8" ry="11" transform="rotate(-25 98 108)" fill="#FFF7DF" stroke="#3B2314" stroke-width="3"/>
    ${drawHead(70, 72)}
    <ellipse cx="46" cy="81" rx="7.5" ry="4.5" fill="#FF9E9E" opacity="0.75"/>
    <ellipse cx="94" cy="81" rx="7.5" ry="4.5" fill="#FF9E9E" opacity="0.75"/>
    <!-- Sleeping closed eyes -->
    <path d="M 50 74 Q 56 79 62 74" fill="none" stroke="#3B2314" stroke-width="2.8" stroke-linecap="round"/>
    <path d="M 78 74 Q 84 79 90 74" fill="none" stroke="#3B2314" stroke-width="2.8" stroke-linecap="round"/>
    <circle cx="70" cy="83" r="3.2" fill="#E05A5A" stroke="#3B2314" stroke-width="2"/>
    <!-- Zzz -->
    <text x="104" y="46" font-family="sans-serif" font-size="16" font-weight="bold" fill="#6366F1">Z</text>
    <text x="116" y="34" font-family="sans-serif" font-size="13" font-weight="bold" fill="#818CF8">z</text>
  `)
};

for (const [filename, svgContent] of Object.entries(sprites)) {
  fs.writeFileSync(path.join(spritesDir, filename), svgContent.trim(), 'utf8');
}

console.log('Generated', Object.keys(sprites).length, 'Kurimanju sprites in', spritesDir);

