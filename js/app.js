// app.js
// Navigation entre écrans, état sauvegardé, réglages, traduction des mots au toucher,
// médailles et déverrouillage des ateliers.

(function () {
  const CLE = 'atelier-chimie-upe2a';
  const ECRANS_AVEC_REGLAGES = ['ateliers', 'securite', 'labo'];
  const MEDAILLES = ['securite', 'bleue', 'tresor', 'lumiere'];
  // Le mot « langue » qui défile sur le bouton d'accueil : français, puis langues les plus courantes
  const MOTS_LANGUE = [
    ['Langue', 'fr'], ['Language', 'en'], ['Idioma', 'es'], ['اللغة', 'ar', 'rtl'], ['语言', 'zh'],
    ['Língua', 'pt'], ['Sprache', 'de'], ['Dil', 'tr'], ['Мова', 'uk'], ['Limbă', 'ro'],
    ['زبان', 'fa', 'rtl'], ['ژبه', 'ps', 'rtl'], ['ভাষা', 'bn'], ['மொழி', 'ta'], ['භාෂාව', 'si'],
    ['Ziman', 'ku'], ['Tutlayt', 'kab']
  ];

  const $ = (id) => document.getElementById(id);

  function lire() {
    try { return JSON.parse(localStorage.getItem(CLE)) || {}; } catch (e) { return {}; }
  }
  function sauver() {
    try { localStorage.setItem(CLE, JSON.stringify(etat)); } catch (e) { /* stockage indisponible */ }
  }

  const etat = Object.assign({ langue: null, mode: null, inverse: false, medailles: {} }, lire());
  I18n.etat = etat;

  let ecran = 'accueil';
  let medailleEnVol = null;

  // ===== Navigation =====
  const surAffichage = {
    langue: afficherLangues,
    niveau: afficherNiveaux,
    ateliers: afficherAteliers,
    securite: () => Securite.afficher(),
    labo: () => Labo.afficher()
  };

  function montrer(nom) {
    document.querySelectorAll('.screen').forEach((s) => s.classList.toggle('active', s.id === 'screen-' + nom));
    ecran = nom;
    document.body.dataset.ecran = nom;
    $('btn-reglages').hidden = !ECRANS_AVEC_REGLAGES.includes(nom);
    fermerTraduction();
    cacherToast();
    Voix.arreter();
    rafraichir();
    window.scrollTo(0, 0);
  }

  function rafraichir() {
    I18n.appliquer();
    if (surAffichage[ecran]) surAffichage[ecran]();
  }

  document.querySelectorAll('[data-retour]').forEach((b) => {
    b.addEventListener('click', () => montrer(b.dataset.retour));
  });

  // ===== Accueil =====
  $('accueil-mascotte').innerHTML = Dessins.mascotte();
  $('btn-langue-globe').innerHTML = Dessins.globe();
  $('btn-langue').addEventListener('click', () => montrer('langue'));

  let iMot = 0;
  setInterval(() => {
    iMot = (iMot + 1) % MOTS_LANGUE.length;
    const [mot, lang, dir] = MOTS_LANGUE[iMot];
    const el = $('mot-langue');
    el.textContent = mot;
    el.lang = lang;
    el.dir = dir || 'ltr';
    el.classList.remove('entre');
    void el.offsetWidth;
    el.classList.add('entre');
  }, 1000);

  // ===== Langue =====
  $('langue-globe').innerHTML = Dessins.globe();

  function afficherLangues() {
    $('liste-langues').innerHTML = I18n.langues().map((l) => `
      <button type="button" class="langue${etat.langue === l.code ? ' actif' : ''}" data-langue="${l.code}">
        <span class="langue__nom" lang="${l.code}" dir="${l.dir}">${l.nom}</span>
        ${l.code !== 'fr' ? `<span class="langue__fr">${l.nomFr}</span>` : ''}
      </button>`).join('');
  }

  $('liste-langues').addEventListener('click', (e) => {
    const b = e.target.closest('[data-langue]');
    if (!b) return;
    etat.langue = b.dataset.langue;
    etat.inverse = false;
    if (etat.langue === 'fr') {
      etat.mode = 'fr';
      sauver();
      montrer('ateliers');
    } else {
      sauver();
      montrer('niveau');
    }
  });

  // ===== Niveau =====
  function afficherNiveaux() {
    const code = (etat.langue || 'fr').toUpperCase().slice(0, 2);
    document.querySelector('[data-ico="fr"]').innerHTML = Dessins.bulleNiveau('FR', '#3F7FE0');
    document.querySelector('[data-ico="aide"]').innerHTML = Dessins.bulleNiveau('FR', '#3F7FE0', true);
    document.querySelector('[data-ico="traduit"]').innerHTML = Dessins.bulleNiveau(code, '#2F9E5E');
    document.querySelectorAll('.niveau').forEach((b) => b.classList.toggle('actif', b.dataset.mode === etat.mode));
  }

  document.querySelectorAll('.niveau').forEach((b) => {
    b.addEventListener('click', () => {
      etat.mode = b.dataset.mode;
      sauver();
      montrer('ateliers');
    });
  });

  // ===== Mode de travail =====
  const FONDS = { secu: Dessins.fondSecu, bleue: Dessins.fondBleue, tresor: Dessins.fondTresor, lumiere: Dessins.fondLumiere };
  document.querySelectorAll('[data-fond]').forEach((el) => { el.innerHTML = FONDS[el.dataset.fond](); });
  document.querySelectorAll('.carte__cadenas').forEach((el) => { el.innerHTML = Dessins.cadenas(); });

  function afficherAteliers() {
    $('medailles').innerHTML = MEDAILLES.map((m) => {
      const gagnee = !!etat.medailles[m] && m !== medailleEnVol;
      return `<span class="medaille-case${gagnee ? ' gagnee' : ''}" data-medaille="${m}">${Dessins.medaille(gagnee, m)}</span>`;
    }).join('');
    const ouvert = !!etat.medailles.securite && medailleEnVol !== 'securite';
    document.querySelectorAll('.carte[data-atelier]').forEach((c) => {
      if (!c.classList.contains('deverrouillage')) c.classList.toggle('verrouillee', !ouvert);
    });
  }

  $('carte-secu').addEventListener('click', () => {
    Securite.demarrer();
    montrer('securite');
  });

  document.querySelectorAll('.carte[data-atelier]').forEach((c) => {
    c.addEventListener('click', () => {
      if (c.classList.contains('verrouillee')) {
        secouer(c);
        toast(I18n.html('verrou'));
      } else {
        Labo.demarrer(c.dataset.atelier);
        montrer('labo');
      }
    });
  });

  // ===== Médaille gagnée : apparition au centre, confettis, vol vers son emplacement =====
  function recompenser(id) {
    if (etat.medailles[id]) { montrer('ateliers'); return; }
    etat.medailles[id] = true;
    sauver();
    medailleEnVol = id;
    montrer('ateliers');

    const voile = document.createElement('div');
    voile.className = 'badge-voile';
    voile.innerHTML = `<div class="badge-vol"><div class="badge-geant">${Dessins.medaille(true, id)}</div></div>
      <p class="badge-texte" dir="${I18n.dir(I18n.langueTexte())}">${I18n.html('badge_gagne')}</p>`;
    document.body.appendChild(voile);

    const canvas = $('confetti');
    Confetti.burst(canvas);
    setTimeout(() => Confetti.burst(canvas, innerWidth * 0.25, innerHeight * 0.45), 300);
    setTimeout(() => Confetti.burst(canvas, innerWidth * 0.75, innerHeight * 0.45), 600);

    setTimeout(() => {
      const vol = voile.querySelector('.badge-vol');
      const cible = document.querySelector(`.medaille-case[data-medaille="${id}"]`);
      const a = vol.getBoundingClientRect();
      const b = cible.getBoundingClientRect();
      const dx = b.left + b.width / 2 - (a.left + a.width / 2);
      const dy = b.top + b.height / 2 - (a.top + a.height / 2);
      voile.classList.add('part');
      vol.style.transform = `translate(${dx}px, ${dy}px) scale(${b.width / a.width})`;
      vol.addEventListener('transitionend', () => {
        medailleEnVol = null;
        cible.classList.add('gagnee', 'arrivee');
        cible.innerHTML = Dessins.medaille(true, id);
        voile.remove();
        if (id === 'securite') setTimeout(deverrouiller, 150);
      }, { once: true });
    }, 2300);
  }

  // Les cadenas sautent : d'abord l'atelier du centre, puis celui de gauche, puis celui de droite
  function deverrouiller() {
    ['tresor', 'bleue', 'lumiere'].forEach((a, i) => {
      const c = document.querySelector(`.carte[data-atelier="${a}"]`);
      c.style.setProperty('--delai', i * 140 + 'ms');
      c.classList.add('deverrouillage');
      c.classList.remove('verrouillee');
    });
    setTimeout(() => {
      document.querySelectorAll('.carte[data-atelier]').forEach((c) => c.classList.remove('deverrouillage'));
    }, 1600);
  }

  // ===== Réglages (toujours dans la langue choisie par l'élève) =====
  $('btn-reglages').innerHTML = Dessins.engrenage();
  $('btn-reglages').addEventListener('click', ouvrirReglages);
  $('reglages').addEventListener('click', (e) => { if (e.target === $('reglages')) fermerReglages(); });

  function ouvrirReglages() {
    const l = etat.langue || 'fr';
    const t = (k) => I18n.html(k, l);
    const dir = I18n.dir(l);
    const niveaux = l === 'fr' ? '' : `
      <p class="reglages__rubrique" dir="${dir}">${t('reglages_niveau')}</p>
      <div class="reglages__niveaux">
        ${[['fr', 'niveau_fr_titre'], ['aide', 'niveau_aide_titre'], ['traduit', 'niveau_trad_titre']].map(([m, k]) =>
          `<button type="button" class="choix${etat.mode === m ? ' actif' : ''}" data-mode="${m}"><span dir="${dir}">${t(k)}</span></button>`).join('')}
      </div>
      ${etat.mode === 'aide' ? `
        <button type="button" class="interrupteur${etat.inverse ? ' actif' : ''}" id="reglage-inverse">
          <span class="interrupteur__txt"><span class="interrupteur__titre" dir="${dir}">${t('reglages_inverse_titre')}</span>
          <span class="interrupteur__desc" dir="${dir}">${t('reglages_inverse_desc')}</span></span>
          <span class="interrupteur__bouton"></span>
        </button>` : ''}`;
    $('reglages-carte').innerHTML = `
      <div class="reglages__entete"><span class="reglages__ico">${Dessins.engrenage()}</span>
        <h2 dir="${dir}">${t('reglages_titre')}</h2></div>
      ${niveaux}
      <button type="button" class="btn-secondaire" id="reglage-langue">${Dessins.globe()}<span dir="${dir}">${t('reglages_langue')}</span></button>
      <button type="button" class="btn-secondaire btn-secondaire--danger" id="reglage-reset"><span dir="${dir}">${t('reglages_reset')}</span></button>
      <button type="button" class="btn-principal" id="reglage-fermer"><span dir="${dir}">${t('fermer')}</span></button>`;

    $('reglages-carte').querySelectorAll('[data-mode]').forEach((b) => b.addEventListener('click', () => {
      etat.mode = b.dataset.mode;
      if (etat.mode !== 'aide') etat.inverse = false;
      sauver();
      ouvrirReglages();
      rafraichir();
    }));
    const inv = $('reglage-inverse');
    if (inv) inv.addEventListener('click', () => {
      etat.inverse = !etat.inverse;
      sauver();
      ouvrirReglages();
      rafraichir();
    });
    $('reglage-langue').addEventListener('click', () => { fermerReglages(); montrer('langue'); });
    $('reglage-reset').addEventListener('click', () => {
      modale({
        ico: Dessins.engrenage(),
        texte: t('reglages_reset_confirm'),
        langue: l,
        boutons: [
          { cle: 'non' },
          { cle: 'oui', danger: true, action: () => {
            try { localStorage.removeItem(CLE); } catch (e) { /* rien */ }
            Object.assign(etat, { langue: null, mode: null, inverse: false, medailles: {} });
            fermerReglages();
            montrer('accueil');
          } }
        ]
      });
    });
    $('reglage-fermer').addEventListener('click', fermerReglages);
    $('reglages').hidden = false;
  }

  function fermerReglages() { $('reglages').hidden = true; }

  // ===== Fenêtre modale =====
  function modale({ ico, texte, boutons, langue }) {
    const l = langue || I18n.langueTexte();
    $('modale-ico').innerHTML = ico || '';
    $('modale-texte').innerHTML = texte;
    $('modale-texte').dir = I18n.dir(l);
    $('modale-boutons').innerHTML = '';
    boutons.forEach((b) => {
      const el = document.createElement('button');
      el.type = 'button';
      el.className = b.danger ? 'btn-principal btn-principal--danger' : (boutons.length > 1 ? 'btn-secondaire' : 'btn-principal');
      el.innerHTML = I18n.html(b.cle, l);
      el.addEventListener('click', () => {
        $('modale').hidden = true;
        if (b.action) b.action();
      });
      $('modale-boutons').appendChild(el);
    });
    $('modale').hidden = false;
  }

  // ===== Petits messages =====
  // persistant : le message reste affiché (mots cliquables) jusqu'à cacherToast() ;
  // secouer : le message tremble (même erreur répétée)
  let minuteurToast = null;
  function toast(html, { persistant = false, secouer: trembler = false } = {}) {
    const t = $('toast');
    const bulle = $('toast-bulle');
    bulle.innerHTML = html;
    bulle.dir = I18n.dir(I18n.langueTexte());
    t.classList.add('visible');
    t.classList.toggle('persistant', persistant);
    clearTimeout(minuteurToast);
    if (!persistant) minuteurToast = setTimeout(() => cacherToast(), 2400);
    if (trembler) secouer(bulle);
  }

  function cacherToast(seulementPersistant) {
    const t = $('toast');
    if (seulementPersistant && !t.classList.contains('persistant')) return;
    t.classList.remove('visible', 'persistant');
  }

  function secouer(el) {
    el.classList.remove('secoue');
    void el.offsetWidth;
    el.classList.add('secoue');
  }

  // ===== Mode Aide : traduction d'un mot au toucher =====
  const pop = $('trad-pop');

  function ouvrirTraduction(el) {
    const k = el.dataset.mot;
    const src = el.dataset.l;
    const cible = src === 'fr' ? etat.langue : 'fr';
    const trad = I18n.mot(k, cible);
    pop.innerHTML = `<span class="trad-pop__src" lang="${src}" dir="${I18n.dir(src)}">${el.textContent}</span>
      <span class="trad-pop__fleche">→</span>
      <span class="trad-pop__trad" lang="${cible}" dir="${I18n.dir(cible)}">${trad}</span>
      <button type="button" class="trad-pop__son">${Dessins.hautParleur()}</button>`;
    pop.querySelector('.trad-pop__son').addEventListener('click', () => Voix.parler(trad, cible));
    pop.hidden = false;
    const r = el.getBoundingClientRect();
    const w = pop.offsetWidth, h = pop.offsetHeight;
    const left = Math.max(8, Math.min(innerWidth - w - 8, r.left + r.width / 2 - w / 2));
    let top = r.bottom + 8;
    if (top + h > innerHeight - 8) top = r.top - h - 8;
    pop.style.left = left + 'px';
    pop.style.top = top + 'px';
    document.querySelectorAll('.mot.ouvert').forEach((m) => m.classList.remove('ouvert'));
    el.classList.add('ouvert');
  }

  function fermerTraduction() {
    pop.hidden = true;
    document.querySelectorAll('.mot.ouvert').forEach((m) => m.classList.remove('ouvert'));
  }

  // Capture : un mot cliquable dans un bouton ne déclenche pas le bouton
  document.addEventListener('click', (e) => {
    const m = e.target.closest('.mot');
    if (m) {
      e.stopPropagation();
      e.preventDefault();
      ouvrirTraduction(m);
      return;
    }
    if (!e.target.closest('#trad-pop')) fermerTraduction();
  }, true);
  document.addEventListener('keydown', (e) => {
    if ((e.key === 'Enter' || e.key === ' ') && e.target.classList && e.target.classList.contains('mot')) {
      e.preventDefault();
      ouvrirTraduction(e.target);
    }
  });
  window.addEventListener('scroll', fermerTraduction, { passive: true });
  window.addEventListener('resize', fermerTraduction);

  window.App = { etat, sauver, montrer, rafraichir, recompenser, modale, toast, cacherToast, secouer };
})();
