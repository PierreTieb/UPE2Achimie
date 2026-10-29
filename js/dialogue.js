// dialogue.js
// Mascotte + bulle de texte + bouton Écouter, partagés par la sécurité et les ateliers.
// dire() accepte un ou plusieurs morceaux : 'cle' ou { cle, vars, classe }.
// La bulle ne se ré-anime que si la consigne change : une ligne d'aide (classe bulle__aide)
// qui change seule est mise à jour discrètement.

(function () {
  function creer(mascotteEl, texteEl, ecouterEl) {
    mascotteEl.innerHTML = Dessins.mascotte();
    ecouterEl.innerHTML = Dessins.hautParleur();
    let morceaux = [];
    let signature = null;
    let minuteur = null;

    ecouterEl.addEventListener('click', () => {
      const texte = morceaux.map((m) => I18n.texte(m.cle, null, m.vars)).join(' ');
      const lu = Voix.parler(texte, I18n.langueTexte(),
        () => mascotteEl.classList.add('parle'), () => mascotteEl.classList.remove('parle'));
      if (!lu) App.secouer(ecouterEl);
    });

    function dire(...liste) {
      morceaux = liste.filter(Boolean).map((m) => (typeof m === 'string' ? { cle: m } : m));
      const sig = JSON.stringify(morceaux.filter((m) => m.classe !== 'bulle__aide'));
      const nouveau = sig !== signature;
      signature = sig;
      texteEl.innerHTML = morceaux.map((m) =>
        `<span class="${m.classe || 'bulle__ligne'}">${I18n.html(m.cle, null, m.vars)}</span>`).join('');
      texteEl.dir = I18n.dir(I18n.langueTexte());
      if (!nouveau) return;
      Voix.arreter();
      const bulle = texteEl.parentElement;
      bulle.classList.remove('apparait');
      void bulle.offsetWidth;
      bulle.classList.add('apparait');
      // La mascotte « parle » le temps de lire le texte
      mascotteEl.classList.add('parle');
      clearTimeout(minuteur);
      minuteur = setTimeout(() => mascotteEl.classList.remove('parle'), Math.min(4000, 600 + texteEl.textContent.length * 25));
    }

    // Le prochain dire() sera considéré comme nouveau (animation de la bulle)
    function oublier() { signature = null; }

    return { dire, oublier };
  }

  window.Dialogue = { creer };
})();
