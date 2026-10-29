// dessins-labo.js
// Dessins du mini-labo des ateliers : verrerie (avec contenu variable), produits de l'étagère,
// outils, scène de la paillasse. Les animations sont dans style.css.

(function () {
  const INK = '#2E3A46';
  const VERRE = 'rgba(225,240,250,.45)';
  const GOUTTE = 'M0 -12 Q9 0 9 5 A9 9 0 0 1 -9 5 Q-9 0 0 -12 Z';

  // ===== Verrerie : géométrie autour du centre du fond (0,0), le haut vers les y négatifs =====
  // haut / largeur : encombrement ; k : hauteur de liquide par gramme ; masse : masse à vide (g)
  const FORMES = {
    erlenmeyer: {
      corps: 'M-10 -120 V-82 L-44 -9 Q-47 0 -37 0 H37 Q47 0 44 -9 L10 -82 V-120',
      levre: 'M-14 -120 H14', haut: 120, largeur: 94, k: 0.27, masse: 112.4
    },
    becher: {
      corps: 'M-36 -96 L-34 -3 Q-34 0 -31 0 H31 Q34 0 34 -3 L36 -96',
      levre: 'M-42 -98 Q-40 -96 -36 -96 M36 -96 H40', haut: 96, largeur: 84, k: 0.6, masse: 98.6,
      graduations: 'M18 -30 H30 M22 -50 H31 M18 -70 H31'
    },
    bouteilleA: {
      corps: 'M-11 -112 V-94 Q-30 -88 -30 -70 V-4 Q-30 0 -26 0 H26 Q30 0 30 -4 V-70 Q30 -88 11 -94 V-112',
      levre: 'M-13 -112 H13', haut: 112, largeur: 60, k: 0.95, masse: 31.5, lettre: 'A'
    },
    bouteilleB: {
      corps: 'M-11 -112 V-94 Q-30 -88 -30 -70 V-4 Q-30 0 -26 0 H26 Q30 0 30 -4 V-70 Q30 -88 11 -94 V-112',
      levre: 'M-13 -112 H13', haut: 112, largeur: 60, k: 0.95, masse: 31.2, lettre: 'B'
    }
  };

  const ENTONNOIR = `<path d="M-26 -152 H26 L6 -124 V-106 H-6 V-124 Z" fill="${VERRE}" stroke="${INK}" stroke-width="2.5" stroke-linejoin="round"/>
    <path d="M-18 -146 L-4 -126" stroke="#fff" stroke-width="2.5" stroke-linecap="round" opacity=".8"/>`;

  // Le verre seul (le contenu est dessiné à part, sous le verre)
  function verre(id) {
    const F = FORMES[id];
    return `<path d="${F.corps}" fill="${VERRE}" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>
      <path d="${F.levre}" stroke="${INK}" stroke-width="3.5" stroke-linecap="round" fill="none"/>
      ${F.graduations ? `<path d="${F.graduations}" stroke="#7F8C99" stroke-width="2"/>` : ''}
      <path d="M-4 ${-F.haut + 30} L-${F.haut > 100 ? 22 : 24} -14" stroke="#fff" stroke-width="3" stroke-linecap="round" opacity=".7"/>
      ${F.lettre ? `<rect x="-14" y="-58" width="28" height="26" rx="4" fill="#fff" stroke="${INK}" stroke-width="2"/>
        <text x="0" y="-38" text-anchor="middle" font-family="Fredoka, Nunito, sans-serif" font-weight="700" font-size="20" fill="${INK}">${F.lettre}</text>` : ''}`;
  }

  // Mélange de deux couleurs hexadécimales
  function melanger(a, b, t) {
    const p = (h, i) => parseInt(h.slice(1 + i * 2, 3 + i * 2), 16);
    return '#' + [0, 1, 2].map((i) => Math.round(p(a, i) + (p(b, i) - p(a, i)) * t).toString(16).padStart(2, '0')).join('');
  }

  function couleurLiquide(c) {
    if (c.solides.hexacyanoferrate) return '#F5C04A';
    if (c.gouttes) return melanger('#D6EEFB', '#2557D6', Math.min(1, c.gouttes / 5));
    return '#D6EEFB';
  }

  function niveau(id, c) {
    const F = FORMES[id];
    return Math.min(F.haut * 0.8, c.liquide * F.k);
  }

  // Contenu d'un récipient : liquide + solides au fond
  function contenu(id, c) {
    const h = niveau(id, c);
    let s = '';
    if (h > 0) {
      s += `<rect class="liquide" x="-60" y="${-h}" width="120" height="${h}" fill="${couleurLiquide(c)}" opacity=".9"/>
        <rect x="-60" y="${-h}" width="120" height="2.5" fill="#fff" opacity=".55"/>`;
    }
    const so = c.solides;
    if (so.soude) {
      const n = Math.min(14, Math.round(so.soude.q * 2));
      for (let i = 0; i < n; i++) {
        const x = -22 + ((i * 7) % 44), y = -4 - (Math.floor(i / 6) * 4);
        s += `<ellipse cx="${x}" cy="${y}" rx="3.4" ry="2.3" fill="#fff" stroke="#AEBAC6" stroke-width="1" opacity="${1 - so.soude.dissous}"/>`;
      }
    }
    if (so.glucose) {
      const e = Math.min(1, so.glucose.q / 10);
      s += `<path d="M${-20 * e - 6} 0 Q0 ${-12 * e - 3} ${20 * e + 6} 0 Z" fill="#fff" stroke="#D5DDE5" stroke-width="1" opacity="${1 - so.glucose.dissous}"/>`;
    }
    if (so.zinc) s += '<rect x="-40" y="-5" width="80" height="5" fill="#9AA3AD"/><g fill="#6E7883"><circle cx="-14" cy="-3" r="1.2"/><circle cx="4" cy="-2" r="1.2"/><circle cx="16" cy="-3" r="1.2"/></g>';
    if (so.hexacyanoferrate && h === 0) s += '<path d="M-12 0 Q0 -9 12 0 Z" fill="#F08A24"/>';
    if (so.pieces) {
      s += '<g fill="#C8743A" stroke="#8A4A1E" stroke-width="1.5"><ellipse cx="-14" cy="-5" rx="9" ry="3.5"/><ellipse cx="8" cy="-4" rx="9" ry="3.5"/><ellipse cx="-2" cy="-9" rx="9" ry="3.5"/></g>';
    }
    if (c.chaud && h > 0) {
      s += [-14, 0, 12, -6, 8].map((x, i) =>
        `<circle class="bulle-chaude" cx="${x}" cy="-6" r="${2 + (i % 2)}" style="--d:${i * 0.35}s;--h:${-h + 8}px" fill="none" stroke="#fff" stroke-width="1.5"/>`).join('');
    }
    return `<g clip-path="url(#clip-${id})">${s}</g>`;
  }

  // Groupe complet d'un récipient dans la scène (position gérée par le moteur)
  function recipient(id) {
    const F = FORMES[id];
    return `<g class="recipient" id="rec-${id}">
      <defs><clipPath id="clip-${id}"><path d="${F.corps} Z"/></clipPath></defs>
      <g class="recipient__corps">
        <g class="recipient__contenu"></g>
        ${verre(id)}
        <g class="recipient__entonnoir"></g>
        <g class="recipient__touilleur"></g>
      </g>
    </g>`;
  }

  // Spatule plongée dans le récipient pour touiller
  // Spatule bordeaux : manche avec poignée, palette arrondie en bas (bout de la palette en 0,0, longueur L)
  function spatule(L) {
    const B = '#7B1E2C', F = '#4A0F19', R = '#C25A6B';
    return `<path d="M-2.2 ${-L + 20} H2.2 V-20 H-2.2 Z" fill="${B}" stroke="${F}" stroke-width="1.2"/>
      <rect x="-4.5" y="${-L}" width="9" height="${Math.min(34, L * 0.3)}" rx="4.5" fill="${B}" stroke="${F}" stroke-width="1.5"/>
      <path d="M-7 -2 Q-8 -16 -2.2 -22 H2.2 Q8 -16 7 -2 Q0 4 -7 -2 Z" fill="${B}" stroke="${F}" stroke-width="1.5" stroke-linejoin="round"/>
      <path d="M-2.4 ${-L + 5} V${-L + Math.min(34, L * 0.3) - 5} M-3.5 -5 Q-4.5 -12 -1.2 -18" stroke="${R}" stroke-width="1.6" stroke-linecap="round" fill="none"/>`;
  }

  // Spatule plongée dans le récipient pour touiller, légèrement penchée
  function touilleur(id) {
    return `<g class="touilleur"><g transform="translate(2 -6) rotate(12)">${spatule(FORMES[id].haut + 34)}</g></g>`;
  }

  // Zone invisible où lâcher un récipient : 50 % plus grande que lui, posée sur son support
  function zoneDepot(id, x, y) {
    const F = FORMES[id];
    const l = F.largeur * 1.5, h = F.haut * 1.5;
    return `<rect class="zone-depot" x="${x - l / 2}" y="${y + 4 - h}" width="${l}" height="${h}" rx="14"/>`;
  }

  // ===== Produits de l'étagère (viewBox 100×100, ouverture en haut au centre : 50,6) =====
  function pot(couleur, motif, etiquette, taille, danger) {
    let m = '';
    if (motif === 'pastilles') {
      for (let i = 0; i < 12; i++) m += `<ellipse cx="${32 + (i % 4) * 12}" cy="${60 + Math.floor(i / 4) * 10}" rx="4.5" ry="3" fill="#fff" stroke="#AEBAC6" stroke-width="1"/>`;
    } else {
      m = '<g fill="#fff" opacity=".45"><circle cx="34" cy="64" r="1.5"/><circle cx="52" cy="72" r="1.5"/><circle cx="64" cy="60" r="1.5"/><circle cx="42" cy="82" r="1.5"/><circle cx="60" cy="84" r="1.5"/></g>';
    }
    return `<rect x="34" y="6" width="32" height="12" rx="3" fill="#E9EEF3" stroke="${INK}" stroke-width="3"/>
      <path d="M30 18 H70 Q78 18 78 26 V86 Q78 94 70 94 H30 Q22 94 22 86 V26 Q22 18 30 18 Z" fill="rgba(225,240,250,.6)" stroke="${INK}" stroke-width="3"/>
      <path d="M25 52 H75 V86 Q75 91 70 91 H30 Q25 91 25 86 Z" fill="${couleur}"/>${m}
      <rect x="28" y="26" width="44" height="20" rx="3" fill="#fff" stroke="${INK}" stroke-width="2"/>
      <text x="50" y="${36 + taille / 3}" text-anchor="middle" font-family="Nunito, sans-serif" font-weight="800" font-size="${taille}" fill="${INK}">${etiquette}</text>
      ${danger ? `<g transform="translate(76 18)"><rect x="-9" y="-9" width="18" height="18" transform="rotate(45)" fill="#fff" stroke="#D7262E" stroke-width="2.5"/>
        <path d="M-5 -4 H-1 L-2 0 Z M1 -4 H5 L4 0 Z M-6 4 H6" stroke="${INK}" stroke-width="1.6" fill="${INK}"/></g>` : ''}`;
  }

  function bouteille(liquide, etiquette, taille, verreCouleur) {
    return `<rect x="43" y="6" width="14" height="24" rx="3" fill="${verreCouleur}" stroke="${INK}" stroke-width="3"/>
      <path d="M43 28 Q28 34 28 48 V88 Q28 94 34 94 H66 Q72 94 72 88 V48 Q72 34 57 28 Z" fill="${verreCouleur}" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>
      <path d="M31 56 H69 V88 Q69 91 66 91 H34 Q31 91 31 88 Z" fill="${liquide}" opacity=".9"/>
      ${etiquette ? `<rect x="32" y="52" width="36" height="20" rx="3" fill="#fff" stroke="${INK}" stroke-width="2"/>
        <text x="50" y="${62 + taille / 3}" text-anchor="middle" font-family="Nunito, sans-serif" font-weight="800" font-size="${taille}" fill="${INK}">${etiquette}</text>` : ''}`;
  }

  const PRODUITS = {
    eau: `<rect x="47" y="4" width="6" height="26" rx="2" fill="#DDE5EC" stroke="${INK}" stroke-width="2"/>
      <rect x="37" y="28" width="26" height="11" rx="3" fill="#3F7FE0" stroke="${INK}" stroke-width="2.5"/>
      <path d="M32 39 H68 Q75 39 75 47 V87 Q75 94 68 94 H32 Q25 94 25 87 V47 Q25 39 32 39 Z" fill="rgba(255,255,255,.75)" stroke="${INK}" stroke-width="3"/>
      <path d="M28 54 H72 V87 Q72 91 68 91 H32 Q28 91 28 87 Z" fill="#BFE6F8"/>
      <text x="50" y="76" text-anchor="middle" font-family="Nunito, sans-serif" font-weight="800" font-size="14" fill="${INK}">H₂O</text>`,
    soude: pot('#EEF2F6', 'pastilles', 'NaOH', 13, true),
    glucose: pot('#F7F9FB', 'poudre', 'C₆H₁₂O₆', 9),
    sel: pot('#F2F4F7', 'poudre', 'NaCl', 13),
    zinc: pot('#9AA3AD', 'poudre', 'Zn', 14),
    hexacyanoferrate: pot('#F08A24', 'poudre', 'K₃Fe(CN)₆', 7.5),
    bleuMethylene: `<path d="M45 24 L50 5 L55 24 Z" fill="#F1F5F9" stroke="${INK}" stroke-width="2" stroke-linejoin="round"/>
      <rect x="38" y="22" width="24" height="13" rx="3" fill="#E9EEF3" stroke="${INK}" stroke-width="2.5"/>
      <path d="M36 35 H64 Q71 35 71 43 V87 Q71 94 64 94 H36 Q29 94 29 87 V43 Q29 35 36 35 Z" fill="#1F3FA8" stroke="${INK}" stroke-width="3"/>
      <rect x="36" y="52" width="28" height="22" rx="3" fill="#fff" stroke="${INK}" stroke-width="2"/>
      <g transform="translate(50 64) scale(.6)"><path d="${GOUTTE}" fill="#2557D6"/></g>`,
    vinaigre: bouteille('#F3E3B0', '', 0, 'rgba(225,240,250,.6)'),
    peroxyde: bouteille('#E8E2D8', 'H₂O₂', 12, '#B9763A'),
    luminol: pot('#F3E6A0', 'poudre', 'luminol', 10)
  };

  function produit(id) {
    return `<svg viewBox="0 0 100 100" class="ico-produit" aria-hidden="true">${PRODUITS[id]}</svg>`;
  }

  // ===== Matériel (viewBox 100×100) =====
  const MATERIEL = {
    erlenmeyer: `<g transform="translate(50 95) scale(.7)">${verre('erlenmeyer')}</g>`,
    becher: `<g transform="translate(50 92) scale(.8)">${verre('becher')}</g>`,
    bouteilleA: `<g transform="translate(50 94) scale(.76)">${verre('bouteilleA')}</g>`,
    bouteilleB: `<g transform="translate(50 94) scale(.76)">${verre('bouteilleB')}</g>`,
    eprouvette: `<path d="M42 10 V80 Q42 92 50 92 Q58 92 58 80 V10" fill="${VERRE}" stroke="${INK}" stroke-width="3"/>
      <path d="M38 10 H62" stroke="${INK}" stroke-width="3.5" stroke-linecap="round"/>`,
    spatule: `<g transform="translate(30 84) rotate(40) scale(1.3)">${spatule(68)}</g>`,
    entonnoir: `<path d="M16 16 H84 L57 54 V90 H43 V54 Z" fill="${VERRE}" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>
      <path d="M28 22 L46 46" stroke="#fff" stroke-width="3" stroke-linecap="round"/>`,
    pipette: `<ellipse cx="50" cy="20" rx="11" ry="14" fill="#F1F5F9" stroke="${INK}" stroke-width="2.5"/>
      <path d="M45 32 H55 V74 L51 94 H49 L45 74 Z" fill="${VERRE}" stroke="${INK}" stroke-width="2.5" stroke-linejoin="round"/>`,
    pieces: `<g fill="#C8743A" stroke="#8A4A1E" stroke-width="2.5">
      <circle cx="38" cy="58" r="20"/><circle cx="64" cy="44" r="20"/><circle cx="56" cy="72" r="20"/></g>
      <g fill="none" stroke="#E9A06A" stroke-width="2"><circle cx="38" cy="58" r="13"/><circle cx="64" cy="44" r="13"/><circle cx="56" cy="72" r="13"/></g>`,
    trombones: `<g fill="none" stroke="#7A8796" stroke-width="4" stroke-linecap="round">
      <path d="M30 80 V30 Q30 18 40 18 Q50 18 50 30 V70 Q50 76 44 76 Q38 76 38 70 V36"/>
      <path d="M56 86 V40 Q56 28 66 28 Q76 28 76 40 V78 Q76 84 70 84 Q64 84 64 78 V46"/></g>`
  };

  function materiel(id) {
    return `<svg viewBox="0 0 100 100" class="ico-materiel" aria-hidden="true">${MATERIEL[id]}</svg>`;
  }

  // ===== Ce qu'on tient au-dessus du récipient pour verser =====
  // Origine (0,0) = endroit d'où tombe le produit
  function verseur(type, produitId) {
    if (type === 'gouttes') {
      return `<g class="verseur-tenu"><g transform="rotate(180) translate(-30 -3) scale(.6)">${PRODUITS[produitId]}</g></g>`;
    }
    return `<g class="verseur-tenu"><g transform="rotate(-125) translate(-31 -3.7) scale(.62)">${PRODUITS[produitId]}</g></g>`;
  }

  // ===== Scène de la paillasse (viewBox 600×320) =====
  // SPOTS : centre du fond des récipients selon leur place
  const SPOTS = { balance: [160, 204], paillasse: [318, 250], paillasse2: [438, 250], plaque: [490, 218] };

  function scene(avecPlaque) {
    return `<svg viewBox="0 0 600 320" class="labo-svg" id="labo-svg" aria-hidden="true">
      <defs><linearGradient id="mur-labo" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F6FAFD"/><stop offset="1" stop-color="#E3ECF4"/></linearGradient></defs>
      <rect width="600" height="252" fill="url(#mur-labo)"/>
      <path d="M0 60 H600 M0 120 H600 M0 180 H600 M100 0 V250 M250 0 V250 M400 0 V250 M550 0 V250" stroke="#fff" stroke-width="2"/>
      <g id="prof-calque"></g>
      <rect y="248" width="600" height="14" fill="#5E6B78"/>
      <rect y="262" width="600" height="58" fill="#8A96A3"/>
      <path d="M150 262 V320 M300 262 V320 M450 262 V320" stroke="#6E7883" stroke-width="3"/>
      <g id="balance">
        <rect x="80" y="210" width="160" height="40" rx="7" fill="#E9EEF3" stroke="${INK}" stroke-width="2.5"/>
        <rect x="150" y="204" width="20" height="8" fill="#AEB8C2"/>
        <rect x="104" y="198" width="112" height="8" rx="3" fill="#C9D2DB" stroke="${INK}" stroke-width="2.5"/>
        <rect x="94" y="218" width="98" height="24" rx="3" fill="#1E2A22"/>
        <text id="bal-affichage" x="186" y="236" text-anchor="end" font-family="'Courier New', monospace" font-weight="700" font-size="17" fill="#7CFF9B">0,0 g</text>
        <g id="bal-zero" class="bal-zero"><circle cx="216" cy="230" r="13" fill="#3F7FE0" stroke="${INK}" stroke-width="2"/>
          <text x="216" y="236" text-anchor="middle" font-family="Fredoka, Nunito, sans-serif" font-weight="700" font-size="16" fill="#fff">0</text></g>
      </g>
      ${avecPlaque ? `<g id="plaque">
        <rect x="430" y="226" width="120" height="24" rx="5" fill="#4A5563" stroke="${INK}" stroke-width="2.5"/>
        <rect id="plaque-dessus" x="436" y="218" width="108" height="8" rx="3" fill="#7A8796" stroke="${INK}" stroke-width="2"/>
        <circle id="plaque-voyant" cx="446" cy="238" r="4" fill="#5B6772"/>
        <g id="plaque-bouton"><circle cx="528" cy="238" r="9" fill="#E9EEF3" stroke="${INK}" stroke-width="2"/><path d="M528 232 V238" stroke="${INK}" stroke-width="2.5" stroke-linecap="round"/></g>
      </g>` : ''}
      <g id="zone-calque"></g>
      <g id="recipients-calque"></g>
      <g id="verseur-calque"></g>
      <g id="particules-calque"></g>
      <g id="horloge-labo" class="horloge-labo">
        <circle cx="540" cy="58" r="28" fill="#fff" stroke="${INK}" stroke-width="3"/>
        <path d="M540 34 V39 M564 58 H559 M540 82 V77 M516 58 H521" stroke="${INK}" stroke-width="2.5"/>
        <path class="aiguille" d="M540 58 V38" stroke="#E5484D" stroke-width="3.5" stroke-linecap="round"/>
        <circle cx="540" cy="58" r="3" fill="${INK}"/>
        <path d="M498 50 L508 58 L498 66 Z M488 50 L498 58 L488 66 Z" fill="#E5484D"/>
      </g>
    </svg>`;
  }

  window.DessinsLabo = {
    FORMES, SPOTS, GOUTTE, ENTONNOIR, recipient, contenu, niveau, touilleur, zoneDepot, verseur, produit, materiel, scene
  };
})();
