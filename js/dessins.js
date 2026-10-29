// dessins.js
// Tous les dessins de l'appli en SVG inline : objets de la table, mannequin,
// mascotte, illustrations animées (animations dans style.css), fonds des boutons.

(function () {
  const INK = '#2E3A46';
  const PEAU = '#F1C49B';
  const BOIS = '#DDA868';

  const GOUTTE = 'M0 -12 Q9 0 9 5 A9 9 0 0 1 -9 5 Q-9 0 0 -12 Z';
  const GANT = 'M30 92 V62 Q24 58 20 52 L14 42 Q11 36 16 34 Q21 32 25 38 L31 47 V20 Q31 13 37.5 13 Q44 13 44 20 V40 V14 Q44 7 50 7 Q56 7 56 14 V40 V18 Q56 11 62 11 Q68 11 68 18 V42 V28 Q68 22 73 22 Q78 22 78 28 V60 Q78 68 72 72 V92 Z';

  function crane(x, y, s, fond, trous, contour) {
    return `<g transform="translate(${x} ${y}) scale(${s})">
      <path d="M-15 2 Q-16 -19 0 -19 Q16 -19 15 2 Q15 9 9 11 V17 H-9 V11 Q-15 9 -15 2 Z" fill="${fond}"${contour ? ` stroke="${contour}" stroke-width="2.5" paint-order="stroke"` : ''}/>
      <circle cx="-6.5" cy="-2" r="4.6" fill="${trous}"/><circle cx="6.5" cy="-2" r="4.6" fill="${trous}"/>
      <path d="M0 4 L-2.6 8.5 H2.6 Z" fill="${trous}"/>
      <path d="M-4.5 12 V17 M0 12 V17 M4.5 12 V17" stroke="${trous}" stroke-width="1.6"/>
    </g>`;
  }

  // ===== Objets de la table (viewBox 100×100) =====
  const OBJETS = {
    blouse: `
      <path d="M36 12 L50 20 L64 12 L80 18 Q86 20 88 28 L96 60 L82 65 L75 42 V90 Q75 92 73 92 H27 Q25 92 25 90 V42 L18 65 L4 60 L12 28 Q14 20 20 18 Z" fill="#fff" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>
      <path d="M40 14 L50 34 L60 14 Z" fill="#9CC8F0"/>
      <path d="M36 12 L50 40 L64 12" fill="none" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>
      <path d="M50 40 V92" stroke="${INK}" stroke-width="2.5"/>
      <circle cx="56" cy="52" r="2.4" fill="${INK}"/><circle cx="56" cy="66" r="2.4" fill="${INK}"/><circle cx="56" cy="80" r="2.4" fill="${INK}"/>
      <path d="M30 62 H42 V72 H30 Z" fill="none" stroke="${INK}" stroke-width="2.5" stroke-linejoin="round"/>`,

    lunettes: `
      <rect x="2" y="44" width="12" height="12" rx="3" fill="${INK}"/><rect x="86" y="44" width="12" height="12" rx="3" fill="${INK}"/>
      <path d="M20 30 H80 Q90 30 90 40 V60 Q90 70 80 70 H62 Q56 70 53 64 Q50 60 47 64 Q44 70 38 70 H20 Q10 70 10 60 V40 Q10 30 20 30 Z" fill="#3FB37F" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>
      <path d="M22 37 H78 Q83 37 83 42 V56 Q83 62 77 62 H63 Q58 62 55 57 Q50 52 45 57 Q42 62 37 62 H23 Q17 62 17 56 V42 Q17 37 22 37 Z" fill="#BFE6F8"/>
      <path d="M24 43 H34 M24 49 H29" stroke="#fff" stroke-width="3" stroke-linecap="round"/>`,

    gants: `
      <g transform="translate(14 2)"><path d="${GANT}" fill="#6C5CE7" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/></g>
      <g transform="translate(-6 6)"><path d="${GANT}" fill="#9C8CF5" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>
        <path d="M30 80 H72" stroke="${INK}" stroke-width="2.5"/></g>`,

    masque: `
      <path d="M22 38 Q8 36 8 50 Q8 64 24 64" fill="none" stroke="${INK}" stroke-width="3"/>
      <path d="M78 38 Q92 36 92 50 Q92 64 76 64" fill="none" stroke="${INK}" stroke-width="3"/>
      <path d="M22 32 Q50 24 78 32 L80 64 Q50 82 20 64 Z" fill="#A8D8F5" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>
      <path d="M23 44 Q50 38 77 44 M23 53 Q50 49 77 53 M24 62 Q50 62 76 62" fill="none" stroke="#6AA9CF" stroke-width="2.5"/>`,

    charlotte: `
      <path d="M12 60 Q10 22 50 20 Q90 22 88 60 Z" fill="#DDEBFA" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>
      <path d="M30 30 Q34 40 30 54 M50 24 V54 M70 30 Q66 40 70 54" fill="none" stroke="#A9C4E4" stroke-width="2.5"/>
      <path d="M10 60 Q14 70 18 60 Q22 70 26 60 Q30 70 34 60 Q38 70 42 60 Q46 70 50 60 Q54 70 58 60 Q62 70 66 60 Q70 70 74 60 Q78 70 82 60 Q86 70 90 60" fill="#DDEBFA" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>`,

    bottes: `
      <g transform="translate(10 -4) scale(.92)"><path d="M24 14 H50 V60 Q56 66 72 68 Q86 70 86 82 V86 H22 V18 Q22 14 24 14 Z" fill="#E0AC12" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>
        <rect x="20" y="84" width="68" height="7" rx="3" fill="${INK}"/></g>
      <g transform="translate(-6 4)"><path d="M24 14 H50 V60 Q56 66 72 68 Q86 70 86 82 V86 H22 V18 Q22 14 24 14 Z" fill="#FFD43B" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>
        <rect x="21" y="12" width="32" height="8" rx="2" fill="#E0AC12" stroke="${INK}" stroke-width="2.5"/>
        <rect x="20" y="84" width="68" height="7" rx="3" fill="${INK}"/></g>`,

    casque: `
      <path d="M30 66 Q34 86 50 86 Q66 86 70 66" fill="none" stroke="${INK}" stroke-width="3"/>
      <rect x="45" y="82" width="10" height="7" rx="2" fill="${INK}"/>
      <path d="M10 66 Q10 22 54 20 Q90 20 92 58 Q92 66 84 66 Z" fill="#E5484D" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>
      <path d="M30 38 Q38 30 46 40 M56 28 Q64 28 66 40 M76 34 Q82 40 82 50" stroke="${INK}" stroke-width="5" stroke-linecap="round" fill="none"/>
      <path d="M10 66 L3 66 Q3 58 12 56" fill="#E5484D" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>
      <path d="M13 62 H86" stroke="#fff" stroke-width="3"/>`,

    coudiere: `
      <rect x="12" y="30" width="76" height="12" rx="4" fill="${INK}"/>
      <rect x="12" y="60" width="76" height="12" rx="4" fill="${INK}"/>
      <path d="M28 22 Q50 10 72 22 Q82 50 72 80 Q50 92 28 80 Q18 50 28 22 Z" fill="#4A5563" stroke="${INK}" stroke-width="3"/>
      <ellipse cx="50" cy="51" rx="16" ry="20" fill="#7A8796"/>
      <path d="M44 40 Q48 36 54 38" stroke="#fff" stroke-opacity=".5" stroke-width="3" fill="none" stroke-linecap="round"/>`,

    gantBoxe: `
      <path d="M30 74 Q16 66 16 46 Q16 22 44 18 Q76 14 82 40 Q88 64 70 74 Z" fill="#E5484D" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>
      <path d="M30 62 Q17 60 19 47 Q23 38 34 44" fill="#D63A3F" stroke="${INK}" stroke-width="2.5"/>
      <rect x="28" y="72" width="44" height="20" rx="4" fill="#fff" stroke="${INK}" stroke-width="3"/>
      <path d="M36 76 L64 88 M64 76 L36 88" stroke="#E5484D" stroke-width="2.5"/>
      <path d="M40 28 Q56 24 68 34" stroke="#fff" stroke-opacity=".5" stroke-width="4" fill="none" stroke-linecap="round"/>`,

    stethoscope: `
      <path d="M30 16 V40 Q30 62 50 62 Q70 62 70 40 V16" fill="none" stroke="#7A8796" stroke-width="5" stroke-linecap="round"/>
      <circle cx="30" cy="13" r="4.5" fill="${INK}"/><circle cx="70" cy="13" r="4.5" fill="${INK}"/>
      <path d="M50 62 V72 Q50 86 63 84" fill="none" stroke="#7A8796" stroke-width="5" stroke-linecap="round"/>
      <circle cx="72" cy="82" r="10" fill="#C9D2DB" stroke="${INK}" stroke-width="3"/><circle cx="72" cy="82" r="4.5" fill="#7A8796"/>`,

    couteau: `
      <path d="M46 54 L80 16 Q90 12 90 22 Q88 34 58 66 Z" fill="#D9E1E8" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>
      <path d="M51 57 L84 21" stroke="#fff" stroke-width="2.5"/>
      <path d="M46 54 L58 66 L30 92 Q24 97 19 92 L16 89 Q11 84 17 79 Z" fill="#8B5A2B" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>
      <circle cx="31" cy="79" r="2.2" fill="#E8C9A0"/><circle cx="24" cy="86" r="2.2" fill="#E8C9A0"/>`,

    lunettesSoleil: `
      <path d="M10 42 L3 34 M90 42 L97 34" stroke="${INK}" stroke-width="3.5" stroke-linecap="round"/>
      <path d="M43 46 Q50 39 57 46" fill="none" stroke="#C9922A" stroke-width="4"/>
      <rect x="8" y="38" width="36" height="28" rx="13" fill="#3B3350" stroke="#C9922A" stroke-width="3.5"/>
      <rect x="56" y="38" width="36" height="28" rx="13" fill="#3B3350" stroke="#C9922A" stroke-width="3.5"/>
      <path d="M16 47 L25 44 M64 47 L73 44" stroke="#fff" stroke-opacity=".55" stroke-width="3" stroke-linecap="round"/>`,

    parapluie: `
      <rect x="47.5" y="6" width="5" height="8" rx="2" fill="${INK}"/>
      <path d="M50 52 V84 Q50 92 42 92 Q35 92 35 85" fill="none" stroke="${INK}" stroke-width="4.5" stroke-linecap="round"/>
      <path d="M8 52 Q10 14 50 12 Q90 14 92 52 Q85 45 78 52 Q71 45 64 52 Q57 45 50 52 Q43 45 36 52 Q29 45 22 52 Q15 45 8 52 Z" fill="#8E5CF0" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>
      <path d="M50 12 Q34 28 36 50 M50 12 Q66 28 64 50 M50 12 V50" fill="none" stroke="${INK}" stroke-width="2"/>`,

    echarpe: `
      <path d="M22 28 Q50 42 78 28 Q86 36 78 46 Q50 60 22 46 Q14 36 22 28 Z" fill="#E5484D" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>
      <path d="M56 50 L66 86 L50 90 L44 54 Z" fill="#E5484D" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>
      <path d="M48 64 L60 61 M50 74 L63 71" stroke="#fff" stroke-width="3.5"/>
      <path d="M52 90 L50 96 M57 89 L56 95 M62 88 L62 94" stroke="${INK}" stroke-width="2.2" stroke-linecap="round"/>
      <path d="M34 36 Q50 44 66 36" fill="none" stroke="#fff" stroke-width="3.5" stroke-opacity=".8"/>`
  };

  function objet(id) {
    return `<svg viewBox="0 0 100 100" class="ico-objet" aria-hidden="true">${OBJETS[id]}</svg>`;
  }

  // ===== Mannequin en bois (viewBox 300×380) =====
  // porte : objets déjà enfilés ; nouveau : objet qui vient d'être enfilé (animation)
  function mannequin(porte, nouveau) {
    const c = (o) => `couche couche-${o}${porte.includes(o) ? ' visible' : ''}${nouveau === o ? ' pop' : ''}`;
    const manche = (d) => `<path d="${d}" stroke="${INK}" stroke-width="37" fill="none"/><path d="${d}" stroke="#fff" stroke-width="31" fill="none"/>`;
    const gant = `<path d="${GANT}" fill="#9C8CF5" stroke="${INK}" stroke-width="6" stroke-linejoin="round"/>`;
    return `<svg viewBox="0 0 300 380" class="mannequin" aria-hidden="true">
      <ellipse cx="150" cy="362" rx="74" ry="12" fill="#8B5A2B"/>
      <rect x="143" y="250" width="14" height="112" fill="#A86F3D"/>
      <path d="M100 142 Q76 182 72 236" stroke="#C99055" stroke-width="26" fill="none"/>
      <path d="M200 142 Q224 182 228 236" stroke="#C99055" stroke-width="26" fill="none"/>
      <ellipse cx="72" cy="236" rx="13" ry="5" fill="#A86F3D" transform="rotate(-4 72 236)"/>
      <ellipse cx="228" cy="236" rx="13" ry="5" fill="#A86F3D" transform="rotate(4 228 236)"/>
      <path d="M102 126 Q150 112 198 126 Q214 132 212 150 L200 248 Q150 266 100 248 L88 150 Q86 132 102 126 Z" fill="${BOIS}" stroke="#B07A41" stroke-width="3"/>
      <path d="M120 160 Q130 200 122 240 M178 150 Q170 190 180 236" stroke="#C99055" stroke-width="2" fill="none"/>
      <g class="${c('blouse')}">
        ${manche('M100 142 Q76 182 72.5 222')}
        ${manche('M200 142 Q224 182 227.5 222')}
        <path d="M98 122 Q150 106 202 122 Q218 130 216 150 L214 302 Q150 310 86 302 L84 150 Q82 130 98 122 Z" fill="#fff" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>
        <path d="M130 116 L150 160 L170 116 Z" fill="${BOIS}"/>
        <path d="M126 117 L150 162 L174 117" fill="none" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>
        <path d="M150 162 V305" stroke="${INK}" stroke-width="2.5"/>
        <circle cx="158" cy="184" r="3" fill="${INK}"/><circle cx="158" cy="216" r="3" fill="${INK}"/><circle cx="158" cy="248" r="3" fill="${INK}"/><circle cx="158" cy="280" r="3" fill="${INK}"/>
        <path d="M104 236 H130 V258 H104 Z M170 236 H196 V258 H170 Z" fill="none" stroke="${INK}" stroke-width="2.5" stroke-linejoin="round"/>
        <rect x="178" y="226" width="4" height="16" rx="2" fill="#3F7FE0"/>
      </g>
      <rect x="138" y="96" width="24" height="34" rx="6" fill="#D19A5B"/>
      <ellipse cx="150" cy="62" rx="36" ry="44" fill="${BOIS}" stroke="#B07A41" stroke-width="3"/>
      <path d="M134 32 Q127 62 135 92 M166 30 Q172 56 166 84" stroke="#C99055" stroke-width="2" fill="none"/>
      <g class="${c('lunettes')}">
        <rect x="106" y="54" width="6" height="14" rx="2" fill="${INK}"/><rect x="188" y="54" width="6" height="14" rx="2" fill="${INK}"/>
        <path d="M122 44 H178 Q190 44 190 56 V68 Q190 80 178 80 H164 Q158 80 155 74 Q150 68 145 74 Q142 80 136 80 H122 Q110 80 110 68 V56 Q110 44 122 44 Z" fill="#3FB37F" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>
        <path d="M124 50 H176 Q183 50 183 57 V67 Q183 73 176 73 H165 Q160 73 157 68 Q150 61 143 68 Q140 73 135 73 H124 Q117 73 117 67 V57 Q117 50 124 50 Z" fill="#BFE6F8"/>
        <path d="M124 55 H134" stroke="#fff" stroke-width="3" stroke-linecap="round"/>
      </g>
      <g class="${c('gants')}">
        <g transform="translate(72 226) rotate(180) scale(.46) translate(-51 -88)">${gant}</g>
        <g transform="translate(228 226) scale(-1 1) rotate(180) scale(.46) translate(-51 -88)">${gant}</g>
      </g>
      <rect class="zone-lunettes" x="110" y="40" width="80" height="44" fill="none"/>
      <rect class="zone-blouse" x="90" y="120" width="120" height="170" fill="none"/>
      <rect class="zone-gants" x="50" y="216" width="200" height="56" fill="none"/>
    </svg>`;
  }

  // ===== Mascotte : un erlenmeyer qui parle =====
  function mascotte() {
    const corps = 'M40 11 V46 L14 100 Q9 112 22 112 H78 Q91 112 86 100 L60 46 V11';
    return `<svg viewBox="0 0 100 120" class="mascotte" aria-hidden="true">
      <path d="${corps}" fill="#EAF6FD"/>
      <path d="M27.5 72 H72.5 L86 100 Q91 112 78 112 H22 Q9 112 14 100 Z" fill="#45C49A"/>
      <path d="M27.5 72 Q38 68 50 72 T72.5 72" fill="none" stroke="#7FE0BE" stroke-width="2.5"/>
      <path d="${corps}" fill="none" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>
      <rect x="35" y="4" width="30" height="8" rx="4" fill="#DDEBF5" stroke="${INK}" stroke-width="3"/>
      <path d="M46 20 V38" stroke="#fff" stroke-width="3.5" stroke-linecap="round"/>
      <circle cx="30" cy="104" r="2.5" fill="#fff" opacity=".6"/><circle cx="70" cy="80" r="2" fill="#fff" opacity=".6"/>
      <g class="m-yeux">
        <ellipse cx="40" cy="85" rx="6.5" ry="7.5" fill="#fff" stroke="${INK}" stroke-width="2"/><circle cx="41" cy="86" r="3.4" fill="${INK}"/>
        <ellipse cx="60" cy="85" rx="6.5" ry="7.5" fill="#fff" stroke="${INK}" stroke-width="2"/><circle cx="61" cy="86" r="3.4" fill="${INK}"/>
      </g>
      <circle cx="30" cy="95" r="4" fill="#FF9AA2" opacity=".7"/><circle cx="70" cy="95" r="4" fill="#FF9AA2" opacity=".7"/>
      <ellipse class="m-bouche" cx="50" cy="99" rx="6" ry="2.4" fill="${INK}"/>
    </svg>`;
  }

  // ===== Illustrations animées (viewBox 200×140) =====
  const MAIN = `<g fill="${PEAU}">
      <rect x="76" y="48" width="13" height="46" rx="6.5"/>
      <rect x="90" y="42" width="13" height="52" rx="6.5"/>
      <rect x="104" y="46" width="13" height="48" rx="6.5"/>
      <rect x="118" y="56" width="12" height="40" rx="6"/>
      <rect x="68" y="86" width="13" height="36" rx="6.5" transform="rotate(-35 74.5 122)"/>
      <rect x="74" y="80" width="58" height="50" rx="18"/>
      <rect x="86" y="120" width="36" height="22"/>
    </g>`;

  const ROBINET = `<rect x="44" y="4" width="22" height="8" rx="3" fill="#6B7783"/><rect x="52" y="10" width="6" height="8" fill="#6B7783"/>
      <path d="M14 20 H96 Q108 20 108 32" fill="none" stroke="#8A96A3" stroke-width="12" stroke-linecap="round"/>
      <rect x="99" y="30" width="18" height="8" rx="2" fill="#6B7783"/>`;
  const JET = `<rect x="101" y="38" width="14" height="64" rx="6" fill="#7EC8F5" opacity=".85"/>
        <path class="r-flux" d="M105 40 V98 M111 44 V98" stroke="#fff" stroke-width="2" stroke-dasharray="6 8"/>`;
  const GOUTTELETTES = '<circle cx="86" cy="98" r="3"/><circle cx="128" cy="96" r="3"/><circle cx="80" cy="106" r="2.5"/><circle cx="134" cy="106" r="2.5"/>';

  const ILLUS = {
    yeux: `
      <path d="M24 74 Q100 6 176 74 Q100 142 24 74 Z" fill="#fff" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/>
      <g class="y-rouge" stroke="#E5484D" stroke-width="2.5" fill="none" stroke-linecap="round">
        <path d="M36 74 Q50 68 60 74 Q66 70 70 72"/><path d="M42 86 Q54 82 64 88"/>
        <path d="M164 74 Q150 68 140 74 Q134 70 130 72"/><path d="M158 86 Q146 82 136 88"/></g>
      <circle cx="100" cy="74" r="28" fill="#5B8DEF" stroke="${INK}" stroke-width="3"/>
      <circle cx="100" cy="74" r="13" fill="${INK}"/><circle cx="91" cy="65" r="5" fill="#fff"/>
      <path d="M50 55 L42 44 M74 44 L70 30 M100 40 V26 M126 44 L130 30 M150 55 L158 44" stroke="${INK}" stroke-width="4" stroke-linecap="round"/>
      <g transform="translate(112 62)">
        <path class="y-goutte" d="${GOUTTE}" fill="#7CD67C" stroke="${INK}" stroke-width="2"/>
        <g class="y-splash" fill="#7CD67C"><circle cx="-14" cy="-8" r="4"/><circle cx="14" cy="-10" r="3.5"/><circle cx="-10" cy="10" r="3"/><circle cx="16" cy="8" r="4"/><circle cx="0" cy="0" r="7"/></g>
      </g>
      <g class="y-alerte"><path d="M172 6 L196 48 H148 Z" fill="#FFD43B" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>
        <rect x="169.5" y="18" width="5" height="17" rx="2.5" fill="${INK}"/><circle cx="172" cy="41" r="3" fill="${INK}"/></g>`,

    vetements: `
      <path d="M72 18 L50 26 L24 46 L38 68 L54 60 V130 H146 V60 L162 68 L176 46 L150 26 L128 18 Q100 38 72 18 Z" fill="#5B8DEF" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/>
      <path d="M74 20 Q100 38 126 20" fill="none" stroke="#3E6FD0" stroke-width="5"/>
      <g transform="translate(112 92)">
        <path class="v-tache" d="M-20 -4 Q-22 -16 -8 -16 Q0 -24 10 -16 Q24 -16 20 -2 Q26 10 12 14 Q2 22 -8 14 Q-24 14 -20 -4 Z" fill="#7A5A2A" opacity=".85"/>
        <path class="v-trou" d="M-11 -2 L-7 -9 L-1 -6 L4 -11 L8 -4 L13 -2 L9 4 L11 10 L3 8 L-2 12 L-6 6 L-12 5 Z" fill="#fff" stroke="#3B2A12" stroke-width="2" stroke-linejoin="round"/>
        <path class="v-goutte" d="${GOUTTE}" fill="#B07A2A" stroke="${INK}" stroke-width="2"/>
      </g>`,

    brulure: `
      <g><circle cx="30" cy="30" r="20" fill="#fff" stroke="${INK}" stroke-width="3"/>
        <path d="M30 13 V17 M47 30 H43 M30 47 V43 M13 30 H17" stroke="${INK}" stroke-width="2.5"/>
        <path class="aiguille" d="M30 30 V15" stroke="#E5484D" stroke-width="3" stroke-linecap="round"/>
        <circle cx="30" cy="30" r="2.5" fill="${INK}"/></g>
      <path d="M56 22 L66 30 L56 38 Z M66 22 L76 30 L66 38 Z" fill="#E5484D"/>
      ${MAIN}
      <g transform="translate(103 104)">
        <circle class="b-rouge" r="14" fill="#F28B82"/>
        <circle class="b-brule" r="8" fill="#C5221F"/>
        <g class="b-fumee" fill="none" stroke="#9AA5B1" stroke-width="3" stroke-linecap="round">
          <path d="M-8 -14 Q-14 -22 -8 -30 Q-2 -38 -8 -46"/><path d="M6 -14 Q0 -22 6 -30 Q12 -38 6 -46"/></g>
        <path class="b-goutte" d="${GOUTTE}" fill="#7CD67C" stroke="${INK}" stroke-width="2"/>
      </g>`,

    rincer: `
      ${ROBINET}
      ${MAIN}
      <g transform="translate(103 104)"><circle class="r-tache" r="13" fill="#E5484D"/></g>
      <g class="r-eau">${JET}</g>
      <g class="r-gouttelettes" fill="#7EC8F5">${GOUTTELETTES}</g>
      <g transform="translate(103 104)"><path class="r-goutte" d="${GOUTTE}" fill="#7CD67C" stroke="${INK}" stroke-width="2"/></g>`,

    // Questionnaire : la main sous le robinet qui coule
    robinet: `${ROBINET}${MAIN}${JET}<g fill="#7EC8F5">${GOUTTELETTES}</g>`,

    // Questionnaire : un bécher de liquide transparent posé sur la table
    becher: `
      <rect x="10" y="110" width="180" height="11" rx="3" fill="#C98E55"/>
      <rect x="24" y="121" width="9" height="19" fill="#8A5A2E"/><rect x="167" y="121" width="9" height="19" fill="#8A5A2E"/>
      <path d="M75.5 64 H124.5 L122 108 H78 Z" fill="#DDF1FB" opacity=".75"/>
      <path d="M76 64 H124" stroke="#9CCFE8" stroke-width="2.5"/>
      <path d="M74 38 L78 110 H122 L126 38" fill="rgba(220,240,255,.25)" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>
      <path d="M70 38 H130" stroke="${INK}" stroke-width="3.5" stroke-linecap="round"/>
      <path d="M113 54 H121 M114 70 H121 M115 86 H121" stroke="#7F8C99" stroke-width="2"/>
      <path d="M85 50 V98" stroke="#fff" stroke-width="3" stroke-linecap="round" opacity=".9"/>
      <circle cx="160" cy="38" r="20" fill="#FFD43B" stroke="${INK}" stroke-width="3"/>
      <text x="160" y="47" text-anchor="middle" font-family="Fredoka, Nunito, sans-serif" font-weight="700" font-size="26" fill="${INK}">?</text>`
  };

  function illu(nom) {
    return `<svg viewBox="0 0 200 140" class="illu illu-${nom}" aria-hidden="true">${ILLUS[nom]}</svg>`;
  }

  // ===== Les 3 interdits (viewBox 160×160) =====
  const INTERDITS = {
    tremper: `
      <g class="i-doigt" fill="${PEAU}"><rect x="60" y="20" width="42" height="36" rx="12"/><rect x="74" y="48" width="14" height="60" rx="7"/></g>
      <path d="M43 98 H117 L114 148 H46 Z" fill="#7CD67C" opacity=".88"/>
      <path d="M42 62 L46 150 H114 L118 62" fill="rgba(200,230,255,.25)" stroke="${INK}" stroke-width="3.5" stroke-linejoin="round"/>
      <path d="M36 62 H124" stroke="${INK}" stroke-width="4" stroke-linecap="round"/>`,

    gouter: `
      <circle cx="66" cy="78" r="46" fill="${PEAU}"/>
      <circle cx="50" cy="66" r="5" fill="${INK}"/><circle cx="80" cy="66" r="5" fill="${INK}"/>
      <ellipse cx="68" cy="100" rx="11" ry="9" fill="#8E2B2B"/><ellipse cx="68" cy="105" rx="7" ry="4" fill="#E26D6D"/>
      <g class="i-cuillere">
        <path d="M150 58 L96 96" stroke="#8A96A3" stroke-width="6" stroke-linecap="round"/>
        <ellipse cx="88" cy="101" rx="13" ry="8" fill="#AEB8C2" stroke="${INK}" stroke-width="2.5" transform="rotate(-33 88 101)"/>
        <ellipse cx="88" cy="100" rx="8" ry="4.5" fill="#7CD67C" transform="rotate(-33 88 100)"/>
      </g>`,

    sentir: `
      <circle cx="80" cy="54" r="42" fill="${PEAU}"/>
      <circle cx="64" cy="44" r="5" fill="${INK}"/><circle cx="96" cy="44" r="5" fill="${INK}"/>
      <path d="M80 46 Q72 64 78 68 Q82 70 88 66" fill="none" stroke="#C99467" stroke-width="3.5" stroke-linecap="round"/>
      <path d="M68 80 Q80 86 92 80" stroke="${INK}" stroke-width="3" fill="none" stroke-linecap="round"/>
      <path d="M58 128 H102 L100 152 H60 Z" fill="#B48CF0"/>
      <path d="M56 108 L60 154 H100 L104 108" fill="rgba(200,230,255,.3)" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>
      <path d="M52 108 H108" stroke="${INK}" stroke-width="3.5" stroke-linecap="round"/>
      <g class="i-vapeur" fill="none" stroke="#9B6FE8" stroke-width="3.5" stroke-linecap="round" stroke-dasharray="7 6">
        <path d="M70 106 Q64 98 70 90 Q76 82 72 72"/><path d="M88 106 Q82 98 88 90 Q94 82 90 72"/></g>`
  };

  function interdit(nom) {
    const croix = `<g class="x-interdit">
        <path d="M28 28 L132 132 M132 28 L28 132" stroke="#fff" stroke-width="17" stroke-linecap="round"/>
        <path d="M28 28 L132 132 M132 28 L28 132" stroke="#E5484D" stroke-width="11" stroke-linecap="round"/>
        ${crane(80, 80, 1.1, '#111', '#fff', '#fff')}</g>`;
    return `<svg viewBox="0 0 160 160" class="dessin-interdit" aria-hidden="true">${INTERDITS[nom]}${croix}</svg>`;
  }

  // ===== Personnages du questionnaire (viewBox 120×160) =====
  // lunettes : null | 'tete' | 'yeux' ; blouse : 'fermee' | 'ouverte'
  // regard : décalage des pupilles ; poches : mains dans les poches ; panique : il hurle
  function personne({ lunettes = null, blouse = 'fermee', regard = 0, poches = false, panique = false, cheveux = '#4A3222' } = {}) {
    const torse = 'M18 160 V118 Q18 98 42 94 H78 Q102 98 102 118 V160 Z';
    const manche = (d) => `<path d="${d}" stroke="${INK}" stroke-width="18" fill="none" stroke-linecap="round"/><path d="${d}" stroke="#E9EFF5" stroke-width="13" fill="none" stroke-linecap="round"/>`;
    const main = (x, r) => `<g transform="translate(${x} 64) rotate(${r})"><rect x="-8" y="-13" width="16" height="24" rx="8" fill="${PEAU}" stroke="#C99467" stroke-width="2"/>
      <path d="M-3 -12 V-2 M3 -12 V-2" stroke="#C99467" stroke-width="1.6" stroke-linecap="round"/></g>`;
    const poche = (x) => `<rect x="${x}" y="130" width="20" height="18" rx="2" fill="#fff" stroke="${INK}" stroke-width="2.5"/>`;
    const masque = (y) => `<rect x="26" y="${y + 5}" width="7" height="10" rx="2" fill="${INK}"/><rect x="87" y="${y + 5}" width="7" height="10" rx="2" fill="${INK}"/>
      <rect x="32" y="${y}" width="56" height="20" rx="8" fill="#3FB37F" stroke="${INK}" stroke-width="2.5"/>
      <rect x="37" y="${y + 4}" width="46" height="12" rx="5" fill="#BFE6F8" opacity=".6"/>`;
    let s = `<path d="${torse}" fill="#5B8DEF"/>`;
    if (blouse === 'fermee') {
      s += `<path d="${torse}" fill="#fff" stroke="${INK}" stroke-width="2.5" stroke-linejoin="round"/>
        <path d="M48 94 L60 120 L72 94 Z" fill="#5B8DEF"/>
        <path d="M46 94 L60 122 L74 94" fill="none" stroke="${INK}" stroke-width="2.5" stroke-linejoin="round"/>
        <path d="M60 122 V160" stroke="${INK}" stroke-width="2"/>
        <circle cx="65" cy="132" r="2" fill="${INK}"/><circle cx="65" cy="148" r="2" fill="${INK}"/>`;
    } else {
      s += `<path d="${torse}" fill="none" stroke="${INK}" stroke-width="2.5" stroke-linejoin="round"/>
        <path d="M18 160 V118 Q18 98 42 94 H50 L42 126 L44 160 Z" fill="#fff" stroke="${INK}" stroke-width="2.5" stroke-linejoin="round"/>
        <path d="M102 160 V118 Q102 98 78 94 H70 L78 126 L76 160 Z" fill="#fff" stroke="${INK}" stroke-width="2.5" stroke-linejoin="round"/>`;
    }
    if (poches) s += `${manche('M22 106 Q10 128 34 138')}${manche('M98 106 Q110 128 86 138')}${poche(26)}${poche(74)}`;
    if (panique) s += `${manche('M24 106 Q4 96 20 80')}${manche('M96 106 Q116 96 100 80')}`;
    s += `<rect x="52" y="74" width="16" height="24" rx="4" fill="#E2AF85"/>
      <circle cx="30" cy="54" r="6" fill="${PEAU}"/><circle cx="90" cy="54" r="6" fill="${PEAU}"/>
      <circle cx="60" cy="50" r="30" fill="${PEAU}"/>
      <path d="M30 50 Q28 16 60 16 Q92 16 90 50 Q86 32 60 30 Q34 32 30 50 Z" fill="${cheveux}"/>`;
    if (panique) {
      s += `<path d="M40 38 Q47 32 54 38 M66 38 Q73 32 80 38" fill="none" stroke="#4A3222" stroke-width="3" stroke-linecap="round"/>
        <circle cx="48" cy="50" r="7" fill="#fff" stroke="${INK}" stroke-width="2"/><circle cx="72" cy="50" r="7" fill="#fff" stroke="${INK}" stroke-width="2"/>
        <circle cx="48" cy="50" r="2.2" fill="${INK}"/><circle cx="72" cy="50" r="2.2" fill="${INK}"/>
        <ellipse cx="60" cy="69" rx="8" ry="10" fill="#7A1F1F"/>
        ${main(26, -12)}${main(94, 12)}
        <g transform="translate(96 26) scale(.6)"><path d="${GOUTTE}" fill="#7EC8F5" stroke="${INK}" stroke-width="2"/></g>
        <path d="M6 34 L15 40 M3 50 H13 M114 34 L105 40 M117 50 H107" stroke="#E5484D" stroke-width="3" stroke-linecap="round"/>`;
    } else {
      s += `<circle cx="${49 + regard}" cy="54" r="3.6" fill="${INK}"/><circle cx="${71 + regard}" cy="54" r="3.6" fill="${INK}"/>
        <path d="M51 69 Q60 76 69 69" fill="none" stroke="${INK}" stroke-width="2.5" stroke-linecap="round"/>`;
    }
    if (lunettes === 'yeux') s += masque(44);
    if (lunettes === 'tete') s += masque(18);
    return s;
  }

  function personnage(options) {
    return `<svg viewBox="0 0 120 160" class="personnage" aria-hidden="true">${personne(options)}</svg>`;
  }

  // Un élève bien protégé regarde un camarade aux lunettes sur la tête et à la blouse ouverte
  function camarades() {
    return `<svg viewBox="0 0 270 166" class="illu" aria-hidden="true">
      <g transform="translate(10 6)">${personne({ lunettes: 'yeux', regard: 3 })}</g>
      <g transform="translate(140 6)">${personne({ lunettes: 'tete', blouse: 'ouverte' })}</g>
    </svg>`;
  }

  // ===== Médaille (viewBox 100×124) =====
  // Motif central selon l'atelier gagné
  const MOTIFS_MEDAILLE = {
    securite: crane(50, 80, 1.15, '#4A3510', '#F5C542'),
    bleue: `<g transform="translate(50 80) scale(1.25)">
      <path d="M-14 10 L-5 -8 V-16 H5 V-8 L14 10 Q15 13 12 13 H-12 Q-15 13 -14 10 Z" fill="#FFF8E1" stroke="#4A3510" stroke-width="2.5" stroke-linejoin="round"/>
      <path d="M-10 2 H10 L14 10 Q15 13 12 13 H-12 Q-15 13 -14 10 Z" fill="#2557D6"/></g>`,
    tresor: `<g transform="translate(50 80)"><circle r="18" fill="#C8743A" stroke="#4A3510" stroke-width="3"/>
      <path d="M0 -10 L3 -3 L10 -3 L4 2 L6 9 L0 5 L-6 9 L-4 2 L-10 -3 L-3 -3 Z" fill="#F5C542"/></g>`,
    lumiere: `<g transform="translate(50 80) scale(1.2)">
      <path d="M-20 -6 L-14 -4 M20 -6 L14 -4 M0 -24 V-19 M-15 -18 L-11 -14 M15 -18 L11 -14" stroke="#fff" stroke-width="2.5" stroke-linecap="round"/>
      <path d="M-4 -14 V-6 Q-12 -3 -12 5 Q-12 14 0 14 Q12 14 12 5 Q12 -3 4 -6 V-14 Z" fill="#FFF8E1" stroke="#4A3510" stroke-width="2.5" stroke-linejoin="round"/>
      <path d="M-11 4 H11 Q11 13 0 13 Q-11 13 -11 4 Z" fill="#4FE3FF"/></g>`
  };

  function medaille(gagnee, motif = 'securite') {
    if (!gagnee) {
      return `<svg viewBox="0 0 100 124" class="medaille medaille--vide" aria-hidden="true">
        <path d="M30 4 H48 L60 50 H42 Z M70 4 H52 L40 50 H58 Z" fill="#D5DCE3"/>
        <circle cx="50" cy="80" r="35" fill="#E6EBF0" stroke="#BFC9D3" stroke-width="4" stroke-dasharray="8 6"/>
      </svg>`;
    }
    return `<svg viewBox="0 0 100 124" class="medaille" aria-hidden="true">
      <path d="M30 4 H48 L60 50 H42 Z" fill="#3F7FE0"/><path d="M70 4 H52 L40 50 H58 Z" fill="#E5484D"/>
      <circle cx="50" cy="80" r="36" fill="#F5C542" stroke="#C9922A" stroke-width="5"/>
      <circle cx="50" cy="80" r="27" fill="none" stroke="#FCE29A" stroke-width="3"/>
      ${MOTIFS_MEDAILLE[motif]}
      <path d="M26 68 Q32 54 46 50" stroke="#fff" stroke-opacity=".6" stroke-width="4" fill="none" stroke-linecap="round"/>
    </svg>`;
  }

  function cadenas() {
    return `<svg viewBox="0 0 60 70" aria-hidden="true">
      <path d="M16 30 V20 Q16 6 30 6 Q44 6 44 20 V30" fill="none" stroke="#5E6A75" stroke-width="7"/>
      <rect x="8" y="28" width="44" height="36" rx="8" fill="#7D8995" stroke="#4A5560" stroke-width="3"/>
      <circle cx="30" cy="43" r="5" fill="#3A444D"/><rect x="28" y="45" width="4" height="10" rx="2" fill="#3A444D"/>
    </svg>`;
  }

  function engrenage() {
    const n = 8, R = 11.5, r = 8.6;
    const pts = [];
    for (let i = 0; i < n; i++) {
      const a = (i * 2 * Math.PI) / n;
      [[-0.36, r], [-0.2, R], [0.2, R], [0.36, r]].forEach(([da, rr]) => {
        pts.push(`${(rr * Math.cos(a + da)).toFixed(2)} ${(rr * Math.sin(a + da)).toFixed(2)}`);
      });
    }
    return `<svg viewBox="-13 -13 26 26" class="engrenage" aria-hidden="true">
      <path fill-rule="evenodd" fill="#fff" d="M${pts.join(' L')} Z M3.8 0 A3.8 3.8 0 1 0 -3.8 0 A3.8 3.8 0 1 0 3.8 0 Z"/>
    </svg>`;
  }

  function hautParleur() {
    return `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9 H8 L13 5 V19 L8 15 H4 Z" fill="currentColor"/>
      <path d="M16 9 Q18 12 16 15 M18.5 6.5 Q22.5 12 18.5 17.5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>`;
  }

  function globe() {
    return `<svg viewBox="0 0 48 48" aria-hidden="true"><circle cx="24" cy="24" r="19" fill="#BFE6F8" stroke="currentColor" stroke-width="3"/>
      <path d="M5 24 H43 M24 5 Q12 24 24 43 M24 5 Q36 24 24 43 M9 14 Q24 19 39 14 M9 34 Q24 29 39 34" fill="none" stroke="currentColor" stroke-width="2.4"/></svg>`;
  }

  // Icônes des niveaux : bulle de dialogue avec un code
  function bulleNiveau(code, fond, aide) {
    return `<svg viewBox="0 0 60 60" aria-hidden="true">
      <path d="M8 8 H52 Q57 8 57 13 V37 Q57 42 52 42 H26 L14 53 V42 H8 Q3 42 3 37 V13 Q3 8 8 8 Z" fill="${fond}" stroke="${INK}" stroke-width="2.5" stroke-linejoin="round"/>
      <text x="30" y="31" text-anchor="middle" font-family="Fredoka, Nunito, sans-serif" font-weight="700" font-size="17" fill="#fff">${code}</text>
      ${aide ? `<circle cx="50" cy="12" r="10" fill="#FFD43B" stroke="${INK}" stroke-width="2.5"/><text x="50" y="17.5" text-anchor="middle" font-family="Fredoka, Nunito, sans-serif" font-weight="700" font-size="15" fill="${INK}">?</text>` : ''}
    </svg>`;
  }

  // ===== Fonds des boutons de la page « Mode de travail » =====

  // Sécurité : patchwork blanc cousu, pictogrammes de danger rouges
  function fondSecu() {
    const ROUGE = '#D7262E';
    const symboles = [
      `<path d="M0 -14 Q10 -3 6 6 Q11 3 10 -3 Q15 7 8 14 H-8 Q-14 6 -7 -4 Q-6 3 -2 4 Q-7 -6 0 -14 Z" fill="${ROUGE}"/>`,
      crane(0, -1, 0.72, ROUGE, '#fff'),
      `<rect x="-2.6" y="-14" width="5.2" height="18" rx="2.6" fill="${ROUGE}"/><circle cy="10" r="3.2" fill="${ROUGE}"/>`,
      `<path d="M-13 -13 H-4 L-6 -5 Z M4 -13 H13 L11 -5 Z" fill="${ROUGE}"/><circle cx="-7" cy="1" r="2.2" fill="${ROUGE}"/><circle cx="7" cy="1" r="2.2" fill="${ROUGE}"/><rect x="-14" y="8" width="28" height="5" rx="1" fill="${ROUGE}"/>`
    ];
    const tissus = ['#FFFFFF', '#FBF5F5', '#F5F8FB', '#FFF1F1', '#F8F7F1'];
    let s = '';
    for (let l = 0; l < 5; l++) {
      for (let c = 0; c < 22; c++) {
        const x = c * 60 - (l % 2 ? 30 : 0), y = l * 60;
        const rot = ((l + c) % 3 - 1) * 7;
        s += `<rect x="${x}" y="${y}" width="60" height="60" fill="${tissus[(l * 3 + c * 2) % 5]}"/>
          <rect x="${x + 3}" y="${y + 3}" width="54" height="54" fill="none" stroke="#E8C4C4" stroke-width="1.5" stroke-dasharray="4 3"/>
          <g transform="translate(${x + 30} ${y + 30}) rotate(${rot})">
            <rect x="-15" y="-15" width="30" height="30" rx="2" transform="rotate(45)" fill="#fff" stroke="${ROUGE}" stroke-width="3.2"/>
            <g transform="scale(.6)">${symboles[(l + c) % 4]}</g></g>`;
      }
    }
    return `<svg viewBox="0 0 1200 240" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><g opacity=".7">${s}</g></svg>`;
  }

  // Bouteille bleue : liquide bleu à mi-hauteur, vagues et bulles (animations CSS)
  function fondBleue() {
    const vague = 'M0 10 Q25 0 50 10 T100 10 T150 10 T200 10 T250 10 T300 10 T350 10 T400 10 V20 H0 Z';
    const bulles = [8, 19, 33, 47, 61, 74, 88].map((x, i) =>
      `<span class="bulle-b" style="left:${x}%;--d:${(i * 0.37) % 2.2}s;--t:${5 + (i % 3) * 2}px"></span>`).join('');
    return `<span class="liquide">
      <svg class="vague vague--2" viewBox="0 0 400 20" preserveAspectRatio="none" aria-hidden="true"><path d="${vague}"/></svg>
      <svg class="vague" viewBox="0 0 400 20" preserveAspectRatio="none" aria-hidden="true"><path d="${vague}"/></svg>
      ${bulles}</span>`;
  }

  function palmier(x, y, cx, cy) {
    const feuilles = [
      'M0 0 Q-24 -22 -48 -10 Q-26 -10 0 4 Z', 'M0 0 Q-4 -26 -24 -36 Q-8 -20 -4 4 Z',
      'M0 0 Q16 -28 40 -26 Q18 -18 4 4 Z', 'M0 0 Q26 -8 42 8 Q22 0 2 4 Z', 'M0 0 Q-18 -2 -32 16 Q-14 4 0 4 Z'
    ];
    return `<path d="M${x} ${y} Q${x - 6} ${(y + cy) / 2} ${cx} ${cy}" stroke="#9A6532" stroke-width="9" fill="none" stroke-linecap="round"/>
      <path d="M${x} ${y} Q${x - 6} ${(y + cy) / 2} ${cx} ${cy}" stroke="#7A4A1E" stroke-width="9" fill="none" stroke-dasharray="2 7"/>
      <g transform="translate(${cx} ${cy})" fill="#2FA84F" stroke="#1E7A38" stroke-width="1.5">${feuilles.map((d) => `<path d="${d}"/>`).join('')}
        <circle cx="-3" cy="6" r="4.5" fill="#7A4A1E" stroke="none"/><circle cx="4" cy="7" r="4.5" fill="#6A3E16" stroke="none"/></g>`;
  }

  // Chasse au trésor : plage, palmiers, coffre débordant de pièces d'or
  function fondTresor() {
    const pieces = [];
    for (let i = 0; i < 26; i++) {
      const x = 283 + (i * 37) % 54, y = 130 + ((i * 7) % 13);
      pieces.push(`<circle cx="${x}" cy="${y}" r="6.5"/>`);
    }
    const etincelle = (x, y, d) => `<path class="etincelle" style="--d:${d}s" d="M${x} ${y - 7} Q${x + 1} ${y - 1} ${x + 7} ${y} Q${x + 1} ${y + 1} ${x} ${y + 7} Q${x - 1} ${y + 1} ${x - 7} ${y} Q${x - 1} ${y - 1} ${x} ${y - 7} Z" fill="#fff"/>`;
    return `<svg viewBox="0 0 400 200" preserveAspectRatio="xMaxYMax slice" aria-hidden="true">
      <defs><linearGradient id="ciel-tresor" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#4FB0EE"/><stop offset="1" stop-color="#C4ECFF"/></linearGradient></defs>
      <rect width="400" height="200" fill="url(#ciel-tresor)"/>
      <circle cx="372" cy="28" r="30" fill="#FFE066" opacity=".35"/><circle cx="372" cy="28" r="19" fill="#FFE066"/>
      <g fill="#fff" opacity=".9"><ellipse cx="190" cy="34" rx="24" ry="9"/><ellipse cx="206" cy="28" rx="16" ry="9"/><ellipse cx="300" cy="56" rx="18" ry="6"/></g>
      <rect y="110" width="400" height="30" fill="#2E9BD6"/>
      <path d="M0 118 q10 -4 20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0" fill="none" stroke="#fff" stroke-opacity=".55" stroke-width="2"/>
      <path d="M0 136 Q200 118 400 130 V200 H0 Z" fill="#F3D48A"/>
      <g fill="#DDB866"><circle cx="40" cy="170" r="1.6"/><circle cx="120" cy="184" r="1.6"/><circle cx="200" cy="160" r="1.6"/><circle cx="250" cy="190" r="1.6"/><circle cx="370" cy="160" r="1.6"/></g>
      ${palmier(244, 176, 254, 84)}
      ${palmier(386, 184, 378, 98)}
      <g transform="translate(22 0)"><path d="M282 142 L288 114 Q310 106 332 114 L338 142 Z" fill="#6B3E1A" stroke="#3B2410" stroke-width="2.5" stroke-linejoin="round"/>
      <g fill="#FFC93C" stroke="#C98A12" stroke-width="1.5">${pieces.join('')}
        <ellipse cx="262" cy="184" rx="7" ry="3.5"/><ellipse cx="274" cy="189" rx="7" ry="3.5"/><ellipse cx="352" cy="186" rx="7" ry="3.5"/></g>
      <rect x="278" y="142" width="64" height="38" rx="4" fill="#8B5226" stroke="#3B2410" stroke-width="2.5"/>
      <rect x="278" y="150" width="64" height="5" fill="#E2A93B"/>
      <rect x="290" y="142" width="5" height="38" fill="#E2A93B"/><rect x="325" y="142" width="5" height="38" fill="#E2A93B"/>
      <rect x="305" y="152" width="10" height="12" rx="2" fill="#E2A93B" stroke="#3B2410" stroke-width="1.5"/>
      ${etincelle(298, 122, 0)}${etincelle(326, 126, 0.7)}${etincelle(286, 132, 1.3)}</g>
    </svg>`;
  }

  // Lumière chimique : verrerie dans le noir, liquides lumineux
  function fondLumiere() {
    const liquides = `
      <path d="M284.4 142 H331.6 L346 172 Q350 182 340 182 H276 Q266 182 270 172 Z"/>
      <path d="M346.8 156 A24 24 0 0 0 393.2 156 Z"/>
      <path d="M232 146 H244 V170 Q244 178 238 178 Q232 178 232 170 Z"/>`;
    const etoiles = [[30, 30], [80, 70], [140, 24], [190, 60], [250, 20], [120, 160], [60, 130], [210, 150]]
      .map(([x, y]) => `<circle cx="${x}" cy="${y}" r="1.3" fill="#fff" opacity=".55"/>`).join('');
    return `<svg viewBox="0 0 400 200" preserveAspectRatio="xMaxYMid slice" aria-hidden="true">
      <defs>
        <radialGradient id="nuit-lumiere" cx=".75" cy=".7" r=".8"><stop offset="0" stop-color="#1D2766"/><stop offset="1" stop-color="#060A1E"/></radialGradient>
        <filter id="lueur-lumiere" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="9"/></filter>
      </defs>
      <rect width="400" height="200" fill="url(#nuit-lumiere)"/>
      ${etoiles}
      <g class="lueur" fill="#4FE3FF" filter="url(#lueur-lumiere)">${liquides}</g>
      <g fill="#7EEBFF">${liquides}</g>
      <g fill="rgba(255,255,255,.05)" stroke="#A9BCE0" stroke-opacity=".75" stroke-width="2.5" stroke-linejoin="round">
        <path d="M296 92 V118 L270 172 Q266 182 276 182 H340 Q350 182 346 172 L320 118 V92"/>
        <path d="M362 98 V127.4 A24 24 0 1 0 378 127.4 V98"/>
        <path d="M230 112 V170 Q230 180 238 180 Q246 180 246 170 V112"/>
      </g>
      <path d="M292 92 H324 M358 98 H382 M227 112 H249" stroke="#A9BCE0" stroke-opacity=".75" stroke-width="3" stroke-linecap="round"/>
    </svg>`;
  }

  window.Dessins = {
    objet, mannequin, mascotte, illu, interdit, personne, personnage, camarades, medaille, cadenas, engrenage,
    hautParleur, globe, bulleNiveau, fondSecu, fondBleue, fondTresor, fondLumiere
  };
})();
