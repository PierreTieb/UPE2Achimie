// ateliers.js
// Protocoles des 3 ateliers (document « Ateliers ULIS »), arrêtés juste avant le moment surprise.
// Chaque étape du protocole = une consigne (texte) + une suite d'actions à valider dans l'ordre :
//   placer   { objet, sur }          choisir le récipient dans le matériel, il va sur la balance / la plaque
//   glisser  { objet, sur }          faire glisser le récipient de la scène jusqu'à la zone de dépôt
//   tarer                            toucher le bouton 0 de la balance
//   verser   { produit, masse, pas } choisir le produit, tapoter (pas = grammes par tape), valider
//   gouttes  { produit, n }          choisir le flacon, tapoter goutte à goutte, valider
//   pincee   { produit, min, max }   choisir la poudre, tapoter entre min et max fois, valider
//   outil    { outil }               choisir l'outil dans le matériel (la spatule sert à touiller)
//   agiter                           glisser le doigt sur le récipient (10 s de mouvement)
//   chauffer                         allumer la plaque chauffante
//   deposer  { objet }               choisir l'objet dans le matériel, il tombe dans le récipient
//   appeler  { produit }             le professeur vient verser le produit

window.ATELIERS = {
  bleue: {
    plaque: false,
    produits: ['eau', 'sel', 'soude', 'vinaigre', 'glucose', 'bleuMethylene'],
    materiel: ['becher', 'erlenmeyer', 'eprouvette', 'spatule', 'entonnoir', 'pipette'],
    fin: 'fin_surprise',
    etapes: [
      { texte: 'b1', actions: [{ type: 'placer', objet: 'erlenmeyer', sur: 'balance' }, { type: 'tarer' }] },
      { texte: 'b2', actions: [{ type: 'verser', produit: 'soude', masse: 5, pas: 1 }, { type: 'tarer' }] },
      { texte: 'b3', actions: [{ type: 'verser', produit: 'eau', masse: 200, pas: 20 }, { type: 'outil', outil: 'spatule' }, { type: 'agiter' }] },
      { texte: 'b4', actions: [{ type: 'gouttes', produit: 'bleuMethylene', n: 5 }] },
      { texte: 'b5', actions: [{ type: 'glisser', objet: 'erlenmeyer', sur: 'balance' }, { type: 'tarer' }] },
      { texte: 'b6', actions: [{ type: 'verser', produit: 'glucose', masse: 10, pas: 1 }] },
      { texte: 'b7', actions: [{ type: 'outil', outil: 'spatule' }, { type: 'agiter' }] }
    ]
  },

  tresor: {
    plaque: true,
    produits: ['sel', 'eau', 'glucose', 'zinc', 'soude', 'vinaigre'],
    materiel: ['erlenmeyer', 'becher', 'eprouvette', 'spatule', 'pipette', 'pieces', 'trombones'],
    fin: 'fin_profs',
    etapes: [
      { texte: 't1', actions: [{ type: 'placer', objet: 'becher', sur: 'balance' }, { type: 'tarer' }] },
      { texte: 't2', actions: [{ type: 'verser', produit: 'eau', masse: 100, pas: 10 }] },
      { texte: 't3', actions: [{ type: 'tarer' }] },
      { texte: 't4', actions: [{ type: 'verser', produit: 'soude', masse: 10, pas: 1 }, { type: 'outil', outil: 'spatule' }, { type: 'agiter' }] },
      { texte: 't5', actions: [{ type: 'glisser', objet: 'becher', sur: 'plaque' }, { type: 'chauffer' }] },
      { texte: 't6', actions: [{ type: 'pincee', produit: 'zinc', min: 2, max: 5 }] },
      { texte: 't7', actions: [{ type: 'deposer', objet: 'pieces' }, { type: 'outil', outil: 'spatule' }, { type: 'agiter' }] }
    ]
  },

  lumiere: {
    plaque: false,
    produits: ['eau', 'bleuMethylene', 'hexacyanoferrate', 'glucose', 'soude', 'sel'],
    materiel: ['becher', 'bouteilleA', 'bouteilleB', 'eprouvette', 'entonnoir', 'spatule', 'pipette'],
    fin: 'fin_surprise',
    etapes: [
      { texte: 'l1', actions: [{ type: 'placer', objet: 'bouteilleB', sur: 'balance' }, { type: 'tarer' }] },
      { texte: 'l2', actions: [{ type: 'outil', outil: 'entonnoir' }, { type: 'verser', produit: 'eau', masse: 40, pas: 5 }] },
      { texte: 'l3', actions: [{ type: 'pincee', produit: 'hexacyanoferrate', min: 2, max: 5 }] },
      { texte: 'l4', actions: [{ type: 'appeler', produit: 'peroxyde' }] },
      { texte: 'l5', actions: [{ type: 'placer', objet: 'bouteilleA', sur: 'balance' }, { type: 'tarer' }] },
      { texte: 'l6', actions: [{ type: 'outil', outil: 'entonnoir' }, { type: 'verser', produit: 'soude', masse: 20, pas: 2 }] },
      { texte: 'l7', actions: [{ type: 'tarer' }] },
      { texte: 'l8', actions: [{ type: 'verser', produit: 'eau', masse: 30, pas: 5 }] },
      { texte: 'l9', actions: [{ type: 'appeler', produit: 'luminol' }] }
    ]
  }
};
