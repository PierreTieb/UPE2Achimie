// securite.js
// Module Sécurité : table d'objets → habillage du mannequin (yeux, vêtements, mains)
// → les 3 interdits → questionnaire → médaille.
// Tout l'affichage est reconstruit depuis l'état `s`, ce qui permet de changer de
// niveau ou de langue en cours de route sans perdre la progression.

(function () {
  const ETAPES = ['table', 'yeux', 'vet', 'mains', 'interdits', 'quiz'];
  // Ordre des objets sur la table : les objets utiles sont mélangés aux autres
  const OBJETS = ['casque', 'lunettes', 'parapluie', 'gantBoxe', 'masque', 'blouse', 'lunettesSoleil',
    'stethoscope', 'bottes', 'echarpe', 'couteau', 'gants', 'charlotte', 'coudiere'];
  const BESOIN = { yeux: 'lunettes', vet: 'blouse', mains: 'gants' };
  const ILLU = { yeux: 'yeux', vet: 'vetements', mains: 'brulure' };
  const SUITE = { yeux: 'vet', vet: 'mains', mains: 'interdits', interdits: 'quiz' };
  const INTERDITS = ['tremper', 'gouter', 'sentir'];

  // Questionnaire : 3 propositions, une seule vraie, dans l'ordre voulu par le professeur.
  // type 'images' : question en texte, réponses en images ; type 'textes' : situation illustrée, réponses en texte.
  // expl : clé du texte qui remplace une réponse fausse.
  const QUIZ = [
    { q: 'q1', type: 'images', options: [
      { id: 'q1a', img: () => Dessins.personnage({}), expl: 'q1_e' },
      { id: 'q1b', img: () => Dessins.personnage({ lunettes: 'tete' }), expl: 'q1_e' },
      { id: 'q1c', img: () => Dessins.personnage({ lunettes: 'yeux' }), bon: true }
    ] },
    { q: 'q2', type: 'textes', situation: () => Dessins.illu('becher'), options: [
      { id: 'q2a', expl: 'q2a_e' },
      { id: 'q2b', expl: 'q2b_e' },
      { id: 'q2c', bon: true }
    ] },
    { q: 'q3', type: 'images', options: [
      { id: 'q3a', img: () => Dessins.personnage({ poches: true }), legende: true, expl: 'q3a_e' },
      { id: 'q3b', img: () => Dessins.illu('robinet'), legende: true, bon: true },
      { id: 'q3c', img: () => Dessins.personnage({ panique: true }), legende: true, expl: 'q3c_e' }
    ] },
    { q: 'q4', type: 'textes', situation: () => Dessins.camarades(), options: [
      { id: 'q4a', bon: true },
      { id: 'q4b', expl: 'q4b_e' },
      { id: 'q4c', expl: 'q4c_e' }
    ] }
  ];

  const $ = (id) => document.getElementById(id);
  const h = (cle, vars) => I18n.html(cle, null, vars);

  let s = null;
  const dialogue = Dialogue.creer($('secu-mascotte'), $('secu-bulle'), $('secu-ecouter'));
  const dire = (cle, vars) => dialogue.dire({ cle, vars });

  function demarrer() {
    s = {
      etape: 'table',
      inventaire: [],
      retires: [],
      porte: [],
      nouveau: null,
      phase: 'question',
      tableCible: null,
      q: 0,
      qPhase: 'question',
      qFaux: [],
      erreur: null
    };
    dialogue.oublier();
  }

  // ===== Affichage =====
  function afficher() {
    if (!s) demarrer();
    const idx = ETAPES.indexOf(s.etape);
    $('secu-etapes').innerHTML = ETAPES.map((e, i) =>
      `<span class="etape-point${i < idx ? ' fait' : ''}${i === idx ? ' actuel' : ''}"></span>`).join('');

    if (s.etape === 'table' || s.tableCible) vueTable();
    else if (BESOIN[s.etape]) vueHabillage();
    else if (s.etape === 'interdits') vueInterdits();
    else vueQuiz();

    $('inventaire').hidden = !(s.etape === 'table' || BESOIN[s.etape]);
    afficherInventaire();
    // Le message d'erreur reste affiché (et suit la langue) jusqu'au bon choix
    if (s.erreur) App.toast(h(s.erreur), { persistant: true });
    else App.cacherToast(true);
  }

  // Mauvais objet : message persistant, qui tremble si l'erreur se répète
  function signalerErreur(cle) {
    const repetee = s.erreur === cle;
    s.erreur = cle;
    App.toast(h(cle), { persistant: true, secouer: repetee });
  }

  function effacerErreur() {
    s.erreur = null;
    App.cacherToast(true);
  }

  function afficherInventaire(arrivee) {
    const choisir = BESOIN[s.etape] && !s.tableCible && s.phase === 'question';
    $('inventaire-cases').innerHTML = s.inventaire.length
      ? s.inventaire.map((o) => `<button type="button" class="case${choisir ? ' choisir' : ''}${o === arrivee ? ' arrive' : ''}" data-objet="${o}" ${choisir ? '' : 'tabindex="-1"'}>${Dessins.objet(o)}</button>`).join('')
      : `<span class="inventaire__vide">${h('inventaire_vide')}</span>`;
  }

  // --- La table ---
  function vueTable() {
    dire(s.tableCible ? 's_table_' + s.tableCible : 's_intro');
    const visibles = OBJETS.filter((o) => !s.inventaire.includes(o) && !s.retires.includes(o) && !s.porte.includes(o));
    $('secu-scene').innerHTML = `<div class="table-labo">
      <div class="table-labo__plateau">
        ${visibles.map((o) => `<button type="button" class="objet" data-objet="${o}">
          <span class="objet__img">${Dessins.objet(o)}</span>
          <span class="objet__nom">${h('obj_' + o)}</span></button>`).join('')}
      </div>
      <div class="table-labo__pieds"></div></div>`;
    $('secu-actions').innerHTML = s.tableCible ? ''
      : `<button type="button" class="btn-principal" id="secu-fini">${h('jai_fini')}</button>`;
  }

  function prendre(o, btn) {
    if (s.tableCible) {
      if (o !== BESOIN[s.tableCible]) {
        App.secouer(btn);
        signalerErreur('s_pas_celui');
        return;
      }
      effacerErreur();
      ajouterInventaire(o, btn, () => setTimeout(() => { s.tableCible = null; afficherEnHaut(); }, 350));
      return;
    }
    if (o === 'couteau') {
      s.retires.push('couteau');
      App.secouer(btn);
      App.modale({
        ico: `<span class="modale__danger">${Dessins.objet('couteau')}</span>`,
        texte: h('s_couteau'),
        boutons: [{ cle: 'jai_compris', action: () => retirerDeLaTable(btn) }]
      });
      return;
    }
    ajouterInventaire(o, btn);
  }

  function ajouterInventaire(o, btn, fin) {
    s.inventaire.push(o);
    btn.classList.add('pris');
    afficherInventaire(o);
    const caseEl = document.querySelector(`#inventaire-cases [data-objet="${o}"]`);
    voler(Dessins.objet(o), btn.querySelector('.objet__img'), caseEl, () => {
      caseEl.classList.remove('arrive');
      retirerDeLaTable(btn);
      if (fin) fin();
    });
  }

  // L'objet rétrécit puis libère sa place : les autres se resserrent
  function retirerDeLaTable(btn) {
    btn.classList.add('disparait');
    setTimeout(() => btn.remove(), 350);
  }

  // Une copie de l'objet glisse d'un endroit à un autre
  function voler(html, depuis, vers, fin) {
    const a = depuis.getBoundingClientRect();
    const b = vers.getBoundingClientRect();
    const c = document.createElement('div');
    c.className = 'volant';
    c.innerHTML = html;
    Object.assign(c.style, { left: a.left + 'px', top: a.top + 'px', width: a.width + 'px', height: a.height + 'px' });
    document.body.appendChild(c);
    const echelle = Math.min(b.width / a.width, b.height / a.height);
    const dx = b.left + b.width / 2 - (a.left + a.width * echelle / 2);
    const dy = b.top + b.height / 2 - (a.top + a.height * echelle / 2);
    requestAnimationFrame(() => requestAnimationFrame(() => {
      c.style.transform = `translate(${dx}px, ${dy}px) scale(${echelle})`;
    }));
    let fini = false;
    const terminer = () => { if (fini) return; fini = true; c.remove(); if (fin) fin(); };
    c.addEventListener('transitionend', terminer, { once: true });
    setTimeout(terminer, 900);
  }

  // --- Le mannequin ---
  function vueHabillage() {
    const z = s.etape;
    const ok = s.phase === 'ok';
    dire(ok ? `s_${z}_ok` : `s_${z}`);
    const illu = z === 'mains' && ok ? 'rincer' : ILLU[z];
    $('secu-scene').innerHTML = `<div class="habillage">
      <div class="habillage__mannequin">${Dessins.mannequin(s.porte, s.nouveau)}</div>
      <div class="habillage__illu">${Dessins.illu(illu)}</div></div>`;
    s.nouveau = null;
    const manque = !ok && !s.inventaire.includes(BESOIN[z]);
    if (ok) {
      $('secu-actions').innerHTML = `<button type="button" class="btn-principal" id="secu-compris">${h('jai_compris')}</button>`;
    } else if (manque) {
      $('secu-actions').innerHTML = `<div class="alerte" dir="${I18n.dir(I18n.langueTexte())}">${h('s_manque')}</div>
        <button type="button" class="btn-principal" id="secu-table">${h('aller_table')}</button>`;
    } else {
      $('secu-actions').innerHTML = '';
    }
  }

  function choisir(o, caseEl) {
    const z = s.etape;
    if (o !== BESOIN[z]) {
      App.secouer(caseEl);
      signalerErreur('s_faux_' + z);
      return;
    }
    effacerErreur();
    const zone = document.querySelector('.habillage .zone-' + o);
    caseEl.style.visibility = 'hidden';
    voler(Dessins.objet(o), caseEl, zone, () => {
      s.inventaire = s.inventaire.filter((x) => x !== o);
      s.porte.push(o);
      s.nouveau = o;
      s.phase = 'ok';
      afficher();
    });
  }

  // --- Les 3 interdits ---
  function vueInterdits() {
    dire('s_interdits');
    $('secu-scene').innerHTML = `<div class="interdits">
      ${INTERDITS.map((k, i) => `<figure class="interdit" style="--d:${i * 1.3}s">
        ${Dessins.interdit(k)}<figcaption>${h('s_int_' + k)}</figcaption></figure>`).join('')}</div>`;
    $('secu-actions').innerHTML = `<button type="button" class="btn-principal apparait-tard" id="secu-compris">${h('jai_compris')}</button>`;
  }

  // --- Questionnaire ---
  // Une réponse fausse est entourée de rouge et remplacée par son explication
  function contenuOption(Q, o) {
    if (s.qFaux.includes(o.id)) return `<span class="quiz-option__expl">${h(o.expl)}</span>`;
    if (Q.type === 'textes') return `<span class="quiz-option__nom">${h(o.id)}</span>`;
    return `<span class="quiz-option__img">${o.img()}</span>${o.legende ? `<span class="quiz-option__nom">${h(o.id)}</span>` : ''}`;
  }

  function vueQuiz() {
    const Q = QUIZ[s.q];
    dire(Q.q);
    const fini = s.qPhase === 'ok';
    const dir = I18n.dir(I18n.langueTexte());
    $('secu-scene').innerHTML = `
      <p class="quiz-num" dir="${dir}">${h('question_n', { n: s.q + 1, total: QUIZ.length })}</p>
      ${Q.situation ? `<div class="quiz-situation">${Q.situation()}</div>` : ''}
      <div class="quiz-options quiz-options--${Q.type}">
        ${Q.options.map((o) => {
          const faux = s.qFaux.includes(o.id);
          const bon = fini && o.bon;
          return `<button type="button" class="quiz-option${faux ? ' faux' : ''}${bon ? ' bon' : ''}" data-o="${o.id}"${faux || fini ? ' aria-disabled="true"' : ''} dir="${dir}">${contenuOption(Q, o)}</button>`;
        }).join('')}
      </div>`;
    $('secu-actions').innerHTML = '';
  }

  function repondre(id) {
    const o = QUIZ[s.q].options.find((x) => x.id === id);
    if (o.bon) {
      s.qPhase = 'ok';
      afficher();
      const r = document.querySelector(`.quiz-option[data-o="${id}"]`).getBoundingClientRect();
      Confetti.burst($('confetti'), r.left + r.width / 2, r.top + r.height / 2);
      // Passage automatique, sauf si l'élève a quitté ou recommencé entre-temps
      const enCours = s, q = s.q;
      setTimeout(() => { if (s === enCours && s.q === q) questionSuivante(); }, 2000);
    } else {
      s.qFaux.push(id);
      afficher();
      App.secouer(document.querySelector(`.quiz-option[data-o="${id}"]`));
    }
  }

  function questionSuivante() {
    s.q++;
    s.qPhase = 'question';
    s.qFaux = [];
    if (s.q >= QUIZ.length) {
      s = null;
      App.recompenser('securite');
      return;
    }
    afficherEnHaut();
  }

  function etapeSuivante() {
    s.etape = SUITE[s.etape];
    s.phase = 'question';
    afficherEnHaut();
  }

  // Nouvelle vue : on remonte pour que la bulle de la mascotte soit visible
  function afficherEnHaut() {
    afficher();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // ===== Événements (délégués : le contenu est reconstruit à chaque affichage) =====
  $('secu-scene').addEventListener('click', (e) => {
    const obj = e.target.closest('.objet');
    if (obj && !obj.classList.contains('pris') && !obj.classList.contains('disparait')) {
      prendre(obj.dataset.objet, obj);
      return;
    }
    const opt = e.target.closest('.quiz-option');
    // Pas d'attribut disabled : il bloquerait aussi le clic sur les mots à traduire
    if (opt && opt.getAttribute('aria-disabled') !== 'true') repondre(opt.dataset.o);
  });

  $('secu-actions').addEventListener('click', (e) => {
    const id = e.target.closest('button') && e.target.closest('button').id;
    if (id === 'secu-fini') {
      s.etape = 'yeux';
      s.phase = 'question';
      afficherEnHaut();
    } else if (id === 'secu-compris') {
      etapeSuivante();
    } else if (id === 'secu-table') {
      s.tableCible = s.etape;
      s.erreur = null;
      afficherEnHaut();
    }
  });

  $('inventaire-cases').addEventListener('click', (e) => {
    const c = e.target.closest('.case');
    if (c && c.classList.contains('choisir')) choisir(c.dataset.objet, c);
  });

  window.Securite = { demarrer, afficher };
})();
