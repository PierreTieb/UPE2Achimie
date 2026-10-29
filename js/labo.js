// labo.js
// Moteur du mini-labo : l'élève suit le protocole d'un atelier (ateliers.js) étape par étape.
// Chaque action se valide en choisissant le bon produit / matériel ou en agissant dans la scène
// (tapoter pour verser, glisser pour agiter, bouton 0 de la balance, bouton de la plaque).

(function () {
  const $ = (id) => document.getElementById(id);
  const h = (cle, vars) => I18n.html(cle, null, vars);
  const D = DessinsLabo;

  // Comment chaque produit tombe dans le récipient
  const PRODUITS = {
    eau: { chute: 'jet', couleur: '#9CD3F2', liquide: true },
    soude: { chute: 'pastilles', couleur: '#fff' },
    glucose: { chute: 'poudre', couleur: '#fff' },
    zinc: { chute: 'poudre', couleur: '#9AA3AD', masse: 2 },
    hexacyanoferrate: { chute: 'poudre', couleur: '#F08A24', masse: 1.6 },
    bleuMethylene: { chute: 'goutte', couleur: '#2557D6', masse: 0.05 },
    peroxyde: { chute: 'jet', couleur: '#E3EEF6', liquide: true, masse: 10 },
    luminol: { chute: 'jet', couleur: '#E3EEF6', liquide: true, masse: 10 }
  };
  const SOLUBLES = ['soude', 'glucose'];
  const RECIPIENTS = Object.keys(D.FORMES);

  const dialogue = Dialogue.creer($('labo-mascotte'), $('labo-bulle'), $('labo-ecouter'));
  let st = null;
  let glisse = null;

  const vide = () => ({ liquide: 0, masse: 0, gouttes: 0, solides: {}, chaud: false });
  const copie = (o) => JSON.parse(JSON.stringify(o));
  const action = () => st.def.etapes[st.e].actions[st.a];

  function demarrer(id) {
    st = {
      id,
      def: ATELIERS[id],
      e: 0,
      a: 0,
      recipients: {},
      actif: null,
      tare: 0,
      outil: null,
      entonnoirSur: null,
      versement: null,
      agitation: 0,
      prof: null,
      fini: false,
      occupe: false,
      erreur: null
    };
    $('labo-scene').innerHTML = D.scene(st.def.plaque);
    brancherScene();
    dialogue.oublier();
    majBalance();
    entrerAction();
  }

  // Attend la fin d'une animation, sauf si l'élève a quitté ou recommencé entre-temps
  function occuper(ms, suite) {
    const enCours = st;
    st.occupe = true;
    setTimeout(() => {
      if (st !== enCours) return;
      st.occupe = false;
      suite();
    }, ms);
  }

  function suivante() {
    const etapes = st.def.etapes;
    st.a++;
    if (st.a >= etapes[st.e].actions.length) {
      st.e++;
      st.a = 0;
    }
    if (st.e >= etapes.length) {
      st.fini = true;
      majVerseur();
      afficher();
      return;
    }
    entrerAction();
    afficher();
  }

  // Préparation de la scène au début de chaque action
  function entrerAction() {
    const A = action();
    if (A.type === 'agiter') {
      st.agitation = 0;
      // On agite le récipient posé sur la paillasse, pas sur la balance
      const r = st.recipients[st.actif];
      if (r.pos === 'balance') {
        r.pos = placeLibre(st.actif);
        majRecipients();
      }
    }
    majOutils();
    majVerseur();
  }

  // ===== Affichage (bulle, rayons, boutons) : refait à chaque changement de langue =====
  function indice(A) {
    switch (A.type) {
      case 'verser': return st.versement ? { cle: 'h_verser', vars: { masse: A.masse } } : { cle: 'h_produit' };
      case 'gouttes': return { cle: st.versement ? 'h_gouttes' : 'h_produit' };
      case 'spatule': return { cle: st.versement ? 'h_spatule' : 'h_produit' };
      case 'appeler': return { cle: st.prof ? 'prof_' + A.produit : 'h_appeler' };
      default: return { cle: 'h_' + A.type };
    }
  }

  function afficher() {
    if (!st) return;
    const etapes = st.def.etapes;
    $('labo-etapes').innerHTML = etapes.map((e, i) =>
      `<span class="etape-point${i < st.e || st.fini ? ' fait' : ''}${i === st.e && !st.fini ? ' actuel' : ''}"></span>`).join('');

    if (st.fini) {
      dialogue.dire({ cle: 'fin_titre', classe: 'bulle__etape' }, st.def.fin);
      $('labo-rayons').hidden = true;
      $('labo-jauge').hidden = true;
      $('labo-actions').innerHTML = `<div class="labo-fin">
        <svg viewBox="0 0 100 100" class="labo-fin__ico" aria-hidden="true"><circle cx="50" cy="50" r="44" fill="#FFD43B" stroke="#2E3A46" stroke-width="4"/>
          <text x="50" y="68" text-anchor="middle" font-family="Fredoka, Nunito, sans-serif" font-weight="700" font-size="54" fill="#2E3A46">?</text></svg>
        <button type="button" class="btn-principal" id="labo-medaille">${h('bouton_medaille')}</button></div>`;
      App.cacherToast(true);
      return;
    }

    const A = action();
    const ind = indice(A);
    dialogue.dire(
      { cle: 'etape_n', vars: { n: st.e + 1, total: etapes.length }, classe: 'bulle__etape' },
      { cle: etapes[st.e].texte },
      { cle: ind.cle, vars: ind.vars, classe: 'bulle__aide' }
    );

    const choixProduit = ['verser', 'gouttes', 'spatule'].includes(A.type) && !st.versement;
    const choixMateriel = ['placer', 'outil', 'deposer'].includes(A.type);
    $('labo-rayons').hidden = false;
    $('labo-rayons').innerHTML = rayon('produits', st.def.produits, choixProduit) + rayon('materiel', st.def.materiel, choixMateriel);

    let boutons = '';
    if (['verser', 'gouttes'].includes(A.type) && st.versement) {
      boutons = `<button type="button" class="btn-principal" id="labo-valider">${h('valider')}</button>`;
    } else if (A.type === 'appeler' && !st.prof) {
      boutons = `<button type="button" class="btn-principal btn-appeler" id="labo-appeler">✋ ${h('appeler_btn')}</button>`;
    }
    $('labo-actions').innerHTML = boutons;
    $('labo-jauge').hidden = A.type !== 'agiter';
    majJauge();

    // Ce qu'on peut toucher dans la scène clignote
    const svg = $('labo-svg');
    svg.classList.toggle('mode-agiter', A.type === 'agiter');
    svg.classList.toggle('mode-tapoter', !!st.versement);
    $('bal-zero').classList.toggle('cible', A.type === 'tarer');
    if ($('plaque')) $('plaque').classList.toggle('cible', A.type === 'chauffer');

    if (st.erreur) App.toast(h(st.erreur.cle, st.erreur.vars), { persistant: true });
    else App.cacherToast(true);
  }

  function rayon(type, liste, actif) {
    const enMain = type === 'produits' ? st.versement && st.versement.produit : st.outil;
    return `<div class="labo-rayon labo-rayon--${type}${actif ? ' actif' : ''}">
      <p class="labo-rayon__titre">${h(type === 'produits' ? 'rayon_produits' : 'rayon_materiel')}</p>
      <div class="labo-rayon__objets">
        ${liste.map((id) => `<button type="button" class="labo-objet${id === enMain ? ' en-main' : ''}" data-rayon="${type}" data-id="${id}">
          <span class="labo-objet__img">${type === 'produits' ? D.produit(id) : D.materiel(id)}</span>
          <span class="labo-objet__nom">${h((type === 'produits' ? 'prod_' : 'mat_') + id)}</span></button>`).join('')}
      </div></div>`;
  }

  // ===== Erreurs : message persistant qui tremble si elle se répète =====
  function erreur(el, cle, vars) {
    if (el) App.secouer(el);
    const repetee = !!st.erreur && st.erreur.cle === cle;
    st.erreur = { cle, vars };
    App.toast(h(cle, vars), { persistant: true, secouer: repetee });
  }

  function effacerErreur() {
    st.erreur = null;
    App.cacherToast(true);
  }

  // ===== Choix dans les rayons =====
  // Sur téléphone, les rayons sont sous la scène : après un bon choix, on remonte vers la scène
  function voirScene() {
    const r = $('labo-scene').getBoundingClientRect();
    if (r.top < 0 || r.bottom > innerHeight) $('labo-scene').scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  function choisir(type, id, btn) {
    const A = action();
    if (type === 'materiel') {
      if (A.type === 'placer') {
        if (id !== A.objet) return erreur(btn, RECIPIENTS.includes(id) || id === 'eprouvette' ? 'e_recipient' : 'e_objet');
        return placer(id, A.sur);
      }
      if (A.type === 'outil') {
        if (id !== A.outil) return erreur(btn, 'e_outil');
        return prendreOutil(id);
      }
      if (A.type === 'deposer') {
        if (id !== A.objet) return erreur(btn, 'e_objet');
        return deposer();
      }
      return erreur(btn, 'e_moment');
    }
    if (['verser', 'gouttes', 'spatule'].includes(A.type) && !st.versement) {
      if (id !== A.produit) return erreur(btn, 'e_produit');
      effacerErreur();
      st.versement = { produit: id, avant: copie(st.recipients[st.actif].contenu), n: 0 };
      majVerseur();
      afficher();
      voirScene();
      return;
    }
    erreur(btn, 'e_moment');
  }

  // ===== Récipients =====
  function placeLibre(sauf) {
    const prises = Object.entries(st.recipients).filter(([k]) => k !== sauf).map(([, r]) => r.pos);
    return ['paillasse', 'paillasse2'].find((p) => !prises.includes(p)) || 'paillasse';
  }

  function placer(id, sur) {
    effacerErreur();
    const nouveau = !st.recipients[id];
    if (nouveau) {
      st.recipients[id] = { pos: null, contenu: vide() };
      $('recipients-calque').insertAdjacentHTML('beforeend', D.recipient(id));
    }
    // Ce qui occupait la place est poussé sur la paillasse
    Object.entries(st.recipients).forEach(([autre, r]) => {
      if (autre !== id && r.pos === sur) r.pos = placeLibre(id);
    });
    st.recipients[id].pos = sur;
    st.actif = id;
    majRecipients(nouveau ? id : null);
    voirScene();
    occuper(750, suivante);
  }

  function majRecipients(nouveau) {
    Object.entries(st.recipients).forEach(([id, r]) => {
      const g = $('rec-' + id);
      const [x, y] = D.SPOTS[r.pos];
      if (id === nouveau) {
        g.classList.add('sans-transition', 'apparait');
        g.style.transform = `translate(${x}px, ${y}px)`;
        void g.getBoundingClientRect();
        g.classList.remove('sans-transition');
      } else {
        g.style.transform = `translate(${x}px, ${y}px)`;
      }
      majContenu(id);
    });
    majOutils();
    majBalance();
  }

  function majContenu(id) {
    const g = $('rec-' + id);
    if (g) g.querySelector('.recipient__contenu').innerHTML = D.contenu(id, st.recipients[id].contenu);
  }

  function majOutils() {
    Object.keys(st.recipients).forEach((id) => {
      const g = $('rec-' + id);
      g.querySelector('.recipient__entonnoir').innerHTML = st.entonnoirSur === id ? D.ENTONNOIR : '';
      g.querySelector('.recipient__agitateur').innerHTML = st.outil === 'agitateur' && st.actif === id ? D.agitateur(id) : '';
    });
  }

  // ===== Balance =====
  function brut() {
    return Object.entries(st.recipients)
      .filter(([, r]) => r.pos === 'balance')
      .reduce((t, [id, r]) => t + D.FORMES[id].masse + r.contenu.masse, 0);
  }

  function affichage() { return Math.round((brut() - st.tare) * 10) / 10; }

  function majBalance() {
    // Balance vide : elle revient à zéro (évite les masses négatives, déroutantes pour les élèves)
    if (!Object.values(st.recipients).some((r) => r.pos === 'balance')) st.tare = 0;
    const el = $('bal-affichage');
    if (el) el.textContent = affichage().toFixed(1).replace('.', ',') + ' g';
  }

  function toucherBalance() {
    if (action().type !== 'tarer') return erreur($('bal-zero'), 'e_moment');
    effacerErreur();
    st.tare = brut();
    majBalance();
    App.secouer($('bal-affichage'));
    occuper(500, suivante);
  }

  // ===== Verser : ce qu'on tient au-dessus du récipient =====
  function pointVerseur() {
    const id = st.actif;
    const [x, y] = D.SPOTS[st.recipients[id].pos];
    const haut = st.entonnoirSur === id ? 152 : D.FORMES[id].haut;
    return [x + 2, y - haut - 16];
  }

  function surface() {
    const id = st.actif;
    const [, y] = D.SPOTS[st.recipients[id].pos];
    return y - D.niveau(id, st.recipients[id].contenu) - 4;
  }

  function majVerseur() {
    const calque = $('verseur-calque');
    let html = '';
    if (st.actif && !st.fini) {
      const A = action();
      if (st.prof) html = D.verseur('verser', st.prof);
      else if (st.versement && A.type === 'gouttes') html = D.verseur('gouttes', st.versement.produit);
      else if (st.versement && A.type === 'spatule') html = D.verseur('spatule', null, PRODUITS[st.versement.produit].couleur);
      else if (st.versement) html = D.verseur('verser', st.versement.produit);
      else if (st.outil === 'spatule') html = D.verseur('spatule');
    }
    if (!html) { calque.innerHTML = ''; return; }
    const [ox, oy] = pointVerseur();
    calque.innerHTML = `<g transform="translate(${ox} ${oy})"><g class="verseur">${html}</g></g>`;
  }

  // Particules qui tombent du verseur jusqu'à la surface du contenu
  function chute(produit) {
    const P = PRODUITS[produit];
    const [ox, oy] = pointVerseur();
    const dy = Math.max(10, surface() - oy);
    let s = '';
    if (P.chute === 'jet') {
      s = `<rect class="jet" x="${ox - 3}" y="${oy}" width="6" height="${dy}" rx="3" fill="${P.couleur}" stroke="#7FB8D8" stroke-width="1"/>`;
    } else if (P.chute === 'goutte') {
      s = `<g class="tombe" style="--dy:${dy}px"><path transform="translate(${ox} ${oy + 4}) scale(.45)" d="${D.GOUTTE}" fill="${P.couleur}"/></g>`;
    } else {
      const pastilles = P.chute === 'pastilles';
      for (let i = 0; i < (pastilles ? 3 : 8); i++) {
        s += `<circle class="tombe" style="--dy:${dy}px;--dx:${(i % 3 - 1) * 4}px;animation-delay:${i * 35}ms" cx="${ox}" cy="${oy}" r="${pastilles ? 3 : 1.7}"
          fill="${P.couleur}" stroke="${pastilles ? '#AEBAC6' : 'none'}"/>`;
      }
    }
    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    g.innerHTML = s;
    $('particules-calque').appendChild(g);
    setTimeout(() => g.remove(), 900);
    const v = document.querySelector('#verseur-calque .verseur');
    if (v) { v.classList.remove('secousse'); void v.getBoundingClientRect(); v.classList.add('secousse'); }
  }

  function ajouterSolide(c, produit, q) {
    c.solides[produit] = c.solides[produit] || { q: 0, dissous: 0 };
    c.solides[produit].q += q;
  }

  // Une tape dans la scène = une dose
  function tapoter() {
    const A = action();
    if (!st.versement || !['verser', 'gouttes', 'spatule'].includes(A.type)) return;
    const id = st.actif;
    const c = st.recipients[id].contenu;
    const P = PRODUITS[st.versement.produit];
    chute(st.versement.produit);
    if (A.type === 'verser') {
      if (P.liquide) c.liquide += A.pas;
      else ajouterSolide(c, st.versement.produit, A.pas);
      c.masse += A.pas;
    } else if (A.type === 'gouttes') {
      c.gouttes++;
      c.masse += P.masse;
      st.versement.n++;
    } else {
      ajouterSolide(c, st.versement.produit, P.masse);
      c.masse += P.masse;
      st.outil = null;
      st.versement = null;
      occuper(700, () => { majVerseur(); suivante(); });
    }
    setTimeout(() => { majContenu(id); majBalance(); }, 380);
  }

  function valider() {
    const A = action();
    const btn = $('labo-valider');
    const annuler = () => {
      st.recipients[st.actif].contenu = copie(st.versement.avant);
      st.versement.n = 0;
      majContenu(st.actif);
      majBalance();
    };
    if (A.type === 'verser') {
      const m = affichage();
      if (Math.abs(m - A.masse) < 0.05) return reussi();
      if (m < A.masse) return erreur(btn, 'e_pas_assez', { masse: A.masse });
      annuler();
      return erreur(btn, 'e_trop', { masse: A.masse });
    }
    const n = st.versement.n;
    if (n === A.n) return reussi();
    if (n < A.n) return erreur(btn, 'e_gouttes_moins', { n, cible: A.n });
    annuler();
    erreur(btn, 'e_gouttes_plus', { n, cible: A.n });
  }

  function reussi() {
    effacerErreur();
    st.versement = null;
    majVerseur();
    suivante();
  }

  // ===== Outils, objets, plaque, professeur =====
  function prendreOutil(id) {
    effacerErreur();
    if (id === 'entonnoir') st.entonnoirSur = st.actif;
    else st.outil = id;
    majOutils();
    majVerseur();
    voirScene();
    occuper(500, suivante);
  }

  function deposer() {
    effacerErreur();
    voirScene();
    const id = st.actif;
    const [x, y] = D.SPOTS[st.recipients[id].pos];
    const haut = D.FORMES[id].haut;
    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    g.innerHTML = [-12, 6, -2].map((dx, i) =>
      `<ellipse class="tombe" style="--dy:${haut + 30}px;animation-delay:${i * 120}ms" cx="${x + dx}" cy="${y - haut - 36}" rx="9" ry="3.5" fill="#C8743A" stroke="#8A4A1E" stroke-width="1.5"/>`).join('');
    $('particules-calque').appendChild(g);
    setTimeout(() => {
      g.remove();
      const c = st.recipients[id].contenu;
      c.solides.pieces = { q: 3, dissous: 0 };
      c.masse += 15;
      majContenu(id);
    }, 700);
    occuper(900, suivante);
  }

  function toucherPlaque() {
    if (action().type !== 'chauffer') return erreur($('plaque'), 'e_moment');
    effacerErreur();
    $('plaque').classList.add('chaude');
    $('horloge-labo').classList.add('visible');
    const id = st.actif;
    setTimeout(() => { st.recipients[id].contenu.chaud = true; majContenu(id); }, 900);
    occuper(2800, () => {
      $('horloge-labo').classList.remove('visible');
      suivante();
    });
  }

  function appeler() {
    const A = action();
    const id = st.actif;
    effacerErreur();
    st.prof = A.produit;
    st.occupe = true;
    afficher();
    $('prof-calque').innerHTML = `<g class="prof"><svg x="462" y="92" width="118" height="158" viewBox="0 0 120 160">
      ${Dessins.personne({ lunettes: 'yeux', cheveux: '#9AA3AD' })}</svg></g>`;
    const prof = $('prof-calque').firstElementChild;
    requestAnimationFrame(() => requestAnimationFrame(() => prof.classList.add('present')));
    const enCours = st;
    const plus = (fn, ms) => setTimeout(() => { if (st === enCours) fn(); }, ms);
    plus(majVerseur, 800);
    [1200, 1650, 2100].forEach((ms) => plus(() => {
      chute(A.produit);
      const c = st.recipients[id].contenu;
      c.liquide += PRODUITS[A.produit].masse / 3;
      c.masse += PRODUITS[A.produit].masse / 3;
      setTimeout(() => { majContenu(id); majBalance(); }, 380);
    }, ms));
    plus(() => { st.prof = null; majVerseur(); prof.classList.remove('present'); }, 2800);
    plus(() => { $('prof-calque').innerHTML = ''; st.occupe = false; suivante(); }, 3500);
  }

  // ===== Agiter : glisser le doigt presque sur place =====
  function agiter(distance, decalage) {
    st.agitation = Math.min(1, st.agitation + distance / 1400);
    const id = st.actif;
    const tige = document.querySelector(`#rec-${id} .agitateur-tige`);
    if (tige) tige.style.transform = `translateX(${decalage}px) rotate(${decalage / 3}deg)`;
    const c = st.recipients[id].contenu;
    SOLUBLES.forEach((p) => {
      if (c.solides[p] && c.liquide > 0) c.solides[p].dissous = Math.max(c.solides[p].dissous, st.agitation);
    });
    if (!agiter.image) {
      agiter.image = requestAnimationFrame(() => { agiter.image = null; if (st) majContenu(id); });
    }
    majJauge();
    if (st.agitation >= 1) {
      glisse = null;
      st.outil = null;
      occuper(500, suivante);
    }
  }

  function majJauge() {
    $('labo-jauge').firstElementChild.style.width = Math.round((st ? st.agitation : 0) * 100) + '%';
  }

  // ===== Événements =====
  function brancherScene() {
    const svg = $('labo-svg');
    svg.addEventListener('click', (e) => {
      if (!st || st.occupe || st.fini) return;
      if (e.target.closest('#bal-zero')) return toucherBalance();
      if (e.target.closest('#plaque')) return toucherPlaque();
      tapoter();
    });
    svg.addEventListener('pointerdown', (e) => {
      if (!st || st.occupe || st.fini || action().type !== 'agiter') return;
      glisse = { x: e.clientX, y: e.clientY, decalage: 0 };
      svg.setPointerCapture(e.pointerId);
    });
    svg.addEventListener('pointermove', (e) => {
      if (!glisse) return;
      const dx = e.clientX - glisse.x;
      const d = Math.abs(dx) + Math.abs(e.clientY - glisse.y);
      glisse.decalage = Math.max(-16, Math.min(16, glisse.decalage + dx));
      glisse.x = e.clientX;
      glisse.y = e.clientY;
      agiter(d, glisse.decalage);
    });
    const lacher = () => { glisse = null; };
    svg.addEventListener('pointerup', lacher);
    svg.addEventListener('pointercancel', lacher);
  }

  $('labo-rayons').addEventListener('click', (e) => {
    const b = e.target.closest('.labo-objet');
    if (!b || !st || st.occupe || st.fini) return;
    choisir(b.dataset.rayon, b.dataset.id, b);
  });

  $('labo-actions').addEventListener('click', (e) => {
    const b = e.target.closest('button');
    if (!b || !st || st.occupe) return;
    if (b.id === 'labo-valider') valider();
    else if (b.id === 'labo-appeler') appeler();
    else if (b.id === 'labo-medaille') {
      const id = st.id;
      st = null;
      App.recompenser(id);
    }
  });

  window.Labo = { demarrer, afficher };
})();
