// core/chargeurNiveaux.js
function dans(grille, p) {
  return p.x >= 0 && p.y >= 0 && p.x < grille.largeur && p.y < grille.hauteur;
}
function estMur(murs, p) {
  return murs.some((m) => m.x === p.x && m.y === p.y);
}

function validerNiveau(niveau) {
  const erreurs = [];
  const g = niveau.grille;
  if (!dans(g, niveau.dino)) erreurs.push('dino hors grille');
  if (!dans(g, niveau.nid)) erreurs.push('nid hors grille');
  if (estMur(niveau.murs, niveau.nid)) erreurs.push('nid sur un mur');
  if (estMur(niveau.murs, niveau.dino)) erreurs.push('dino sur un mur');
  for (const o of niveau.oeufs) {
    if (!dans(g, o)) erreurs.push('œuf hors grille');
    if (estMur(niveau.murs, o)) erreurs.push('œuf sur un mur');
  }
  return { valide: erreurs.length === 0, erreurs };
}

module.exports = { validerNiveau };
