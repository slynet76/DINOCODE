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

// Blockly 12.x: Blockly.Python = pythonGenerator, uses forBlock dict.
// Older Blockly: direct assignment on the generator object.
// We assign BOTH for version robustness.
const G = Blockly.Python;
G.forBlock = G.forBlock || {};

G.forBlock['y_avance'] = G['y_avance'] = () => 'dino.avance()\n';
G.forBlock['y_tourne_droite'] = G['y_tourne_droite'] = () => 'dino.tourne_droite()\n';
G.forBlock['y_tourne_gauche'] = G['y_tourne_gauche'] = () => 'dino.tourne_gauche()\n';
G.forBlock['y_gobe'] = G['y_gobe'] = () => 'dino.gobe()\n';
G.forBlock['y_repete'] = G['y_repete'] = (b) => {
  const n = b.getFieldValue('N');
  const corps = G.statementToCode(b, 'CORPS') || '  pass\n';
  return `for i in range(${n}):\n${corps}`;
};
G.forBlock['y_si'] = G['y_si'] = (b) => {
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
  const tete = tops[0];
  return tete ? blocVersAst(tete) : [];
}

window.blocs = { espaceVersAst };
