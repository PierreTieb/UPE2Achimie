// labo.js
// Moteur du mini-labo : l'élève suit le protocole d'un atelier (ateliers.js) étape par étape.
// Chaque action se valide en choisissant le bon produit / matériel ou en agissant dans la scène
// (tapoter pour verser, glisser-déposer un récipient, glisser le doigt pour touiller,
// bouton 0 de la balance, bouton de la plaque). Une étape terminée devient verte ;
// les étapes déjà validées restent accessibles en touchant leur point.

(function () {
  const $ = (id) => document.getElementById(id);
  const h = (cle, vars) => I18n.html(cle, null, vars);
  const D = DessinsLabo;

  // Comment chaque produit tombe dans le récipient
  const PRODUITS = {
    eau: { chute: 'jet', couleur: '#9CD3F2', liquide: true },
    soude: { chute: 'pastilles', couleur: '#fff' },
    glucose: { chute: 'poudre', couleur: '#fff' },
    zinc: { chute: 'poudre', couleur: '#9AA3AD', masse: 0.4 },
    hexacyanoferrate: { chute: 'poudre', couleur: '#F08A24', masse: 0.4 },
    bleuMethylene: { chute: 'goutte', couleur: '#2557D6', masse: 0.05 },
    peroxyde: { chute: 'jet', couleur: '#E3EEF6', liquide: true, masse: 10 },
    luminol: { chute: 'poudre', couleur: '#F3E6A0', masse: 1 }
  };
  const SOLUBLES = ['soude', 'glucose'];
  const RECIPIENTS = Object.keys(D.FORMES);
  const DUREE_AGITATION = 10000;
  const DUREE_CHAUFFE = 5600;

  const dialogue = Dialogue.creer($('labo-mascotte'), $('labo-bulle'), $('labo-ecouter'));
  let st = null;
  let glisse = null;
  let deplace = null;

  const vide = () => ({ liquide: 0, masse: 0, gouttes: 0, solides: {}, chaud: false });
  const copie = (o) => JSON.parse(JSON.stringify(o));
  const action = () => st.def.etapes[st.e].actions[st.a];
  const contenuActif = () => st.recipients[st.actif].contenu;
  const etapesValidees = () => (App.etat.etapes || {})[st.id] || 0;

  // Reprend à la première étape pas encore validée (ou au début si tout est fait)
  function demarrer(id) {
    const faites = (App.etat.etapes || {})[id] || 0;
    allerA(id, faites >= ATELIERS[id].etapes.length ? 0 : faites);
  }

  // Reconstruit le labo tel qu'il est au début de l'étape i (les étapes précédentes sont rejouées sans animation)
  function allerA(id, i) {
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
      chaude: false,
      versement: null,
      agitation: 0,
      prof: null,
      reussie: false,
      fini: false,
      occupe: false,
      erreur: null
    };
    glisse = null;
    deplace = null;
    $('labo-scene').innerHTML = D.scene(st.def.plaque);
    brancherScene();
    for (let e = 0; e < i; e++) st.def.etapes[e].actions.forEach(rejouer);
    st.e = i;
    if ($('plaque')) $('plaque').classList.toggle('chaude', st.chaude);
    majRecipients(null, true);
    dialogue.oublier();
    App.cacherToast(true);
    entrerAction();
    afficher();
  }

  // Effet d'une action réussie, appliqué instantanément (retour à une étape)
  function rejouer(A) {
    const P = PRODUITS[A.produit];
    switch (A.type) {
      case 'placer':
      case 'glisser':
        poser(A.objet, A.sur);
        break;
      case 'tarer':
        st.tare = brut();
        break;
      case 'verser':
        if (P.liquide) contenuActif().liquide += A.masse;
        else ajouterSolide(contenuActif(), A.produit, A.masse);
        contenuActif().masse += A.masse;
        break;
      case 'gouttes':
        contenuActif().gouttes += A.n;
        contenuActif().masse += A.n * P.masse;
        break;
      case 'pincee':
        ajouterSolide(contenuActif(), A.produit, 3 * P.masse);
        contenuActif().masse += 3 * P.masse;
        break;
      case 'outil':
        if (A.outil === 'entonnoir') st.entonnoirSur = st.actif;
        else st.outil = A.outil;
        break;
      case 'agiter':
        poserHorsBalance();
        dissoudre(1);
        st.outil = null;
        break;
      case 'chauffer':
        st.chaude = true;
        contenuActif().chaud = true;
        break;
      case 'deposer':
        contenuActif().solides.pieces = { q: 3, dissous: 0 };
        contenuActif().masse += 15;
        break;
      case 'appeler':
        ajouterProduitProf(A.produit, P.masse);
        break;
    }
    reglerBalance();
  }

  // Attend la fin d'une animation, sauf si l'élève a quitté ou changé d'étape entre-temps
  function occuper(ms, suite) {
    const enCours = st;
    st.occupe = true;
    setTimeout(() => {
      if (st !== enCours) return;
      st.occupe = false;
      suite();
    }, ms);
  }

  // Action suivante ; à la fin de l'étape : étape réussie (verte), en attente du bouton « Étape suivante »
  function suivante() {
    st.a++;
    if (st.a < st.def.etapes[st.e].actions.length) {
      entrerAction();
      afficher();
      return;
    }
    st.reussie = true;
    App.validerEtape(st.id, st.e);
    majOutils();
    majVerseur();
    afficher();
    const point = document.querySelector(`#labo-etapes [data-etape="${st.e}"]`);
    const r = (point || $('labo-bulle')).getBoundingClientRect();
    Confetti.burst($('confetti'), r.left + r.width / 2, r.top + r.height / 2);
  }

  function etapeSuivante() {
    st.reussie = false;
    st.e++;
    st.a = 0;
    if (st.e >= st.def.etapes.length) {
      st.fini = true;
      afficher();
      return;
    }
    entrerAction();
    afficher();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // Préparation de la scène au début de chaque action
  function entrerAction() {
    const A = action();
    if (A.type === 'agiter') {
      st.agitation = 0;
      // On touille le récipient posé sur la paillasse, pas sur la balance
      if (poserHorsBalance()) majRecipients();
    }
    $('zone-calque').innerHTML = A.type === 'glisser' ? D.zoneDepot(A.objet, ...D.SPOTS[A.sur]) : '';
    majOutils();
    majVerseur();
  }

  // ===== Affichage (bulle, points, rayons, boutons) : refait à chaque changement de langue =====
  function indice(A) {
    switch (A.type) {
      case 'verser': return st.versement ? { cle: 'h_verser', vars: { masse: A.masse } } : { cle: 'h_produit' };
      case 'gouttes': return { cle: st.versement ? 'h_gouttes' : 'h_produit' };
      case 'pincee': return { cle: st.versement ? 'h_pincee' : 'h_produit' };
      case 'appeler': return { cle: st.prof ? 'prof_' + A.produit : 'h_appeler' };
      default: return { cle: 'h_' + A.type };
    }
  }

  function afficher() {
    if (!st) return;
    const etapes = st.def.etapes;
    const validees = etapesValidees();
    $('labo-etapes').innerHTML = etapes.map((e, i) => {
      const faite = i < validees || st.fini || (i === st.e && st.reussie);
      const actuelle = i === st.e && !st.fini;
      // Accessibles : les étapes validées et la première qui reste à faire
      const accessible = faite || actuelle || i === validees;
      return `<button type="button" class="etape-point${faite ? ' fait' : ''}${actuelle ? ' actuel' : ''}" data-etape="${i}"
        ${accessible ? '' : 'disabled'} aria-label="${i + 1}"></button>`;
    }).join('');
    $('labo-bulle').parentElement.classList.toggle('reussie', st.reussie);

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
    const ind = st.reussie ? { cle: 'etape_reussie' } : indice(A);
    dialogue.dire(
      { cle: 'etape_n', vars: { n: st.e + 1, total: etapes.length }, classe: 'bulle__etape' },
      { cle: etapes[st.e].texte },
      { cle: ind.cle, vars: ind.vars, classe: 'bulle__aide' }
    );

    const enCours = !st.reussie;
    const choixProduit = enCours && ['verser', 'gouttes', 'pincee'].includes(A.type) && !st.versement;
    const choixMateriel = enCours && ['placer', 'outil', 'deposer'].includes(A.type);
    $('labo-rayons').hidden = false;
    $('labo-rayons').innerHTML = rayon('produits', st.def.produits, choixProduit) + rayon('materiel', st.def.materiel, choixMateriel);

    let boutons = '';
    if (st.reussie) {
      const derniere = st.e === etapes.length - 1;
      boutons = `<button type="button" class="btn-principal btn-suivante" id="labo-suivante">${h(derniere ? 'terminer' : 'etape_suivante')} →</button>`;
    } else if (['verser', 'gouttes', 'pincee'].includes(A.type) && st.versement) {
      boutons = `<button type="button" class="btn-principal" id="labo-valider">${h('valider')}</button>`;
    } else if (A.type === 'appeler' && !st.prof) {
      boutons = `<button type="button" class="btn-principal btn-appeler" id="labo-appeler">✋ ${h('appeler_btn')}</button>`;
    }
    $('labo-actions').innerHTML = boutons;
    $('labo-jauge').hidden = !enCours || A.type !== 'agiter';
    majJauge();

    // Ce qu'on peut toucher dans la scène clignote
    const svg = $('labo-svg');
    svg.classList.toggle('mode-agiter', enCours && A.type === 'agiter');
    svg.classList.toggle('mode-glisser', enCours && A.type === 'glisser');
    svg.classList.toggle('mode-tapoter', enCours && !!st.versement);
    $('bal-zero').classList.toggle('cible', enCours && A.type === 'tarer');
    if ($('plaque')) $('plaque').classList.toggle('cible', enCours && A.type === 'chauffer');
    if (!enCours) $('zone-calque').innerHTML = '';

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
    if (['verser', 'gouttes', 'pincee'].includes(A.type) && !st.versement) {
      if (id !== A.produit) return erreur(btn, 'e_produit');
      effacerErreur();
      autoriserMouvement();
      st.versement = { produit: id, avant: copie(contenuActif()), n: 0 };
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

  // Pose un récipient à sa place ; ce qui l'occupait est poussé sur la paillasse
  function poser(id, sur) {
    if (!st.recipients[id]) {
      st.recipients[id] = { pos: null, contenu: vide() };
      $('recipients-calque').insertAdjacentHTML('beforeend', D.recipient(id));
    }
    Object.entries(st.recipients).forEach(([autre, r]) => {
      if (autre !== id && r.pos === sur) r.pos = placeLibre(id);
    });
    st.recipients[id].pos = sur;
    st.actif = id;
  }

  function poserHorsBalance() {
    const r = st.recipients[st.actif];
    if (r.pos !== 'balance') return false;
    r.pos = placeLibre(st.actif);
    return true;
  }

  function placer(id, sur) {
    effacerErreur();
    const nouveau = !st.recipients[id];
    poser(id, sur);
    majRecipients(nouveau ? id : null);
    voirScene();
    occuper(750, suivante);
  }

  // nouveau : récipient qui apparaît sur place ; instantane : pas de déplacement animé (retour à une étape)
  function majRecipients(nouveau, instantane) {
    Object.entries(st.recipients).forEach(([id, r]) => {
      const g = $('rec-' + id);
      const [x, y] = D.SPOTS[r.pos];
      const sansAnimation = instantane || id === nouveau;
      if (id === nouveau) g.classList.add('apparait');
      if (sansAnimation) g.classList.add('sans-transition');
      g.style.transform = `translate(${x}px, ${y}px)`;
      if (sansAnimation) {
        void g.getBoundingClientRect();
        g.classList.remove('sans-transition');
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
      g.querySelector('.recipient__touilleur').innerHTML = st.outil === 'spatule' && st.actif === id ? D.touilleur(id) : '';
    });
  }

  // ===== Glisser-déposer un récipient jusqu'à sa place (zone de dépôt invisible) =====
  function pointSvg(e) {
    const svg = $('labo-svg');
    const p = svg.createSVGPoint();
    p.x = e.clientX;
    p.y = e.clientY;
    return p.matrixTransform(svg.getScreenCTM().inverse());
  }

  function prendreRecipient(e) {
    const A = action();
    const [x, y] = D.SPOTS[st.recipients[A.objet].pos];
    const F = D.FORMES[A.objet];
    const p = pointSvg(e);
    // Prise tolérante : un peu autour du récipient
    if (Math.abs(p.x - x) > F.largeur / 2 + 16 || p.y < y - F.haut - 20 || p.y > y + 12) return false;
    deplace = { id: A.objet, x0: p.x, y0: p.y, x, y };
    $('rec-' + A.objet).classList.add('sans-transition', 'en-main');
    return true;
  }

  function deplacerRecipient(e) {
    const p = pointSvg(e);
    deplace.dx = p.x - deplace.x0;
    deplace.dy = p.y - deplace.y0;
    $('rec-' + deplace.id).style.transform = `translate(${deplace.x + deplace.dx}px, ${deplace.y + deplace.dy}px)`;
  }

  function lacherRecipient() {
    const A = action();
    const { id, x, y, dx = 0, dy = 0 } = deplace;
    deplace = null;
    const g = $('rec-' + id);
    g.classList.remove('sans-transition', 'en-main');
    const zone = $('zone-calque').querySelector('.zone-depot').getBBox();
    const cx = x + dx, cy = y + dy - D.FORMES[id].haut / 2;
    if (cx >= zone.x && cx <= zone.x + zone.width && cy >= zone.y && cy <= zone.y + zone.height) {
      effacerErreur();
      $('zone-calque').innerHTML = '';
      poser(id, A.sur);
      majRecipients();
      occuper(750, suivante);
    } else {
      g.style.transform = `translate(${x}px, ${y}px)`;
      if (Math.abs(dx) + Math.abs(dy) > 8) erreur(null, 'e_glisser');
    }
  }

  // ===== Balance =====
  function brut() {
    return Object.entries(st.recipients)
      .filter(([, r]) => r.pos === 'balance')
      .reduce((t, [id, r]) => t + D.FORMES[id].masse + r.contenu.masse, 0);
  }

  // Balance vide : elle revient à zéro (évite les masses négatives, déroutantes pour les élèves)
  function reglerBalance() {
    if (!Object.values(st.recipients).some((r) => r.pos === 'balance')) st.tare = 0;
  }

  function affichage() { return Math.round((brut() - st.tare) * 10) / 10; }

  function majBalance() {
    reglerBalance();
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
    return y - D.niveau(id, contenuActif()) - 4;
  }

  function majVerseur() {
    const calque = $('verseur-calque');
    let html = '';
    if (st.actif && !st.fini && !st.reussie) {
      const A = action();
      if (st.prof) html = D.verseur('verser', st.prof);
      else if (st.versement) html = D.verseur(A.type === 'gouttes' ? 'gouttes' : 'verser', st.versement.produit);
    }
    if (!html) { calque.innerHTML = ''; return; }
    const [ox, oy] = pointVerseur();
    calque.innerHTML = `<g transform="translate(${ox} ${oy})"><g class="verseur">${html}</g></g>`;
  }

  // Particules qui tombent du verseur jusqu'à la surface du contenu
  function chute(produit, nombre) {
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
      const n = nombre || (pastilles ? 3 : 8);
      for (let i = 0; i < n; i++) {
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
    if (!st.versement || !['verser', 'gouttes', 'pincee'].includes(A.type)) return;
    const id = st.actif;
    const c = contenuActif();
    const P = PRODUITS[st.versement.produit];
    st.versement.n++;
    if (A.type === 'verser') {
      chute(st.versement.produit);
      if (P.liquide) c.liquide += A.pas;
      else ajouterSolide(c, st.versement.produit, A.pas);
      c.masse += A.pas;
    } else if (A.type === 'gouttes') {
      chute(st.versement.produit);
      c.gouttes++;
      c.masse += P.masse;
    } else {
      chute(st.versement.produit, 3);
      ajouterSolide(c, st.versement.produit, P.masse);
      c.masse += P.masse;
    }
    setTimeout(() => { if (st) { majContenu(id); majBalance(); } }, 380);
  }

  // Sur téléphone ou tablette, secouer l'appareil verse aussi une dose (comme une tape).
  // iOS demande une autorisation, à solliciter pendant un toucher : on le fait au choix du produit.
  let mouvementDemande = false;
  let derniereSecousse = 0;

  function autoriserMouvement() {
    if (mouvementDemande || typeof DeviceMotionEvent === 'undefined') return;
    mouvementDemande = true;
    if (typeof DeviceMotionEvent.requestPermission === 'function') DeviceMotionEvent.requestPermission().catch(() => {});
  }

  window.addEventListener('devicemotion', (e) => {
    if (!st || st.occupe || st.fini || st.reussie || !st.versement) return;
    const a = e.acceleration;
    const g = e.accelerationIncludingGravity;
    let force;
    if (a && a.x != null) force = Math.hypot(a.x, a.y, a.z);
    else if (g && g.x != null) force = Math.abs(Math.hypot(g.x, g.y, g.z) - 9.81);
    else return;
    const maintenant = performance.now();
    if (force > 14 && maintenant - derniereSecousse > 350) {
      derniereSecousse = maintenant;
      tapoter();
    }
  });

  function valider() {
    const A = action();
    const btn = $('labo-valider');
    const annuler = () => {
      st.recipients[st.actif].contenu = copie(st.versement.avant);
      st.versement.n = 0;
      majContenu(st.actif);
      majBalance();
    };
    const n = st.versement.n;
    if (A.type === 'verser') {
      const m = affichage();
      if (Math.abs(m - A.masse) < 0.05) return reussi();
      if (m < A.masse) return erreur(btn, 'e_pas_assez', { masse: A.masse });
      annuler();
      return erreur(btn, 'e_trop', { masse: A.masse });
    }
    if (A.type === 'pincee') {
      if (n >= A.min && n <= A.max) return reussi();
      if (n < A.min) return erreur(btn, 'e_pincee_moins');
      annuler();
      return erreur(btn, 'e_pincee_plus');
    }
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
      if (!st) return;
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
    st.chaude = true;
    $('plaque').classList.add('chaude');
    $('horloge-labo').classList.add('visible');
    const id = st.actif;
    setTimeout(() => { if (st && st.recipients[id]) { st.recipients[id].contenu.chaud = true; majContenu(id); } }, 900);
    occuper(DUREE_CHAUFFE, () => {
      $('horloge-labo').classList.remove('visible');
      suivante();
    });
  }

  function ajouterProduitProf(produit, quantite) {
    const c = contenuActif();
    if (PRODUITS[produit].liquide) c.liquide += quantite;
    else ajouterSolide(c, produit, quantite);
    c.masse += quantite;
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
      ajouterProduitProf(A.produit, PRODUITS[A.produit].masse / 3);
      setTimeout(() => { if (st === enCours) { majContenu(id); majBalance(); } }, 380);
    }, ms));
    plus(() => { st.prof = null; majVerseur(); prof.classList.remove('present'); }, 2800);
    plus(() => { $('prof-calque').innerHTML = ''; st.occupe = false; suivante(); }, 3500);
  }

  // ===== Touiller : glisser le doigt presque sur place, 10 s de mouvement =====
  function dissoudre(niveau) {
    const c = contenuActif();
    SOLUBLES.forEach((p) => {
      if (c.solides[p] && c.liquide > 0) c.solides[p].dissous = Math.max(c.solides[p].dissous, niveau);
    });
  }

  function agiter(duree, decalage) {
    st.agitation = Math.min(1, st.agitation + duree / DUREE_AGITATION);
    const id = st.actif;
    const tige = document.querySelector(`#rec-${id} .touilleur`);
    if (tige) tige.style.transform = `translateX(${decalage}px) rotate(${decalage / 3}deg)`;
    dissoudre(st.agitation);
    if (!agiter.image) {
      agiter.image = requestAnimationFrame(() => { agiter.image = null; if (st && st.recipients[id]) majContenu(id); });
    }
    majJauge();
    if (st.agitation >= 1) {
      glisse = null;
      st.outil = null;
      occuper(400, suivante);
    }
  }

  function majJauge() {
    $('labo-jauge').firstElementChild.style.width = Math.round((st ? st.agitation : 0) * 100) + '%';
  }

  // ===== Événements =====
  function brancherScene() {
    const svg = $('labo-svg');
    const bloque = () => !st || st.occupe || st.fini || st.reussie;
    svg.addEventListener('click', (e) => {
      if (bloque()) return;
      if (e.target.closest('#bal-zero')) return toucherBalance();
      if (e.target.closest('#plaque')) return toucherPlaque();
      tapoter();
    });
    svg.addEventListener('pointerdown', (e) => {
      if (bloque()) return;
      const type = action().type;
      if (type === 'agiter') {
        glisse = { x: e.clientX, y: e.clientY, t: performance.now(), decalage: 0 };
        svg.setPointerCapture(e.pointerId);
      } else if (type === 'glisser' && prendreRecipient(e)) {
        svg.setPointerCapture(e.pointerId);
      }
    });
    svg.addEventListener('pointermove', (e) => {
      if (deplace) return deplacerRecipient(e);
      if (!glisse) return;
      const dx = e.clientX - glisse.x;
      const d = Math.abs(dx) + Math.abs(e.clientY - glisse.y);
      const maintenant = performance.now();
      // Seul le temps passé à bouger compte (pauses plafonnées)
      const duree = d > 1 ? Math.min(120, maintenant - glisse.t) : 0;
      glisse.t = maintenant;
      glisse.decalage = Math.max(-16, Math.min(16, glisse.decalage + dx));
      glisse.x = e.clientX;
      glisse.y = e.clientY;
      if (duree) agiter(duree, glisse.decalage);
    });
    const lacher = () => {
      glisse = null;
      if (deplace) lacherRecipient();
    };
    svg.addEventListener('pointerup', lacher);
    svg.addEventListener('pointercancel', lacher);
  }

  $('labo-rayons').addEventListener('click', (e) => {
    const b = e.target.closest('.labo-objet');
    if (!b || !st || st.occupe || st.fini || st.reussie) return;
    choisir(b.dataset.rayon, b.dataset.id, b);
  });

  $('labo-actions').addEventListener('click', (e) => {
    const b = e.target.closest('button');
    if (!b || !st || st.occupe) return;
    if (b.id === 'labo-valider') valider();
    else if (b.id === 'labo-appeler') appeler();
    else if (b.id === 'labo-suivante') etapeSuivante();
    else if (b.id === 'labo-medaille') {
      const id = st.id;
      st = null;
      App.recompenser(id);
    }
  });

  // Retour à une étape déjà validée (ou à l'étape en cours)
  $('labo-etapes').addEventListener('click', (e) => {
    const b = e.target.closest('[data-etape]');
    if (!b || b.disabled || !st || st.occupe) return;
    const i = Number(b.dataset.etape);
    if (i === st.e && !st.fini && !st.reussie) return;
    allerA(st.id, i);
  });

  window.Labo = { demarrer, afficher };
})();
