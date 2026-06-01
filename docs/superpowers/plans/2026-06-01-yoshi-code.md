# Yoshi Code Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Construire une app Android Expo où un enfant guide un dino (Yoshi) sur une grille en assemblant des blocs, avec le code Python équivalent affiché, sur ~12 niveaux progressifs.

**Architecture:** App Expo (React Native) pour l'enrobage (accueil, carte des niveaux, étoiles, sauvegarde locale). Le cœur interactif (éditeur Blockly + moteur de jeu + génération Python) est une page web embarquée dans une `react-native-webview`. Un pont `postMessage` relie les deux mondes. Le moteur de jeu est une logique pure en JS, partagée et testée avec Jest.

**Tech Stack:** Expo SDK 51, React Native, react-native-webview, Google Blockly, @react-native-async-storage/async-storage, Jest, GitHub Actions + EAS pour le build APK.

---

## Structure des fichiers

```
yoshi-code/
├── app/
│   ├── App.js                      # navigation racine
│   ├── screens/
│   │   ├── AccueilScreen.js        # écran d'accueil
│   │   ├── CarteScreen.js          # carte des 12 niveaux + étoiles
│   │   └── JeuScreen.js            # héberge la WebView
│   └── storage/
│       └── progression.js          # wrapper AsyncStorage (logique pure testable)
├── core/
│   ├── moteur.js                   # moteur de jeu (logique pure)
│   ├── etoiles.js                  # calcul des étoiles
│   └── chargeurNiveaux.js          # validation + chargement JSON
├── levels/
│   ├── index.js                    # importe et expose les 12 niveaux
│   └── niveau-01.json ... niveau-12.json
├── webview/
│   ├── index.html                  # page de l'atelier
│   ├── blocs.js                    # définitions Blockly + générateurs Python + AST
│   ├── rendu.js                    # rendu de la grille/dino/œufs + animation
│   ├── pont.js                     # postMessage WebView <-> RN
│   └── build/                      # bundle généré (Blockly inclus)
├── assets/                         # sprites Yoshi, œufs, sons
├── __tests__/
│   ├── moteur.test.js
│   ├── etoiles.test.js
│   ├── chargeurNiveaux.test.js
│   ├── niveaux.test.js
│   └── progression.test.js
├── .github/workflows/build-apk.yml
├── app.json
├── eas.json
├── package.json
└── docs/superpowers/{specs,plans}/
```

**Conventions de coordonnées (verrouillées, utilisées partout) :**
- Origine en haut-gauche. `x` augmente vers la droite, `y` augmente vers le bas.
- Directions : `'droite'`, `'bas'`, `'gauche'`, `'haut'`.
- `tourne_droite` fait tourner dans l'ordre horaire : droite → bas → gauche → haut → droite.

**Forme d'un programme (AST, verrouillée) :** une liste d'instructions. Chaque instruction est un objet :
- `{ type: 'avance' }`
- `{ type: 'tourne_droite' }`
- `{ type: 'tourne_gauche' }`
- `{ type: 'gobe' }`
- `{ type: 'repete', n: <entier>, corps: [<instructions>] }`
- `{ type: 'si', condition: 'mur_devant' | 'oeuf_ici', corps: [<instructions>] }`

---

## Task 1 : Scaffolding du projet Expo

**Files:**
- Create: `package.json`, `app.json`, `babel.config.js`, `.gitignore` (déjà présent)
- Create: `app/App.js`

- [ ] **Step 1 : Initialiser le projet Expo**

Run depuis `C:\Users\admin\kids-code-app` :
```bash
npx create-expo-app@latest . --template blank
```
Si le dossier n'est pas vide, créer dans un sous-dossier temporaire puis déplacer, ou répondre « oui » pour fusionner. Conserver le `docs/` et `.git/` existants.

- [ ] **Step 2 : Installer les dépendances**

```bash
npx expo install react-native-webview @react-native-async-storage/async-storage
npm install --save-dev jest @testing-library/react-native
```

- [ ] **Step 3 : Configurer Jest dans package.json**

Ajouter dans `package.json` :
```json
{
  "scripts": {
    "start": "expo start",
    "android": "expo run:android",
    "test": "jest"
  },
  "jest": {
    "preset": "react-native"
  }
}
```

- [ ] **Step 4 : Vérifier que le projet démarre**

Run : `npx expo start --no-dev --offline` puis Ctrl+C.
Expected : le bundler démarre sans erreur.

- [ ] **Step 5 : Commit**

```bash
git add -A
git commit -m "chore: scaffold Expo project with webview, async-storage, jest"
```

---

## Task 2 : Moteur de jeu — déplacement de base

**Files:**
- Create: `core/moteur.js`
- Test: `__tests__/moteur.test.js`

- [ ] **Step 1 : Écrire le test qui échoue**

```js
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
```

- [ ] **Step 2 : Lancer le test pour vérifier l'échec**

Run : `npx jest moteur -t "avance deux fois"`
Expected : FAIL — `executerProgramme is not a function`.

- [ ] **Step 3 : Implémentation minimale**

```js
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
```

- [ ] **Step 4 : Lancer le test**

Run : `npx jest moteur`
Expected : PASS.

- [ ] **Step 5 : Commit**

```bash
git add core/moteur.js __tests__/moteur.test.js
git commit -m "feat(core): game engine handles forward movement"
```

---

## Task 3 : Moteur — rotations et collisions

**Files:**
- Modify: `core/moteur.js`
- Test: `__tests__/moteur.test.js`

- [ ] **Step 1 : Ajouter les tests qui échouent**

```js
// __tests__/moteur.test.js  (ajouter)
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
```

- [ ] **Step 2 : Lancer pour vérifier l'échec**

Run : `npx jest moteur`
Expected : FAIL sur les 3 nouveaux tests.

- [ ] **Step 3 : Implémentation**

Remplacer le contenu de `core/moteur.js` par :
```js
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
```

- [ ] **Step 4 : Lancer les tests**

Run : `npx jest moteur`
Expected : PASS (tous).

- [ ] **Step 5 : Commit**

```bash
git add core/moteur.js __tests__/moteur.test.js
git commit -m "feat(core): rotations, wall and out-of-grid collisions"
```

---

## Task 4 : Moteur — œufs, boucles, conditions

**Files:**
- Modify: `core/moteur.js`
- Test: `__tests__/moteur.test.js`

- [ ] **Step 1 : Ajouter les tests qui échouent**

```js
// __tests__/moteur.test.js (ajouter)
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
  // arrive au nid sans gober → échec
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
  // tourne en rond indéfiniment
  const programme = [{ type: 'repete', n: 1000, corps: [
    { type: 'tourne_droite' },
  ] }];
  const r = executerProgramme(niveau, programme);
  expect(r.succes).toBe(false);
  expect(r.raison).toBe('trop_de_pas');
});
```

- [ ] **Step 2 : Lancer pour vérifier l'échec**

Run : `npx jest moteur`
Expected : FAIL sur les nouveaux tests.

- [ ] **Step 3 : Implémentation**

Remplacer `core/moteur.js` par :
```js
// core/moteur.js
const VECTEURS = {
  droite: { dx: 1, dy: 0 }, bas: { dx: 0, dy: 1 },
  gauche: { dx: -1, dy: 0 }, haut: { dx: 0, dy: -1 },
};
const ORDRE_HORAIRE = ['droite', 'bas', 'gauche', 'haut'];
const LIMITE_PAS = 200;

function estMur(niveau, x, y) {
  return niveau.murs.some((m) => m.x === x && m.y === y);
}
function horsGrille(niveau, x, y) {
  return x < 0 || y < 0 || x >= niveau.grille.largeur || y >= niveau.grille.hauteur;
}

function executerProgramme(niveau, programme) {
  const etat = {
    x: niveau.dino.x, y: niveau.dino.y,
    direction: niveau.dino.direction,
  };
  const restants = niveau.oeufs.map((o) => ({ ...o, gobe: false }));
  const trace = [];
  let echec = null;
  let pas = 0;

  function compter() {
    pas += 1;
    if (pas > LIMITE_PAS) echec = 'trop_de_pas';
  }
  function tourne(sens) {
    compter(); if (echec) return;
    const i = ORDRE_HORAIRE.indexOf(etat.direction);
    etat.direction = ORDRE_HORAIRE[(i + (sens === 'droite' ? 1 : 3)) % 4];
    trace.push({ action: 'tourne', direction: etat.direction });
  }
  function avance() {
    compter(); if (echec) return;
    const v = VECTEURS[etat.direction];
    const nx = etat.x + v.dx, ny = etat.y + v.dy;
    if (horsGrille(niveau, nx, ny)) { echec = 'hors_grille'; return; }
    if (estMur(niveau, nx, ny)) { echec = 'mur'; return; }
    etat.x = nx; etat.y = ny;
    trace.push({ action: 'avance', x: etat.x, y: etat.y });
  }
  function gobe() {
    compter(); if (echec) return;
    const oeuf = restants.find((o) => !o.gobe && o.x === etat.x && o.y === etat.y);
    if (oeuf) { oeuf.gobe = true; trace.push({ action: 'gobe', x: etat.x, y: etat.y }); }
  }
  function condition(nom) {
    if (nom === 'oeuf_ici') {
      return restants.some((o) => !o.gobe && o.x === etat.x && o.y === etat.y);
    }
    if (nom === 'mur_devant') {
      const v = VECTEURS[etat.direction];
      const nx = etat.x + v.dx, ny = etat.y + v.dy;
      return horsGrille(niveau, nx, ny) || estMur(niveau, nx, ny);
    }
    return false;
  }
  function executerListe(liste) {
    for (const instr of liste) {
      if (echec) return;
      switch (instr.type) {
        case 'avance': avance(); break;
        case 'tourne_droite': tourne('droite'); break;
        case 'tourne_gauche': tourne('gauche'); break;
        case 'gobe': gobe(); break;
        case 'repete':
          for (let k = 0; k < instr.n && !echec; k++) executerListe(instr.corps);
          break;
        case 'si':
          if (condition(instr.condition)) executerListe(instr.corps);
          break;
      }
    }
  }

  executerListe(programme);

  const oeufsGobes = restants.filter((o) => o.gobe).length;
  if (echec) {
    return { succes: false, raison: echec, oeufsGobes,
      positionFinale: { x: etat.x, y: etat.y }, trace };
  }
  const tousGobes = oeufsGobes === restants.length;
  const surNid = etat.x === niveau.nid.x && etat.y === niveau.nid.y;
  let raison = null;
  if (!tousGobes) raison = 'oeufs_restants';
  else if (!surNid) raison = 'pas_au_nid';
  return {
    succes: tousGobes && surNid, raison, oeufsGobes,
    positionFinale: { x: etat.x, y: etat.y }, trace,
  };
}

module.exports = { executerProgramme };
```

- [ ] **Step 4 : Lancer tous les tests du moteur**

Run : `npx jest moteur`
Expected : PASS (tous).

- [ ] **Step 5 : Commit**

```bash
git add core/moteur.js __tests__/moteur.test.js
git commit -m "feat(core): eggs, loops, conditions, infinite-loop guard"
```

---

## Task 5 : Calcul des étoiles

**Files:**
- Create: `core/etoiles.js`
- Test: `__tests__/etoiles.test.js`

- [ ] **Step 1 : Écrire les tests qui échouent**

```js
// __tests__/etoiles.test.js
const { compterBlocs, contientBoucleOuCondition, calculerEtoiles } = require('../core/etoiles');

test('compterBlocs compte les instructions, corps inclus', () => {
  const prog = [
    { type: 'avance' },
    { type: 'repete', n: 2, corps: [{ type: 'avance' }, { type: 'gobe' }] },
  ];
  // avance + repete + avance + gobe = 4
  expect(compterBlocs(prog)).toBe(4);
});

test('contientBoucleOuCondition détecte repete et si', () => {
  expect(contientBoucleOuCondition([{ type: 'avance' }])).toBe(false);
  expect(contientBoucleOuCondition([{ type: 'repete', n: 2, corps: [] }])).toBe(true);
  expect(contientBoucleOuCondition([{ type: 'si', condition: 'oeuf_ici', corps: [] }])).toBe(true);
});

test('calculerEtoiles : 3 si peu de blocs + boucle/condition', () => {
  const niveau = { etoiles: { max_blocs_3: 3, max_blocs_2: 6 } };
  const prog = [{ type: 'repete', n: 3, corps: [{ type: 'avance' }] }]; // 2 blocs, boucle
  expect(calculerEtoiles(niveau, prog)).toBe(3);
});

test('calculerEtoiles : 2 si peu de blocs sans boucle', () => {
  const niveau = { etoiles: { max_blocs_3: 3, max_blocs_2: 6 } };
  const prog = [{ type: 'avance' }, { type: 'avance' }, { type: 'avance' }]; // 3 blocs, pas de boucle
  expect(calculerEtoiles(niveau, prog)).toBe(2);
});

test('calculerEtoiles : 1 si beaucoup de blocs', () => {
  const niveau = { etoiles: { max_blocs_3: 3, max_blocs_2: 6 } };
  const prog = Array(8).fill({ type: 'avance' }); // 8 blocs
  expect(calculerEtoiles(niveau, prog)).toBe(1);
});
```

- [ ] **Step 2 : Lancer pour vérifier l'échec**

Run : `npx jest etoiles`
Expected : FAIL — module introuvable.

- [ ] **Step 3 : Implémentation**

```js
// core/etoiles.js
function compterBlocs(programme) {
  let total = 0;
  for (const instr of programme) {
    total += 1;
    if (instr.corps) total += compterBlocs(instr.corps);
  }
  return total;
}

function contientBoucleOuCondition(programme) {
  for (const instr of programme) {
    if (instr.type === 'repete' || instr.type === 'si') return true;
    if (instr.corps && contientBoucleOuCondition(instr.corps)) return true;
  }
  return false;
}

function calculerEtoiles(niveau, programme) {
  const n = compterBlocs(programme);
  const seuils = niveau.etoiles;
  if (n <= seuils.max_blocs_3 && contientBoucleOuCondition(programme)) return 3;
  if (n <= seuils.max_blocs_2) return 2;
  return 1;
}

module.exports = { compterBlocs, contientBoucleOuCondition, calculerEtoiles };
```

- [ ] **Step 4 : Lancer les tests**

Run : `npx jest etoiles`
Expected : PASS.

- [ ] **Step 5 : Commit**

```bash
git add core/etoiles.js __tests__/etoiles.test.js
git commit -m "feat(core): star scoring based on block count and loop/condition use"
```

---

## Task 6 : Chargeur et validation de niveaux

**Files:**
- Create: `core/chargeurNiveaux.js`
- Test: `__tests__/chargeurNiveaux.test.js`

- [ ] **Step 1 : Écrire les tests qui échouent**

```js
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
```

- [ ] **Step 2 : Lancer pour vérifier l'échec**

Run : `npx jest chargeurNiveaux`
Expected : FAIL — module introuvable.

- [ ] **Step 3 : Implémentation**

```js
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
```

- [ ] **Step 4 : Lancer les tests**

Run : `npx jest chargeurNiveaux`
Expected : PASS.

- [ ] **Step 5 : Commit**

```bash
git add core/chargeurNiveaux.js __tests__/chargeurNiveaux.test.js
git commit -m "feat(core): level coherence validation"
```

---

## Task 7 : Les 12 niveaux + test de solvabilité

**Files:**
- Create: `levels/niveau-01.json` … `levels/niveau-12.json`
- Create: `levels/index.js`
- Create: `levels/solutions.js` (solution de référence par niveau, pour le test)
- Test: `__tests__/niveaux.test.js`

- [ ] **Step 1 : Créer les 3 premiers niveaux (séquence)**

`levels/niveau-01.json` :
```json
{
  "id": 1, "titre": "Premiers pas",
  "grille": { "largeur": 3, "hauteur": 1 },
  "dino": { "x": 0, "y": 0, "direction": "droite" },
  "oeufs": [], "nid": { "x": 2, "y": 0 }, "murs": [],
  "blocs_autorises": ["avance", "tourne_droite", "tourne_gauche"],
  "objectif": "Avance jusqu'au nid", "etoiles": { "max_blocs_3": 2, "max_blocs_2": 3 }
}
```

`levels/niveau-02.json` :
```json
{
  "id": 2, "titre": "Le virage",
  "grille": { "largeur": 3, "hauteur": 3 },
  "dino": { "x": 0, "y": 0, "direction": "droite" },
  "oeufs": [], "nid": { "x": 2, "y": 2 }, "murs": [],
  "blocs_autorises": ["avance", "tourne_droite", "tourne_gauche"],
  "objectif": "Tourne pour atteindre le nid", "etoiles": { "max_blocs_3": 5, "max_blocs_2": 7 }
}
```

`levels/niveau-03.json` :
```json
{
  "id": 3, "titre": "Premier œuf",
  "grille": { "largeur": 4, "hauteur": 1 },
  "dino": { "x": 0, "y": 0, "direction": "droite" },
  "oeufs": [{ "x": 1, "y": 0 }, { "x": 2, "y": 0 }],
  "nid": { "x": 3, "y": 0 }, "murs": [],
  "blocs_autorises": ["avance", "gobe"],
  "objectif": "Gobe les œufs puis va au nid", "etoiles": { "max_blocs_3": 5, "max_blocs_2": 7 }
}
```

- [ ] **Step 2 : Créer les niveaux 4-7 (boucle)**

`levels/niveau-04.json` :
```json
{
  "id": 4, "titre": "La ligne droite",
  "grille": { "largeur": 5, "hauteur": 1 },
  "dino": { "x": 0, "y": 0, "direction": "droite" },
  "oeufs": [{ "x": 1, "y": 0 }, { "x": 2, "y": 0 }, { "x": 3, "y": 0 }],
  "nid": { "x": 4, "y": 0 }, "murs": [],
  "blocs_autorises": ["avance", "gobe", "repete"],
  "objectif": "Utilise une boucle pour gober tous les œufs", "etoiles": { "max_blocs_3": 3, "max_blocs_2": 6 }
}
```

`levels/niveau-05.json` :
```json
{
  "id": 5, "titre": "La grotte",
  "grille": { "largeur": 4, "hauteur": 3 },
  "dino": { "x": 0, "y": 0, "direction": "droite" },
  "oeufs": [{ "x": 2, "y": 0 }, { "x": 3, "y": 1 }],
  "nid": { "x": 3, "y": 2 }, "murs": [{ "x": 1, "y": 1 }],
  "blocs_autorises": ["avance", "gobe", "tourne_droite", "tourne_gauche", "repete"],
  "objectif": "Gobe les 2 œufs puis rejoins le nid", "etoiles": { "max_blocs_3": 6, "max_blocs_2": 9 }
}
```

`levels/niveau-06.json` :
```json
{
  "id": 6, "titre": "Le carré",
  "grille": { "largeur": 3, "hauteur": 3 },
  "dino": { "x": 0, "y": 0, "direction": "droite" },
  "oeufs": [{ "x": 2, "y": 0 }, { "x": 2, "y": 2 }, { "x": 0, "y": 2 }],
  "nid": { "x": 0, "y": 0 }, "murs": [],
  "blocs_autorises": ["avance", "gobe", "tourne_droite", "repete"],
  "objectif": "Fais le tour avec une boucle", "etoiles": { "max_blocs_3": 5, "max_blocs_2": 10 }
}
```

`levels/niveau-07.json` :
```json
{
  "id": 7, "titre": "Le long couloir",
  "grille": { "largeur": 6, "hauteur": 1 },
  "dino": { "x": 0, "y": 0, "direction": "droite" },
  "oeufs": [{ "x": 1, "y": 0 }, { "x": 2, "y": 0 }, { "x": 3, "y": 0 }, { "x": 4, "y": 0 }],
  "nid": { "x": 5, "y": 0 }, "murs": [],
  "blocs_autorises": ["avance", "gobe", "repete"],
  "objectif": "Une boucle bien comptée", "etoiles": { "max_blocs_3": 3, "max_blocs_2": 8 }
}
```

- [ ] **Step 3 : Créer les niveaux 8-12 (condition)**

`levels/niveau-08.json` :
```json
{
  "id": 8, "titre": "Œufs cachés",
  "grille": { "largeur": 5, "hauteur": 1 },
  "dino": { "x": 0, "y": 0, "direction": "droite" },
  "oeufs": [{ "x": 1, "y": 0 }, { "x": 3, "y": 0 }],
  "nid": { "x": 4, "y": 0 }, "murs": [],
  "blocs_autorises": ["avance", "gobe", "repete", "si"],
  "objectif": "Gobe seulement s'il y a un œuf", "etoiles": { "max_blocs_3": 4, "max_blocs_2": 8 }
}
```

`levels/niveau-09.json` :
```json
{
  "id": 9, "titre": "Le mur surprise",
  "grille": { "largeur": 5, "hauteur": 2 },
  "dino": { "x": 0, "y": 0, "direction": "droite" },
  "oeufs": [{ "x": 2, "y": 0 }],
  "nid": { "x": 4, "y": 1 }, "murs": [{ "x": 3, "y": 0 }],
  "blocs_autorises": ["avance", "gobe", "tourne_droite", "tourne_gauche", "repete", "si"],
  "objectif": "Contourne le mur", "etoiles": { "max_blocs_3": 7, "max_blocs_2": 11 }
}
```

`levels/niveau-10.json` :
```json
{
  "id": 10, "titre": "Slalom",
  "grille": { "largeur": 5, "hauteur": 3 },
  "dino": { "x": 0, "y": 0, "direction": "droite" },
  "oeufs": [{ "x": 1, "y": 0 }, { "x": 3, "y": 0 }],
  "nid": { "x": 4, "y": 2 }, "murs": [{ "x": 2, "y": 0 }, { "x": 2, "y": 1 }],
  "blocs_autorises": ["avance", "gobe", "tourne_droite", "tourne_gauche", "repete", "si"],
  "objectif": "Slalome entre les murs", "etoiles": { "max_blocs_3": 8, "max_blocs_2": 13 }
}
```

`levels/niveau-11.json` :
```json
{
  "id": 11, "titre": "La spirale",
  "grille": { "largeur": 4, "hauteur": 4 },
  "dino": { "x": 0, "y": 0, "direction": "droite" },
  "oeufs": [{ "x": 3, "y": 0 }, { "x": 3, "y": 3 }, { "x": 0, "y": 3 }],
  "nid": { "x": 1, "y": 1 }, "murs": [],
  "blocs_autorises": ["avance", "gobe", "tourne_droite", "repete", "si"],
  "objectif": "Rassemble tout en spirale", "etoiles": { "max_blocs_3": 8, "max_blocs_2": 14 }
}
```

`levels/niveau-12.json` :
```json
{
  "id": 12, "titre": "Le grand défi",
  "grille": { "largeur": 6, "hauteur": 4 },
  "dino": { "x": 0, "y": 0, "direction": "droite" },
  "oeufs": [{ "x": 5, "y": 0 }, { "x": 5, "y": 3 }, { "x": 0, "y": 3 }, { "x": 2, "y": 1 }],
  "nid": { "x": 3, "y": 2 }, "murs": [{ "x": 1, "y": 1 }, { "x": 4, "y": 2 }],
  "blocs_autorises": ["avance", "gobe", "tourne_droite", "tourne_gauche", "repete", "si"],
  "objectif": "Mets tout ce que tu as appris", "etoiles": { "max_blocs_3": 12, "max_blocs_2": 20 }
}
```

- [ ] **Step 4 : Créer l'index et les solutions de référence**

`levels/index.js` :
```js
const niveaux = [
  require('./niveau-01.json'), require('./niveau-02.json'),
  require('./niveau-03.json'), require('./niveau-04.json'),
  require('./niveau-05.json'), require('./niveau-06.json'),
  require('./niveau-07.json'), require('./niveau-08.json'),
  require('./niveau-09.json'), require('./niveau-10.json'),
  require('./niveau-11.json'), require('./niveau-12.json'),
];
module.exports = niveaux;
```

`levels/solutions.js` — une solution (programme AST) par niveau, utilisée uniquement par le test de solvabilité. Écrire chaque solution en raisonnant sur la grille, puis l'ajuster jusqu'à ce que le test passe (Step 6). Exemple pour les 4 premiers, à compléter de même pour 5 à 12 :
```js
const A = { type: 'avance' };
const G = { type: 'gobe' };
const TD = { type: 'tourne_droite' };

module.exports = {
  1: [A, A],
  2: [A, A, TD, A, A],
  3: [A, G, A, G, A],
  4: [{ type: 'repete', n: 3, corps: [A, G] }, A],
  5: [A, A, G, TD, A, G, A],
  6: [{ type: 'repete', n: 3, corps: [A, A, G, TD] }],
  7: [{ type: 'repete', n: 4, corps: [A, G] }, A],
  8: [{ type: 'repete', n: 4, corps: [A, { type: 'si', condition: 'oeuf_ici', corps: [G] }] }],
  9: [A, A, G, TD, A, { type: 'tourne_gauche' }, A, A],
  10: [A, G, TD, A, { type: 'tourne_gauche' }, A, A, G, { type: 'tourne_gauche' }, A, A, A, TD, A],
  11: [{ type: 'repete', n: 3, corps: [{ type: 'repete', n: 3, corps: [A, { type: 'si', condition: 'oeuf_ici', corps: [G] }] }, TD] }],
  12: [],
};
```
Note : la solution du niveau 12 (et toute autre incomplète) doit être complétée à la main jusqu'à ce que le test de solvabilité passe. C'est la garantie que le niveau est jouable.

- [ ] **Step 5 : Écrire le test de validité + solvabilité**

```js
// __tests__/niveaux.test.js
const niveaux = require('../levels');
const solutions = require('../levels/solutions');
const { validerNiveau } = require('../core/chargeurNiveaux');
const { executerProgramme } = require('../core/moteur');

test('il y a bien 12 niveaux avec des id 1..12', () => {
  expect(niveaux).toHaveLength(12);
  expect(niveaux.map((n) => n.id)).toEqual([1,2,3,4,5,6,7,8,9,10,11,12]);
});

describe.each(niveaux)('niveau $id ($titre)', (niveau) => {
  test('est cohérent', () => {
    expect(validerNiveau(niveau)).toEqual({ valide: true, erreurs: [] });
  });
  test('a une solution de référence qui réussit', () => {
    const sol = solutions[niveau.id];
    const r = executerProgramme(niveau, sol);
    expect(r.succes).toBe(true);
  });
});
```

- [ ] **Step 6 : Lancer et ajuster les solutions jusqu'au vert**

Run : `npx jest niveaux`
Expected : PASS. Si un niveau échoue, corriger sa solution dans `levels/solutions.js` (ou ajuster le JSON du niveau s'il est réellement insoluble) jusqu'à ce que tout passe.

- [ ] **Step 7 : Commit**

```bash
git add levels __tests__/niveaux.test.js
git commit -m "feat(levels): 12 progressive levels with solvability tests"
```

---

## Task 8 : Couche de sauvegarde (progression)

**Files:**
- Create: `app/storage/progression.js`
- Test: `__tests__/progression.test.js`

- [ ] **Step 1 : Écrire les tests qui échouent (AsyncStorage mocké)**

```js
// __tests__/progression.test.js
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'));

const AsyncStorage = require('@react-native-async-storage/async-storage').default;
const { lireProgression, enregistrerResultat, reinitialiser } = require('../app/storage/progression');

beforeEach(async () => { await AsyncStorage.clear(); });

test('progression vide au départ', async () => {
  const p = await lireProgression();
  expect(p).toEqual({});
});

test('enregistre les étoiles d\'un niveau', async () => {
  await enregistrerResultat(1, 3, 2);
  const p = await lireProgression();
  expect(p['1']).toEqual({ etoiles: 3, blocs: 2 });
});

test('ne baisse pas un meilleur score existant', async () => {
  await enregistrerResultat(1, 3, 2);
  await enregistrerResultat(1, 1, 9);
  const p = await lireProgression();
  expect(p['1'].etoiles).toBe(3);
});

test('reinitialiser efface tout', async () => {
  await enregistrerResultat(1, 3, 2);
  await reinitialiser();
  expect(await lireProgression()).toEqual({});
});
```

- [ ] **Step 2 : Lancer pour vérifier l'échec**

Run : `npx jest progression`
Expected : FAIL — module introuvable.

- [ ] **Step 3 : Implémentation**

```js
// app/storage/progression.js
import AsyncStorage from '@react-native-async-storage/async-storage';

const CLE = 'yoshi-code:progression';

export async function lireProgression() {
  const brut = await AsyncStorage.getItem(CLE);
  return brut ? JSON.parse(brut) : {};
}

export async function enregistrerResultat(niveauId, etoiles, blocs) {
  const p = await lireProgression();
  const courant = p[String(niveauId)];
  if (!courant || etoiles > courant.etoiles) {
    p[String(niveauId)] = { etoiles, blocs };
  }
  await AsyncStorage.setItem(CLE, JSON.stringify(p));
  return p;
}

export async function reinitialiser() {
  await AsyncStorage.removeItem(CLE);
}
```

- [ ] **Step 4 : Lancer les tests**

Run : `npx jest progression`
Expected : PASS.

- [ ] **Step 5 : Commit**

```bash
git add app/storage/progression.js __tests__/progression.test.js
git commit -m "feat(storage): local progression with best-score persistence"
```

---

## Task 9 : Atelier WebView — page, rendu et pont

> À partir d'ici, le code tourne dans la WebView (navigateur) : testé à la main sur appareil/émulateur. Le moteur de jeu (`core/moteur.js`) est réutilisé tel quel, chargé comme script.

**Files:**
- Create: `webview/index.html`
- Create: `webview/rendu.js`
- Create: `webview/pont.js`
- Create: `webview/moteur-web.js` (copie navigateur du moteur, voir Step 1)

- [ ] **Step 1 : Rendre le moteur utilisable côté navigateur**

Créer `webview/moteur-web.js` : copier le contenu de `core/moteur.js` et remplacer la dernière ligne `module.exports = { executerProgramme };` par :
```js
window.executerProgramme = executerProgramme;
```
(Le moteur reste la source de vérité dans `core/` pour les tests ; cette copie sert au runtime navigateur. Un commentaire en tête des deux fichiers rappelle de les garder synchronisés.)

Ajouter en tête de `core/moteur.js` ET `webview/moteur-web.js` :
```js
// ⚠️ Garder synchronisé avec l'autre copie (core/moteur.js <-> webview/moteur-web.js)
```

- [ ] **Step 2 : Créer le rendu de la grille**

`webview/rendu.js` :
```js
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

// Rejoue la trace pas-à-pas avec animation et illumination de ligne.
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
```

- [ ] **Step 3 : Créer le pont WebView → RN**

`webview/pont.js` :
```js
// Envoie un message structuré à React Native via le bridge WebView.
function envoyerARN(message) {
  if (window.ReactNativeWebView) {
    window.ReactNativeWebView.postMessage(JSON.stringify(message));
  }
}

// Reçoit le niveau à charger depuis RN.
function ecouterRN(onNiveau) {
  function handler(event) {
    try {
      const msg = JSON.parse(event.data);
      if (msg.type === 'charger_niveau') onNiveau(msg.niveau);
    } catch (e) { /* message non-JSON ignoré */ }
  }
  document.addEventListener('message', handler); // Android
  window.addEventListener('message', handler);   // iOS/dev
}

window.pont = { envoyerARN, ecouterRN };
```

- [ ] **Step 4 : Créer la page HTML de l'atelier**

`webview/index.html` :
```html
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1, user-scalable=no" />
  <style>
    body { margin: 0; font-family: sans-serif; background: #dcfce7; }
    #grille { display: grid; gap: 3px; padding: 8px; }
    .case { aspect-ratio: 1; background: #86efac; border-radius: 6px;
            display: flex; align-items: center; justify-content: center; font-size: 24px; }
    #blockly { height: 40vh; }
    #code { background: #0f172a; color: #4ade80; font-family: monospace;
            font-size: 12px; padding: 8px; white-space: pre; min-height: 60px; }
    #code .actif { background: #334155; display: block; }
    #go { width: 100%; padding: 14px; font-size: 18px; font-weight: bold;
          color: #fff; background: #16a34a; border: none; }
    #message { padding: 8px; text-align: center; font-weight: bold; min-height: 22px; }
  </style>
</head>
<body>
  <div id="grille"></div>
  <div id="message"></div>
  <div id="blockly"></div>
  <pre id="code"></pre>
  <button id="go">▶ GO DINO !</button>

  <script src="build/blockly_compressed.js"></script>
  <script src="build/blocks_compressed.js"></script>
  <script src="build/python_compressed.js"></script>
  <script src="build/fr.js"></script>
  <script src="moteur-web.js"></script>
  <script src="rendu.js"></script>
  <script src="pont.js"></script>
  <script src="blocs.js"></script>
  <script src="atelier.js"></script>
</body>
</html>
```

- [ ] **Step 5 : Test manuel partiel**

Ouvrir `webview/index.html` dans un navigateur de bureau après avoir placé un `webview/atelier.js` minimal temporaire qui appelle `rendu.dessinerNiveau` avec le niveau 5.
Expected : la grille s'affiche avec dino, œufs, nid, mur.

- [ ] **Step 6 : Commit**

```bash
git add webview/
git commit -m "feat(webview): atelier page, grid renderer, RN bridge"
```

---

## Task 10 : Blocs Blockly + génération Python + AST

**Files:**
- Create: `webview/blocs.js`
- Create: `webview/atelier.js`
- Create: `webview/build/` (bundle Blockly)

- [ ] **Step 1 : Récupérer le bundle Blockly**

```bash
npm install blockly
```
Copier depuis `node_modules/blockly/` vers `webview/build/` les fichiers :
`blockly_compressed.js`, `blocks_compressed.js`, `python_compressed.js`, et `msg/js/fr.js` (renommé `fr.js`). Ces fichiers sont versionnés dans le repo pour le fonctionnement hors-ligne.

- [ ] **Step 2 : Définir les blocs et leurs générateurs**

`webview/blocs.js` :
```js
// Définit les blocs Yoshi Code + génération Python + conversion en AST.
Blockly.defineBlocksWithJsonArray([
  { type: 'y_avance', message0: '▶ Avance', previousStatement: null, nextStatement: null, colour: 120 },
  { type: 'y_tourne_droite', message0: '↳ Tourne à droite', previousStatement: null, nextStatement: null, colour: 30 },
  { type: 'y_tourne_gauche', message0: '↲ Tourne à gauche', previousStatement: null, nextStatement: null, colour: 30 },
  { type: 'y_gobe', message0: '🥚 Gobe l\'œuf', previousStatement: null, nextStatement: null, colour: 45 },
  { type: 'y_repete', message0: '🔁 Répète %1 fois %2 %3',
    args0: [
      { type: 'field_number', name: 'N', value: 2, min: 1, max: 20 },
      { type: 'input_dummy' },
      { type: 'input_statement', name: 'CORPS' },
    ], previousStatement: null, nextStatement: null, colour: 210 },
  { type: 'y_si', message0: 'Si %1 %2 %3',
    args0: [
      { type: 'field_dropdown', name: 'COND', options: [['mur devant', 'mur_devant'], ['œuf ici', 'oeuf_ici']] },
      { type: 'input_dummy' },
      { type: 'input_statement', name: 'CORPS' },
    ], previousStatement: null, nextStatement: null, colour: 260 },
]);

const G = Blockly.Python; // générateur Python
G.forBlock = G.forBlock || {};
G.forBlock['y_avance'] = () => 'dino.avance()\n';
G.forBlock['y_tourne_droite'] = () => 'dino.tourne_droite()\n';
G.forBlock['y_tourne_gauche'] = () => 'dino.tourne_gauche()\n';
G.forBlock['y_gobe'] = () => 'dino.gobe()\n';
G.forBlock['y_repete'] = (b) => {
  const n = b.getFieldValue('N');
  const corps = G.statementToCode(b, 'CORPS') || '  pass\n';
  return `for i in range(${n}):\n${corps}`;
};
G.forBlock['y_si'] = (b) => {
  const cond = b.getFieldValue('COND');
  const py = cond === 'mur_devant' ? 'dino.mur_devant()' : 'dino.oeuf_ici()';
  const corps = G.statementToCode(b, 'CORPS') || '  pass\n';
  return `if ${py}:\n${corps}`;
};

// Convertit l'espace de travail Blockly en AST pour le moteur.
function blocVersAst(bloc) {
  const liste = [];
  let b = bloc;
  while (b) {
    if (b.type === 'y_avance') liste.push({ type: 'avance' });
    else if (b.type === 'y_tourne_droite') liste.push({ type: 'tourne_droite' });
    else if (b.type === 'y_tourne_gauche') liste.push({ type: 'tourne_gauche' });
    else if (b.type === 'y_gobe') liste.push({ type: 'gobe' });
    else if (b.type === 'y_repete') {
      liste.push({ type: 'repete', n: Number(b.getFieldValue('N')),
        corps: blocVersAst(b.getInputTargetBlock('CORPS')) });
    } else if (b.type === 'y_si') {
      liste.push({ type: 'si', condition: b.getFieldValue('COND'),
        corps: blocVersAst(b.getInputTargetBlock('CORPS')) });
    }
    b = b.getNextBlock();
  }
  return liste;
}

function espaceVersAst(workspace) {
  const tops = workspace.getTopBlocks(true).filter((b) => !b.previousConnection || !b.previousConnection.targetBlock());
  // un seul fil de blocs attendu : prendre le premier bloc de tête
  const tete = tops[0];
  return tete ? blocVersAst(tete) : [];
}

window.blocs = { espaceVersAst };
```

- [ ] **Step 3 : Créer l'orchestrateur de l'atelier**

`webview/atelier.js` :
```js
// Relie Blockly, le moteur, le rendu et le pont RN.
let niveauCourant = null;
let workspace = null;

function toolbox(niveau) {
  const map = {
    avance: 'y_avance', tourne_droite: 'y_tourne_droite',
    tourne_gauche: 'y_tourne_gauche', gobe: 'y_gobe',
    repete: 'y_repete', si: 'y_si',
  };
  const blocs = niveau.blocs_autorises.map((b) => `<block type="${map[b]}"></block>`).join('');
  return `<xml>${blocs}</xml>`;
}

function chargerNiveau(niveau) {
  niveauCourant = niveau;
  if (workspace) workspace.dispose();
  workspace = Blockly.inject('blockly', { toolbox: toolbox(niveau), trashcan: true });
  workspace.addChangeListener(rafraichirCode);
  document.getElementById('message').textContent = niveau.objectif;
  window.rendu.dessinerNiveau(niveau, window.rendu.etatInitial(niveau));
  rafraichirCode();
}

function rafraichirCode() {
  const py = Blockly.Python.workspaceToCode(workspace) || '# pose des blocs ici';
  document.getElementById('code').textContent = py;
}

const MESSAGES_ECHEC = {
  mur: 'Oups, le dino a foncé dans un rocher ! 🪨',
  hors_grille: 'Le dino est sorti de la grotte !',
  oeufs_restants: 'Il reste des œufs à gober 🥚',
  pas_au_nid: 'Ramène le dino jusqu\'au nid 🍳',
  trop_de_pas: 'Le dino tourne en rond… vérifie ta boucle !',
};

async function lancer() {
  const ast = window.blocs.espaceVersAst(workspace);
  if (ast.length === 0) {
    document.getElementById('message').textContent = 'Pose au moins un bloc 🧩';
    return;
  }
  const resultat = window.executerProgramme(niveauCourant, ast);
  await window.rendu.animerTrace(niveauCourant, resultat.trace, null, 350);
  if (resultat.succes) {
    document.getElementById('message').textContent = 'Bravo ! 🎉';
    window.pont.envoyerARN({ type: 'niveau_reussi', niveauId: niveauCourant.id, ast });
  } else {
    document.getElementById('message').textContent = MESSAGES_ECHEC[resultat.raison] || 'Réessaie !';
    window.rendu.dessinerNiveau(niveauCourant, window.rendu.etatInitial(niveauCourant));
  }
}

document.getElementById('go').addEventListener('click', lancer);
window.pont.ecouterRN(chargerNiveau);
```

- [ ] **Step 4 : Test manuel en navigateur**

Ouvrir `webview/index.html` dans un navigateur, et dans la console : `chargerNiveau(/* coller le JSON du niveau 4 */)`. Assembler `Répète 4 fois → [Avance, Gobe]` puis `Avance`, cliquer GO.
Expected : le dino gobe les 3 œufs et atteint le nid, le code Python affiché correspond, message « Bravo ! 🎉 ».

- [ ] **Step 5 : Commit**

```bash
git add webview/
git commit -m "feat(webview): Blockly blocks, Python generation, AST + orchestration"
```

---

## Task 11 : Écran de jeu RN (héberge la WebView)

**Files:**
- Create: `app/screens/JeuScreen.js`
- Note : les fichiers `webview/` doivent être inclus comme assets. Utiliser un dossier `assets/atelier/` contenant une copie du dossier `webview/` (ou configurer `metro` pour servir le HTML). Approche retenue : charger le HTML via `source={{ uri }}` depuis un asset bundlé avec `expo-asset` + `expo-file-system`, OU plus simple pour démarrer : injecter le HTML en chaîne. Ici on bundle le dossier.

- [ ] **Step 1 : Installer les utilitaires d'assets**

```bash
npx expo install expo-asset expo-file-system
```

- [ ] **Step 2 : Préparer l'atelier comme asset**

Copier le dossier `webview/` complet dans `assets/atelier/` (script de copie, ajouté au `package.json` :
```json
"scripts": { "prebuild:atelier": "node -e \"require('fs').cpSync('webview','assets/atelier',{recursive:true})\"" }
```
Lancer : `npm run prebuild:atelier`.

- [ ] **Step 3 : Écrire JeuScreen**

`app/screens/JeuScreen.js` :
```js
import React, { useRef, useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';
import { Asset } from 'expo-asset';
import * as FileSystem from 'expo-file-system';
import niveaux from '../../levels';
import { enregistrerResultat } from '../storage/progression';
import { calculerEtoiles } from '../../core/etoiles';

export default function JeuScreen({ route, navigation }) {
  const niveauId = route.params.niveauId;
  const niveau = niveaux.find((n) => n.id === niveauId);
  const webRef = useRef(null);
  const [html, setHtml] = useState(null);

  useEffect(() => {
    (async () => {
      const asset = Asset.fromModule(require('../../assets/atelier/index.html'));
      await asset.downloadAsync();
      const contenu = await FileSystem.readAsStringAsync(asset.localUri);
      setHtml(contenu);
    })();
  }, []);

  function onLoadEnd() {
    webRef.current.postMessage(JSON.stringify({ type: 'charger_niveau', niveau }));
  }

  async function onMessage(event) {
    const msg = JSON.parse(event.nativeEvent.data);
    if (msg.type === 'niveau_reussi') {
      const etoiles = calculerEtoiles(niveau, msg.ast);
      await enregistrerResultat(niveau.id, etoiles, msg.ast.length);
      navigation.navigate('Carte', { vientDeReussir: niveau.id, etoiles });
    }
  }

  if (!html) return <View style={styles.plein} />;
  return (
    <View style={styles.plein}>
      <WebView
        ref={webRef}
        originWhitelist={['*']}
        source={{ html, baseUrl: 'file:///android_asset/' }}
        onLoadEnd={onLoadEnd}
        onMessage={onMessage}
        javaScriptEnabled
      />
    </View>
  );
}
const styles = StyleSheet.create({ plein: { flex: 1 } });
```
Note : si le chargement des scripts relatifs (`build/...`) pose problème via `baseUrl`, l'alternative robuste est de placer l'atelier sur le système de fichiers et charger `source={{ uri: localUri }}`. Tester les deux sur appareil et garder celle qui charge Blockly correctement (Step 4).

- [ ] **Step 4 : Test manuel sur émulateur Android**

Run : `npx expo run:android`, naviguer vers le niveau 4.
Expected : l'atelier s'affiche, Blockly fonctionne, GO anime le dino, la réussite renvoie à la carte.

- [ ] **Step 5 : Commit**

```bash
git add app/screens/JeuScreen.js assets/atelier package.json
git commit -m "feat(app): game screen hosting the Blockly atelier in a WebView"
```

---

## Task 12 : Écrans Accueil et Carte des niveaux + navigation

**Files:**
- Create: `app/App.js`, `app/screens/AccueilScreen.js`, `app/screens/CarteScreen.js`
- Install: navigation

- [ ] **Step 1 : Installer la navigation**

```bash
npx expo install @react-navigation/native @react-navigation/native-stack react-native-screens react-native-safe-area-context
```

- [ ] **Step 2 : Écrire la navigation racine**

`app/App.js` :
```js
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AccueilScreen from './screens/AccueilScreen';
import CarteScreen from './screens/CarteScreen';
import JeuScreen from './screens/JeuScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Accueil" screenOptions={{ headerStyle: { backgroundColor: '#16a34a' }, headerTintColor: '#fff' }}>
        <Stack.Screen name="Accueil" component={AccueilScreen} options={{ title: 'Yoshi Code' }} />
        <Stack.Screen name="Carte" component={CarteScreen} options={{ title: 'Les niveaux' }} />
        <Stack.Screen name="Jeu" component={JeuScreen} options={{ title: 'Atelier' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
```
Mettre à jour le point d'entrée : dans `package.json`, `"main": "app/App.js"` n'est pas standard Expo. Conserver le `App.js` racine généré par Expo et y ré-exporter : créer `App.js` à la racine avec `export { default } from './app/App';`.

- [ ] **Step 3 : Écrire l'accueil**

`app/screens/AccueilScreen.js` :
```js
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

export default function AccueilScreen({ navigation }) {
  return (
    <View style={styles.c}>
      <Text style={styles.titre}>🦖 Yoshi Code</Text>
      <Text style={styles.sous}>Apprends à coder avec le dino !</Text>
      <TouchableOpacity style={styles.bouton} onPress={() => navigation.navigate('Carte')}>
        <Text style={styles.boutonTxt}>▶ Jouer</Text>
      </TouchableOpacity>
    </View>
  );
}
const styles = StyleSheet.create({
  c: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#dcfce7' },
  titre: { fontSize: 40, fontWeight: 'bold', color: '#15803d' },
  sous: { fontSize: 16, color: '#166534', marginVertical: 12 },
  bouton: { backgroundColor: '#16a34a', paddingVertical: 14, paddingHorizontal: 40, borderRadius: 16, marginTop: 20 },
  boutonTxt: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
});
```

- [ ] **Step 4 : Écrire la carte des niveaux**

`app/screens/CarteScreen.js` :
```js
import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import niveaux from '../../levels';
import { lireProgression } from '../storage/progression';

export default function CarteScreen({ navigation }) {
  const [prog, setProg] = useState({});

  useFocusEffect(useCallback(() => {
    lireProgression().then(setProg);
  }, []));

  function etoilesPour(id) {
    const p = prog[String(id)];
    if (!p) return '☆☆☆';
    return '⭐'.repeat(p.etoiles) + '☆'.repeat(3 - p.etoiles);
  }

  function debloque(id) {
    if (id === 1) return true;
    return Boolean(prog[String(id - 1)]); // niveau précédent terminé
  }

  return (
    <ScrollView contentContainerStyle={styles.grille}>
      {niveaux.map((n) => {
        const ouvert = debloque(n.id);
        return (
          <TouchableOpacity
            key={n.id}
            disabled={!ouvert}
            style={[styles.case, !ouvert && styles.verrou]}
            onPress={() => navigation.navigate('Jeu', { niveauId: n.id })}
          >
            <Text style={styles.num}>{ouvert ? n.id : '🔒'}</Text>
            <Text style={styles.etoiles}>{etoilesPour(n.id)}</Text>
            <Text style={styles.titre}>{n.titre}</Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}
const styles = StyleSheet.create({
  grille: { flexDirection: 'row', flexWrap: 'wrap', padding: 12, justifyContent: 'center', backgroundColor: '#dcfce7' },
  case: { width: 100, height: 100, backgroundColor: '#22c55e', margin: 8, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  verrou: { backgroundColor: '#9ca3af' },
  num: { fontSize: 26, fontWeight: 'bold', color: '#fff' },
  etoiles: { fontSize: 12, color: '#fde68a' },
  titre: { fontSize: 10, color: '#fff', marginTop: 2 },
});
```

- [ ] **Step 5 : Test manuel**

Run : `npx expo run:android`.
Expected : Accueil → Jouer → Carte (niveau 1 ouvert, 2-12 verrouillés) → réussir le 1 débloque le 2, étoiles affichées.

- [ ] **Step 6 : Commit**

```bash
git add app/ App.js package.json
git commit -m "feat(app): home + level map screens with navigation and unlock logic"
```

---

## Task 13 : Réglages — réinitialiser la progression

**Files:**
- Modify: `app/screens/CarteScreen.js` (bouton réglages dans l'en-tête)
- Create: `app/screens/ReglagesScreen.js`
- Modify: `app/App.js` (ajouter la route)

- [ ] **Step 1 : Écrire l'écran de réglages**

`app/screens/ReglagesScreen.js` :
```js
import React from 'react';
import { View, Text, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { reinitialiser } from '../storage/progression';

export default function ReglagesScreen({ navigation }) {
  function confirmer() {
    Alert.alert('Réinitialiser ?', 'Toute la progression sera effacée.', [
      { text: 'Annuler', style: 'cancel' },
      { text: 'Effacer', style: 'destructive',
        onPress: async () => { await reinitialiser(); navigation.goBack(); } },
    ]);
  }
  return (
    <View style={styles.c}>
      <TouchableOpacity style={styles.bouton} onPress={confirmer}>
        <Text style={styles.txt}>🗑 Réinitialiser la progression</Text>
      </TouchableOpacity>
    </View>
  );
}
const styles = StyleSheet.create({
  c: { flex: 1, padding: 20, backgroundColor: '#dcfce7' },
  bouton: { backgroundColor: '#dc2626', padding: 16, borderRadius: 12 },
  txt: { color: '#fff', fontSize: 16, textAlign: 'center', fontWeight: 'bold' },
});
```

- [ ] **Step 2 : Ajouter la route et le bouton d'en-tête**

Dans `app/App.js`, ajouter l'import et la `Stack.Screen` :
```js
import ReglagesScreen from './screens/ReglagesScreen';
// ...
<Stack.Screen name="Reglages" component={ReglagesScreen} options={{ title: 'Réglages' }} />
```
Dans `CarteScreen.js`, ajouter dans le `useFocusEffect` voisin un bouton d'en-tête via `navigation.setOptions` :
```js
React.useLayoutEffect(() => {
  navigation.setOptions({
    headerRight: () => (
      <Text onPress={() => navigation.navigate('Reglages')} style={{ color: '#fff', fontSize: 22, marginRight: 8 }}>⚙</Text>
    ),
  });
}, [navigation]);
```

- [ ] **Step 3 : Test manuel**

Run : `npx expo run:android`. Carte → ⚙ → Effacer → confirmer.
Expected : la progression repart de zéro (seul le niveau 1 ouvert).

- [ ] **Step 4 : Commit**

```bash
git add app/
git commit -m "feat(app): settings screen to reset progression"
```

---

## Task 14 : Mode pas-à-pas (débogage)

**Files:**
- Modify: `webview/index.html` (bouton « ▶ pas suivant » + curseur vitesse)
- Modify: `webview/atelier.js`

- [ ] **Step 1 : Ajouter les contrôles dans le HTML**

Dans `webview/index.html`, sous le bouton `#go`, ajouter :
```html
<div style="display:flex; gap:6px; padding:6px;">
  <button id="lent" style="flex:1; padding:10px; background:#0ea5e9; color:#fff; border:none;">🐢 Lent</button>
  <button id="pas" style="flex:1; padding:10px; background:#8b5cf6; color:#fff; border:none;">▶ Pas suivant</button>
</div>
```

- [ ] **Step 2 : Implémenter pas-à-pas dans atelier.js**

Ajouter à la fin de `webview/atelier.js` :
```js
// Mode lent : rejoue l'animation à vitesse réduite.
document.getElementById('lent').addEventListener('click', async () => {
  const ast = window.blocs.espaceVersAst(workspace);
  if (ast.length === 0) return;
  const r = window.executerProgramme(niveauCourant, ast);
  await window.rendu.animerTrace(niveauCourant, r.trace, surLigneCode, 900);
});

// Mode pas-à-pas : avance d'un pas de trace à chaque clic.
let traceCourante = null, indexPas = 0, etatPas = null;
function preparerPasAPas() {
  const ast = window.blocs.espaceVersAst(workspace);
  const r = window.executerProgramme(niveauCourant, ast);
  traceCourante = r.trace; indexPas = 0;
  etatPas = window.rendu.etatInitial(niveauCourant);
  window.rendu.dessinerNiveau(niveauCourant, etatPas);
}
document.getElementById('pas').addEventListener('click', () => {
  if (!traceCourante || indexPas >= traceCourante.length) preparerPasAPas();
  if (indexPas >= traceCourante.length) return;
  const pas = traceCourante[indexPas];
  if (pas.action === 'avance') { etatPas.dino.x = pas.x; etatPas.dino.y = pas.y; }
  else if (pas.action === 'tourne') { etatPas.dino.direction = pas.direction; }
  else if (pas.action === 'gobe') {
    const o = etatPas.oeufs.find((e) => !e.gobe && e.x === pas.x && e.y === pas.y);
    if (o) o.gobe = true;
  }
  surLigneCode(indexPas);
  window.rendu.dessinerNiveau(niveauCourant, etatPas);
  indexPas += 1;
});

// Illumine la ligne de code correspondant à l'étape (approximation par index).
function surLigneCode(i) {
  const code = document.getElementById('code');
  const lignes = code.textContent.split('\n');
  code.innerHTML = lignes.map((l, idx) =>
    idx === Math.min(i, lignes.length - 1) ? `<span class="actif">${l}</span>` : l
  ).join('\n');
}
```
Réinitialiser `traceCourante = null` au début de `chargerNiveau` (ajouter la ligne dans la fonction existante).

- [ ] **Step 3 : Test manuel en navigateur**

Ouvrir `webview/index.html`, charger un niveau, poser des blocs, cliquer plusieurs fois « ▶ Pas suivant ».
Expected : le dino avance d'un pas par clic, la ligne de code active s'illumine.

- [ ] **Step 4 : Resync de l'asset et commit**

```bash
npm run prebuild:atelier
git add webview/ assets/atelier/
git commit -m "feat(webview): step-by-step debug mode and slow playback"
```

---

## Task 15 : Pipeline de build APK (GitHub Actions + EAS)

**Files:**
- Create: `eas.json`
- Create: `.github/workflows/build-apk.yml`
- Modify: `app.json`

- [ ] **Step 1 : Configurer app.json**

Dans `app.json`, sous `expo`, fixer `android.package` et le nom :
```json
{
  "expo": {
    "name": "Yoshi Code",
    "slug": "yoshi-code",
    "android": { "package": "fr.slynet.yoshicode", "versionCode": 1 }
  }
}
```

- [ ] **Step 2 : Configurer EAS pour un APK**

`eas.json` :
```json
{
  "cli": { "version": ">= 12.0.0" },
  "build": {
    "preview": {
      "android": { "buildType": "apk" },
      "distribution": "internal"
    }
  }
}
```

- [ ] **Step 3 : Workflow GitHub Actions (calqué sur le pipeline NSE4 tag→APK→release)**

`.github/workflows/build-apk.yml` :
```yaml
name: Build APK
on:
  push:
    tags: ['v*']
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20 }
      - uses: expo/expo-github-action@v8
        with:
          eas-version: latest
          token: ${{ secrets.EXPO_TOKEN }}
      - run: npm ci
      - run: npm run prebuild:atelier
      - run: eas build --platform android --profile preview --non-interactive --wait --output ./app.apk
      - uses: softprops/action-gh-release@v2
        with:
          files: ./app.apk
```

- [ ] **Step 4 : Vérifier les tests avant de tagger**

Run : `npx jest`
Expected : tous les tests verts (moteur, etoiles, chargeurNiveaux, niveaux, progression).

- [ ] **Step 5 : Commit, tag et déclenchement**

```bash
git add eas.json .github/workflows/build-apk.yml app.json
git commit -m "ci: APK build pipeline on version tags via EAS"
git tag v0.1.0
git push origin main --tags
```
Expected : GitHub Actions build l'APK et l'attache à une release `v0.1.0`. Pré-requis : repo privé `slynet76/yoshi-code` créé et secret `EXPO_TOKEN` configuré (réutiliser celui des autres projets).

---

## Self-Review (effectuée)

**Couverture du spec :**
- Public/approche (séquence→boucle→condition) → Tasks 4, 7 ✔
- ~12 niveaux + conditions → Task 7 ✔
- Panneau Python temps réel → Task 10 (`rafraichirCode`) ✔
- Système d'étoiles → Task 5 + intégration Task 11 ✔
- Sauvegarde locale + reset → Tasks 8, 13 ✔
- Hors-ligne → bundle Blockly versionné (Task 10), atelier en asset (Task 11) ✔
- Flux d'exécution + messages bienveillants → Task 10 (`MESSAGES_ECHEC`) ✔
- Mode pas-à-pas → Task 14 ✔
- Garde-fou boucle infinie → Task 4 (`LIMITE_PAS`) ✔
- Architecture RN + WebView + pont → Tasks 9-12 ✔
- Tests (moteur, niveaux, solvabilité, sauvegarde) → Tasks 2-8 ✔
- Distribution GitHub privé via pipeline → Task 15 ✔

**Cohérence des types :** AST (`avance/tourne_droite/tourne_gauche/gobe/repete{n,corps}/si{condition,corps}`) identique dans moteur (T4), etoiles (T5), blocs.js (T10). `executerProgramme(niveau, programme)` → `{succes, raison, oeufsGobes, positionFinale, trace}` cohérent partout. `enregistrerResultat(id, etoiles, blocs)` aligné entre T8 et T11.

**Placeholders :** la seule partie « à compléter » est volontaire — les solutions de référence des niveaux (T7) que l'implémenteur doit valider par le test de solvabilité ; c'est une boucle test-driven, pas un placeholder de code produit.
