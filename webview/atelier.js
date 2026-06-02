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
window.chargerNiveau = chargerNiveau;
