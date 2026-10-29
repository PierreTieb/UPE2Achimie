// i18n.js
// Moteur de traduction. Trois niveaux :
//  - 'fr'      Non guidé : tout en français.
//  - 'aide'    Texte en français, mots de vocabulaire cliquables (ou l'inverse si etat.inverse).
//  - 'traduit' Tout dans la langue choisie.
// Les éléments HTML portant data-t="clé" suivent la langue du texte ;
// ceux portant data-tl="clé" sont toujours dans la langue choisie par l'élève.

(function () {
  // Ordre d'affichage des langues (les fichiers absents sont ignorés)
  const ORDRE = ['fr', 'en', 'es', 'ar', 'zh', 'pt', 'de', 'tr', 'uk', 'ro', 'fa', 'ps', 'bn', 'syl', 'ta', 'si', 'ku', 'kab'];
  const MARQUE = /\[\[(\w+)\|([^\]]+)\]\]/g;

  function echapper(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  const I18n = {
    etat: { langue: null, mode: null, inverse: false },

    langues() { return ORDRE.filter((c) => LANGUES[c]).map((c) => LANGUES[c]); },
    info(l) { return LANGUES[l] || LANGUES.fr; },
    dir(l) { return this.info(l).dir || 'ltr'; },

    langueTexte() {
      const { langue, mode, inverse } = this.etat;
      if (!langue || langue === 'fr' || !mode || mode === 'fr') return 'fr';
      if (mode === 'traduit') return langue;
      return inverse ? langue : 'fr';
    },

    aideActive() {
      const { langue, mode } = this.etat;
      return mode === 'aide' && !!langue && langue !== 'fr';
    },

    brut(cle, l) {
      const t = this.info(l || this.langueTexte()).textes[cle];
      if (t != null) return t;
      return LANGUES.fr.textes[cle] != null ? LANGUES.fr.textes[cle] : cle;
    },

    // HTML prêt à injecter ; mots cliquables seulement en mode Aide, dans la langue du texte
    html(cle, l, vars) {
      l = l || this.langueTexte();
      let s = echapper(this.brut(cle, l));
      if (vars) Object.keys(vars).forEach((k) => { s = s.split('{' + k + '}').join(vars[k]); });
      const cliquable = this.aideActive() && l === this.langueTexte();
      return s.replace(MARQUE, (m, k, surface) => cliquable
        ? `<span class="mot" role="button" tabindex="0" data-mot="${k}" data-l="${l}">${surface}</span>`
        : surface);
    },

    // Texte brut (pour la synthèse vocale)
    texte(cle, l, vars) {
      let s = this.brut(cle, l || this.langueTexte());
      if (vars) Object.keys(vars).forEach((k) => { s = s.split('{' + k + '}').join(vars[k]); });
      return s.replace(MARQUE, '$2');
    },

    mot(k, l) { return this.info(l).mots[k] || LANGUES.fr.mots[k] || k; },

    poser(el, cle, l) {
      el.innerHTML = this.html(cle, l);
      el.dir = this.dir(l);
      el.lang = l;
    },

    appliquer(racine) {
      const r = racine || document;
      const lt = this.langueTexte();
      const lc = this.etat.langue || 'fr';
      r.querySelectorAll('[data-t]').forEach((el) => this.poser(el, el.dataset.t, lt));
      r.querySelectorAll('[data-tl]').forEach((el) => this.poser(el, el.dataset.tl, lc));
    }
  };

  window.I18n = I18n;
})();
