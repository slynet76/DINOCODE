// core/moteur.js
const VECTEURS = {
  droite: { dx: 1, dy: 0 },
  bas: { dx: 0, dy: 1 },
  gauche: { dx: -1, dy: 0 },
  haut: { dx: 0, dy: -1 },
};

function executerProgramme(niveau, programme) {
  const etat = {
    x: niveau.dino.x,
    y: niveau.dino.y,
    direction: niveau.dino.direction,
    oeufsGobes: [],
  };
  const trace = [];

  function avance() {
    const v = VECTEURS[etat.direction];
    etat.x += v.dx;
    etat.y += v.dy;
    trace.push({ action: 'avance', x: etat.x, y: etat.y });
  }

  for (const instr of programme) {
    if (instr.type === 'avance') avance();
  }

  const succes = etat.x === niveau.nid.x && etat.y === niveau.nid.y;
  return { succes, positionFinale: { x: etat.x, y: etat.y }, trace };
}

module.exports = { executerProgramme };
