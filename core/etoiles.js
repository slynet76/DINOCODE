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
