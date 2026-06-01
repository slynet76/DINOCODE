// core/moteur.js
const VECTEURS = {
  droite: { dx: 1, dy: 0 },
  bas: { dx: 0, dy: 1 },
  gauche: { dx: -1, dy: 0 },
  haut: { dx: 0, dy: -1 },
};
const ORDRE_HORAIRE = ['droite', 'bas', 'gauche', 'haut'];

function estMur(niveau, x, y) {
  return niveau.murs.some((m) => m.x === x && m.y === y);
}
function horsGrille(niveau, x, y) {
  return x < 0 || y < 0 || x >= niveau.grille.largeur || y >= niveau.grille.hauteur;
}

function executerProgramme(niveau, programme) {
  const etat = {
    x: niveau.dino.x, y: niveau.dino.y,
    direction: niveau.dino.direction, oeufsGobes: [],
  };
  const trace = [];
  let echec = null;

  function tourne(sens) {
    const i = ORDRE_HORAIRE.indexOf(etat.direction);
    const delta = sens === 'droite' ? 1 : 3;
    etat.direction = ORDRE_HORAIRE[(i + delta) % 4];
    trace.push({ action: 'tourne', direction: etat.direction });
  }
  function avance() {
    const v = VECTEURS[etat.direction];
    const nx = etat.x + v.dx, ny = etat.y + v.dy;
    if (horsGrille(niveau, nx, ny)) { echec = 'hors_grille'; return; }
    if (estMur(niveau, nx, ny)) { echec = 'mur'; return; }
    etat.x = nx; etat.y = ny;
    trace.push({ action: 'avance', x: etat.x, y: etat.y });
  }

  function executerListe(liste) {
    for (const instr of liste) {
      if (echec) return;
      if (instr.type === 'avance') avance();
      else if (instr.type === 'tourne_droite') tourne('droite');
      else if (instr.type === 'tourne_gauche') tourne('gauche');
    }
  }

  executerListe(programme);

  if (echec) {
    return { succes: false, raison: echec, positionFinale: { x: etat.x, y: etat.y }, trace };
  }
  const surNid = etat.x === niveau.nid.x && etat.y === niveau.nid.y;
  return {
    succes: surNid, raison: surNid ? null : 'pas_au_nid',
    positionFinale: { x: etat.x, y: etat.y }, trace,
  };
}

module.exports = { executerProgramme };
