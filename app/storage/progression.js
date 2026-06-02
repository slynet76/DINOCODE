const AsyncStorage = require('@react-native-async-storage/async-storage').default;

const CLE = 'yoshi-code:progression';

async function lireProgression() {
  const brut = await AsyncStorage.getItem(CLE);
  return brut ? JSON.parse(brut) : {};
}

async function enregistrerResultat(niveauId, etoiles, blocs) {
  const p = await lireProgression();
  const courant = p[String(niveauId)];
  // Met à jour si : première fois, ou plus d'étoiles, ou même étoiles avec moins de blocs
  if (!courant || etoiles > courant.etoiles || (etoiles === courant.etoiles && blocs < courant.blocs)) {
    p[String(niveauId)] = { etoiles, blocs };
  }
  await AsyncStorage.setItem(CLE, JSON.stringify(p));
  return p;
}

async function reinitialiser() {
  await AsyncStorage.removeItem(CLE);
}

module.exports = { lireProgression, enregistrerResultat, reinitialiser };
