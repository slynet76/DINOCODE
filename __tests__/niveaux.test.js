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
