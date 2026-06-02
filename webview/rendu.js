// Dessine la grille, le dino, les œufs et le nid dans un conteneur DOM.
const EMOJIS = { dino: '🦖', oeuf: '🥚', nid: '🍳', mur: '🪨' };

function dessinerNiveau(niveau, etat) {
  const { largeur, hauteur } = niveau.grille;
  const grille = document.getElementById('grille');
  grille.style.gridTemplateColumns = `repeat(${largeur}, 1fr)`;
  grille.innerHTML = '';
  for (let y = 0; y < hauteur; y++) {
    for (let x = 0; x < largeur; x++) {
      const c = document.createElement('div');
      c.className = 'case';
      if (niveau.murs.some((m) => m.x === x && m.y === y)) c.textContent = EMOJIS.mur;
      else if (niveau.nid.x === x && niveau.nid.y === y) c.textContent = EMOJIS.nid;
      else if (etat.oeufs.some((o) => !o.gobe && o.x === x && o.y === y)) c.textContent = EMOJIS.oeuf;
      if (etat.dino.x === x && etat.dino.y === y) c.textContent = EMOJIS.dino;
      grille.appendChild(c);
    }
  }
}

function etatInitial(niveau) {
  return {
    dino: { x: niveau.dino.x, y: niveau.dino.y, direction: niveau.dino.direction },
    oeufs: niveau.oeufs.map((o) => ({ ...o, gobe: false })),
  };
}

async function animerTrace(niveau, trace, surLigne, vitesseMs) {
  const etat = etatInitial(niveau);
  dessinerNiveau(niveau, etat);
  for (let i = 0; i < trace.length; i++) {
    const pas = trace[i];
    if (pas.action === 'avance') { etat.dino.x = pas.x; etat.dino.y = pas.y; }
    else if (pas.action === 'tourne') { etat.dino.direction = pas.direction; }
    else if (pas.action === 'gobe') {
      const o = etat.oeufs.find((e) => !e.gobe && e.x === pas.x && e.y === pas.y);
      if (o) o.gobe = true;
    }
    if (surLigne) surLigne(i);
    dessinerNiveau(niveau, etat);
    await new Promise((r) => setTimeout(r, vitesseMs));
  }
}

window.rendu = { dessinerNiveau, etatInitial, animerTrace };
