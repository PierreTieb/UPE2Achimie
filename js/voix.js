// voix.js
// Lecture à voix haute avec la synthèse vocale de l'appareil (hors ligne).
// Si aucune voix n'existe pour la langue, rien n'est lu.

(function () {
  const ok = 'speechSynthesis' in window;

  function trouverVoix(code) {
    const voix = speechSynthesis.getVoices();
    const norm = (v) => v.lang.replace('_', '-').toLowerCase();
    return voix.find((v) => norm(v) === code.toLowerCase())
      || voix.find((v) => norm(v).startsWith(code.slice(0, 2).toLowerCase()));
  }

  function parler(texte, langue, surDebut, surFin) {
    if (!ok) return false;
    speechSynthesis.cancel();
    const code = I18n.info(langue).voix;
    const v = trouverVoix(code);
    if (!v) return false;
    const u = new SpeechSynthesisUtterance(texte);
    u.lang = code;
    u.voice = v;
    u.rate = 0.9;
    if (surDebut) u.onstart = surDebut;
    if (surFin) { u.onend = surFin; u.onerror = surFin; }
    speechSynthesis.speak(u);
    return true;
  }

  function arreter() { if (ok) speechSynthesis.cancel(); }

  // Certains navigateurs chargent la liste des voix en différé
  if (ok) speechSynthesis.getVoices();

  window.Voix = { parler, arreter };
})();
