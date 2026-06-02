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
  traceCourante = null;
  if (workspace) workspace.dispose();
  workspace = Blockly.inject('blockly', {
    toolbox: toolbox(niveau),
    trashcan: true,
    theme: Blockly.Themes.Classic,
  });
  workspace.addChangeListener(rafraichirCode);

  // Objectif
  document.getElementById('message').textContent = niveau.objectif;

  // Info étoiles sous l'objectif (si l'élément existe)
  const el = document.getElementById('etoiles-info');
  if (el) {
    const nb = niveau.oeufs.length;
    el.textContent = nb > 0
      ? `👉 Guide le dino pour gober ${nb} œuf${nb > 1 ? 's' : ''} puis atteindre le nid ⭐`
      : '👉 Guide le dino jusqu\'au nid ⭐';
  }

  window.rendu.dessinerNiveau(niveau, window.rendu.etatInitial(niveau));
  rafraichirCode();
}

function rafraichirCode() {
  const py = Blockly.Python.workspaceToCode(workspace) || '# pose des blocs ici';
  document.getElementById('code').textContent = py;
  // Invalide le mode pas-à-pas : si l'utilisateur modifie des blocs entre deux clics,
  // la prochaine pression sur ▶ Pas repart du nouveau programme, pas de l'ancienne trace.
  traceCourante = null;
}

const MESSAGES_ECHEC = {
  mur: '🪨 Le dino a heurté un rocher — modifie la séquence et réessaie.',
  hors_grille: '⚠️ Le dino est sorti de la grille — vérifie le nombre d\'avances.',
  oeufs_restants: '🥚 Tous les œufs n\'ont pas été collectés — ajoute des blocs "Gobe".',
  pas_au_nid: '⭐ Le dino n\'est pas arrivé au nid — il manque des déplacements.',
  trop_de_pas: '🔁 Boucle trop longue — réduis le nombre de répétitions.',
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
window.chargerNiveau = chargerNiveau;

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
