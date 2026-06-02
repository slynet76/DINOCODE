import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ImageBackground } from 'react-native';

export default function AccueilScreen({ navigation }) {
  return (
    <View style={styles.bg}>
      {/* Ciel */}
      <View style={styles.ciel}>
        <Text style={styles.nuage}>☁️</Text>
        <Text style={[styles.nuage, { top: 30, left: '50%' }]}>☁️</Text>
        <Text style={[styles.nuage, { top: 10, right: 30, fontSize: 30 }]}>☁️</Text>
      </View>

      {/* Zone centrale */}
      <View style={styles.centre}>
        {/* Titre */}
        <View style={styles.carteTitre}>
          <Text style={styles.titre}>🦖 DINO CODE</Text>
          <Text style={styles.sous}>Apprends à coder avec Yoshi !</Text>
        </View>

        {/* Gros bouton JOUER style Nintendo */}
        <TouchableOpacity
          style={styles.boutonJouer}
          onPress={() => navigation.navigate('Carte')}
          activeOpacity={0.8}
        >
          <Text style={styles.boutonTxt}>▶  JOUER</Text>
        </TouchableOpacity>

        {/* Déco coins dorés */}
        <View style={styles.coins}>
          <Text style={styles.coin}>🟡</Text>
          <Text style={styles.coin}>🟡</Text>
          <Text style={styles.coin}>🟡</Text>
        </View>
      </View>

      {/* Sol herbe */}
      <View style={styles.sol}>
        <Text style={styles.solTxt}>🌿🌿🌿🌿🌿🌿🌿🌿🌿🌿🌿🌿</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bg: {
    flex: 1,
    backgroundColor: '#87ceeb',
  },
  ciel: {
    flex: 1,
    position: 'relative',
  },
  nuage: {
    position: 'absolute',
    top: 20,
    left: 30,
    fontSize: 40,
    opacity: 0.9,
  },
  centre: {
    flex: 2,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  carteTitre: {
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderRadius: 20,
    paddingVertical: 20,
    paddingHorizontal: 32,
    alignItems: 'center',
    marginBottom: 32,
    borderWidth: 3,
    borderColor: '#5dcf20',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
  titre: {
    fontSize: 36,
    fontWeight: '900',
    color: '#e83020',
    textShadowColor: '#8b1208',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 0,
    letterSpacing: 2,
  },
  sous: {
    fontSize: 15,
    color: '#2d5a0e',
    fontWeight: '600',
    marginTop: 8,
  },
  boutonJouer: {
    backgroundColor: '#e83020',
    paddingVertical: 18,
    paddingHorizontal: 60,
    borderRadius: 16,
    borderWidth: 4,
    borderColor: '#8b1208',
    shadowColor: '#8b1208',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 8,
  },
  boutonTxt: {
    color: '#ffd700',
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: 3,
    textShadowColor: '#8b1208',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 0,
  },
  coins: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
  },
  coin: {
    fontSize: 28,
  },
  sol: {
    backgroundColor: '#5a9e28',
    paddingVertical: 8,
    borderTopWidth: 4,
    borderTopColor: '#3a7d18',
  },
  solTxt: {
    fontSize: 16,
    textAlign: 'center',
  },
});
