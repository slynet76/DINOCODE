const { compterBlocs, contientBoucleOuCondition, calculerEtoiles } = require('../core/etoiles');

test('compterBlocs compte les instructions, corps inclus', () => {
  const prog = [
    { type: 'avance' },
    { type: 'repete', n: 2, corps: [{ type: 'avance' }, { type: 'gobe' }] },
  ];
  expect(compterBlocs(prog)).toBe(4);
});

test('contientBoucleOuCondition détecte repete et si', () => {
  expect(contientBoucleOuCondition([{ type: 'avance' }])).toBe(false);
  expect(contientBoucleOuCondition([{ type: 'repete', n: 2, corps: [] }])).toBe(true);
  expect(contientBoucleOuCondition([{ type: 'si', condition: 'oeuf_ici', corps: [] }])).toBe(true);
});

test('calculerEtoiles : 3 si peu de blocs + boucle/condition', () => {
  const niveau = { etoiles: { max_blocs_3: 3, max_blocs_2: 6 } };
  const prog = [{ type: 'repete', n: 3, corps: [{ type: 'avance' }] }];
  expect(calculerEtoiles(niveau, prog)).toBe(3);
});

test('calculerEtoiles : 2 si peu de blocs sans boucle', () => {
  const niveau = { etoiles: { max_blocs_3: 3, max_blocs_2: 6 } };
  const prog = [{ type: 'avance' }, { type: 'avance' }, { type: 'avance' }];
  expect(calculerEtoiles(niveau, prog)).toBe(2);
});

test('calculerEtoiles : 1 si beaucoup de blocs', () => {
  const niveau = { etoiles: { max_blocs_3: 3, max_blocs_2: 6 } };
  const prog = Array(8).fill({ type: 'avance' });
  expect(calculerEtoiles(niveau, prog)).toBe(1);
});
