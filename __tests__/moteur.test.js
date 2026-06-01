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

test('gobe collecte un œuf sur la case courante', () => {
  const niveau = {
    grille: { largeur: 2, hauteur: 1 },
    dino: { x: 0, y: 0, direction: 'droite' },
    oeufs: [{ x: 1, y: 0 }], nid: { x: 1, y: 0 }, murs: [],
  };
  const r = executerProgramme(niveau, [{ type: 'avance' }, { type: 'gobe' }]);
  expect(r.succes).toBe(true);
  expect(r.oeufsGobes).toBe(1);
});

test('succès exige tous les œufs gobés ET dino au nid', () => {
  const niveau = {
    grille: { largeur: 3, hauteur: 1 },
    dino: { x: 0, y: 0, direction: 'droite' },
    oeufs: [{ x: 1, y: 0 }], nid: { x: 2, y: 0 }, murs: [],
  };
  const r = executerProgramme(niveau, [{ type: 'avance' }, { type: 'avance' }]);
  expect(r.succes).toBe(false);
  expect(r.raison).toBe('oeufs_restants');
});

test('repete exécute le corps n fois', () => {
  const niveau = {
    grille: { largeur: 4, hauteur: 1 },
    dino: { x: 0, y: 0, direction: 'droite' },
    oeufs: [], nid: { x: 3, y: 0 }, murs: [],
  };
  const programme = [{ type: 'repete', n: 3, corps: [{ type: 'avance' }] }];
  expect(executerProgramme(niveau, programme).succes).toBe(true);
});

test('si oeuf_ici exécute le corps seulement si œuf présent', () => {
  const niveau = {
    grille: { largeur: 2, hauteur: 1 },
    dino: { x: 0, y: 0, direction: 'droite' },
    oeufs: [{ x: 1, y: 0 }], nid: { x: 1, y: 0 }, murs: [],
  };
  const programme = [
    { type: 'avance' },
    { type: 'si', condition: 'oeuf_ici', corps: [{ type: 'gobe' }] },
  ];
  expect(executerProgramme(niveau, programme).succes).toBe(true);
});

test('garde-fou : limite de pas dépassée → échec boucle_infinie', () => {
  const niveau = {
    grille: { largeur: 3, hauteur: 3 },
    dino: { x: 1, y: 1, direction: 'droite' },
    oeufs: [], nid: { x: 0, y: 0 }, murs: [],
  };
  const programme = [{ type: 'repete', n: 1000, corps: [
    { type: 'tourne_droite' },
  ] }];
  const r = executerProgramme(niveau, programme);
  expect(r.succes).toBe(false);
  expect(r.raison).toBe('trop_de_pas');
});

test('tourne_gauche : depuis droite → haut, avance remonte d\'une ligne', () => {
  // droite is index 0 in ORDRE_HORAIRE; (0 + 3) % 4 = 3 → 'haut'; dy=-1 so (0,1)→(0,0)
  const niveau = {
    grille: { largeur: 2, hauteur: 2 },
    dino: { x: 0, y: 1, direction: 'droite' },
    oeufs: [], nid: { x: 0, y: 0 }, murs: [],
  };
  const programme = [{ type: 'tourne_gauche' }, { type: 'avance' }];
  const r = executerProgramme(niveau, programme);
  expect(r.succes).toBe(true);
  expect(r.positionFinale).toEqual({ x: 0, y: 0 });
});

test('si condition fausse → corps ignoré, dino avance quand même', () => {
  // No egg at (0,0) so oeuf_ici is false; si body (gobe) is skipped; avance → (1,0) = nid
  const niveau = {
    grille: { largeur: 2, hauteur: 1 },
    dino: { x: 0, y: 0, direction: 'droite' },
    oeufs: [], nid: { x: 1, y: 0 }, murs: [],
  };
  const programme = [
    { type: 'si', condition: 'oeuf_ici', corps: [{ type: 'gobe' }] },
    { type: 'avance' },
  ];
  const r = executerProgramme(niveau, programme);
  expect(r.succes).toBe(true);
  expect(r.trace.some((a) => a.action === 'gobe')).toBe(false);
});

test('pas_au_nid : programme se termine sans atteindre le nid', () => {
  // Grid 3x1, nid at (2,0); one avance reaches (1,0), one short of nid
  const niveau = {
    grille: { largeur: 3, hauteur: 1 },
    dino: { x: 0, y: 0, direction: 'droite' },
    oeufs: [], nid: { x: 2, y: 0 }, murs: [],
  };
  const r = executerProgramme(niveau, [{ type: 'avance' }]);
  expect(r.succes).toBe(false);
  expect(r.raison).toBe('pas_au_nid');
});
