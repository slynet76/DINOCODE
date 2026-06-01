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
