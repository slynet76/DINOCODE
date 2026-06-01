// __tests__/chargeurNiveaux.test.js
const { validerNiveau } = require('../core/chargeurNiveaux');

const base = {
  id: 1, titre: 'Test',
  grille: { largeur: 3, hauteur: 3 },
  dino: { x: 0, y: 0, direction: 'droite' },
  oeufs: [{ x: 1, y: 0 }], nid: { x: 2, y: 2 }, murs: [{ x: 1, y: 1 }],
  blocs_autorises: ['avance', 'gobe'],
  objectif: 'Test', etoiles: { max_blocs_3: 3, max_blocs_2: 6 },
};

test('un niveau cohérent est valide', () => {
  expect(validerNiveau(base)).toEqual({ valide: true, erreurs: [] });
});

test('dino hors grille → invalide', () => {
  const n = { ...base, dino: { x: 5, y: 0, direction: 'droite' } };
  const r = validerNiveau(n);
  expect(r.valide).toBe(false);
  expect(r.erreurs).toContain('dino hors grille');
});

test('nid sur un mur → invalide', () => {
  const n = { ...base, nid: { x: 1, y: 1 } };
  const r = validerNiveau(n);
  expect(r.valide).toBe(false);
  expect(r.erreurs).toContain('nid sur un mur');
});

test('œuf hors grille → invalide', () => {
  const n = { ...base, oeufs: [{ x: 9, y: 9 }] };
  expect(validerNiveau(n).valide).toBe(false);
});
