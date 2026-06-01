const mockImpl = require('@react-native-async-storage/async-storage/jest/async-storage-mock');

jest.mock('@react-native-async-storage/async-storage', () => {
  const mock = require('@react-native-async-storage/async-storage/jest/async-storage-mock');
  mock.default = mock;
  return mock;
});

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
