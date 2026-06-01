const A = { type: 'avance' };
const G = { type: 'gobe' };
const TD = { type: 'tourne_droite' };
const TG = { type: 'tourne_gauche' };

module.exports = {
  // Level 1: 3x1, (0,0)->right, nid (2,0), no eggs. Just advance twice.
  1: [A, A],

  // Level 2: 3x3, (0,0)->right, nid (2,2), no eggs.
  // A,A->(2,0), TD->down, A,A->(2,2)=nid
  2: [A, A, TD, A, A],

  // Level 3: 4x1, (0,0)->right, eggs (1,0),(2,0), nid (3,0).
  // A->(1,0),G, A->(2,0),G, A->(3,0)=nid
  3: [A, G, A, G, A],

  // Level 4: 5x1, (0,0)->right, eggs (1,0),(2,0),(3,0), nid (4,0).
  // repete 3: A->pos,G then final A->nid
  4: [{ type: 'repete', n: 3, corps: [A, G] }, A],

  // Level 5: 4x3, (0,0)->right, eggs (2,0),(3,1), nid (3,2). Wall at (1,1).
  // A->(1,0),A->(2,0),G egg(2,0), TD->down,A->(2,1),TG->right,A->(3,1),G egg(3,1), TD->down,A->(3,2)=nid
  5: [A, A, G, TD, A, TG, A, G, TD, A],

  // Level 6: 3x3, (0,0)->right, eggs (2,0),(2,2),(0,2), nid (0,0).
  // repete 3: A,A,G,TD goes around perimeter collecting eggs
  // After loop: at (0,2) facing up -> A->(0,1)->A->(0,0)=nid
  6: [{ type: 'repete', n: 3, corps: [A, A, G, TD] }, A, A],

  // Level 7: 6x1, (0,0)->right, eggs (1,0)..(4,0), nid (5,0).
  // repete 4: A,G collects all eggs, final A->nid
  7: [{ type: 'repete', n: 4, corps: [A, G] }, A],

  // Level 8: 5x1, (0,0)->right, eggs (1,0),(3,0), nid (4,0).
  // repete 4: A then si oeuf_ici: G  -> collects only when egg present
  8: [{ type: 'repete', n: 4, corps: [A, { type: 'si', condition: 'oeuf_ici', corps: [G] }] }],

  // Level 9: 5x2, (0,0)->right, egg (2,0), nid (4,1). Wall at (3,0).
  // A->(1,0),A->(2,0),G egg, TD->down,A->(2,1),TG->right,A->(3,1),A->(4,1)=nid
  9: [A, A, G, TD, A, TG, A, A],

  // Level 10: 5x3, (0,0)->right, eggs (1,0),(3,0), nid (4,2). Walls (2,0),(2,1).
  // Route: A->(1,0),G egg1, TD->down,A->(1,1),A->(1,2), TG->right,A->(2,2),A->(3,2),
  //        TG->up,A->(3,1),A->(3,0),G egg2, TD->right,A->(4,0), TD->down,A->(4,1),A->(4,2)=nid
  10: [A, G, TD, A, A, TG, A, A, TG, A, A, G, TD, A, TD, A, A],

  // Level 11: 4x4, (0,0)->right, eggs (3,0),(3,3),(0,3), nid (1,1). No walls.
  // Spiral: right 3 cells collecting egg, down 3 collecting egg, left 3 collecting egg,
  // up 3 back to corner, then right to x=1, down to y=1 = nid
  11: [A, A, A, G, TD, A, A, A, G, TD, A, A, A, G, TD, A, A, A, TD, A, TD, A],

  // Level 12: 6x4, (0,0)->right, eggs (5,0),(5,3),(0,3),(2,1), nid (3,2). Walls (1,1),(4,2).
  // Route:
  //   A->(1,0),A->(2,0), TD->down,A->(2,1),G egg(2,1),
  //   TG->right,A->(3,1),A->(4,1),A->(5,1),
  //   TG->up,A->(5,0),G egg(5,0),
  //   TD->right,TD->down,A->(5,1),A->(5,2),A->(5,3),G egg(5,3),
  //   TD->left,A->(4,3),A->(3,3),A->(2,3),A->(1,3),A->(0,3),G egg(0,3),
  //   TD->up,A->(0,2),
  //   TD->right,A->(1,2),A->(2,2),A->(3,2)=nid
  12: [A, A, TD, A, G, TG, A, A, A, TG, A, G, TD, TD, A, A, A, G, TD, A, A, A, A, A, G, TD, A, TD, A, A, A],
};
