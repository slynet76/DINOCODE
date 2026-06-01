// __tests__/moteur.test.js
const { executerProgramme } = require('../core/moteur');

const niveauSimple = {
  grille: { largeur: 3, hauteur: 1 },
  dino: { x: 0, y: 0, direction: 'droite' },
  oeufs: [],
  nid: { x: 2, y: 0 },
  murs: [],
};

test('avance deux fois amène le dino sur le nid → succès', () => {
  const programme = [{ type: 'avance' }, { type: 'avance' }];
  const r = executerProgramme(niveauSimple, programme);
  expect(r.succes).toBe(true);
  expect(r.positionFinale).toEqual({ x: 2, y: 0 });
});

test('tourne_droite puis avance descend d\'une case', () => {
  const niveau = {
    grille: { largeur: 2, hauteur: 2 },
    dino: { x: 0, y: 0, direction: 'droite' },
    oeufs: [], nid: { x: 0, y: 1 }, murs: [],
  };
  const programme = [{ type: 'tourne_droite' }, { type: 'avance' }];
  const r = executerProgramme(niveau, programme);
  expect(r.succes).toBe(true);
});

test('foncer dans un mur → échec avec raison', () => {
  const niveau = {
    grille: { largeur: 3, hauteur: 1 },
    dino: { x: 0, y: 0, direction: 'droite' },
    oeufs: [], nid: { x: 2, y: 0 }, murs: [{ x: 1, y: 0 }],
  };
  const r = executerProgramme(niveau, [{ type: 'avance' }]);
  expect(r.succes).toBe(false);
  expect(r.raison).toBe('mur');
});

test('sortir de la grille → échec', () => {
  const niveau = {
    grille: { largeur: 2, hauteur: 1 },
    dino: { x: 0, y: 0, direction: 'gauche' },
    oeufs: [], nid: { x: 1, y: 0 }, murs: [],
  };
  const r = executerProgramme(niveau, [{ type: 'avance' }]);
  expect(r.succes).toBe(false);
  expect(r.raison).toBe('hors_grille');
});
