import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, StatusBar } from 'react-native';

export default function AccueilScreen({ navigation }) {
  return (
    <View style={styles.bg}>
      <StatusBar barStyle="dark-content" backgroundColor="#f0f4f8" />

      {/* Hero */}
      <View style={styles.hero}>
        <Text style={styles.logo}>🦖</Text>
        <Text style={styles.titre}>DinoCode</Text>
        <Text style={styles.sous}>Apprends à programmer{'\n'}en résolvant des défis</Text>
      </View>

      {/* Carte d'infos */}
      <View style={styles.carte}>
        <View style={styles.carteRow}>
          <Text style={styles.carteIcon}>🧩</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.carteTitle}>Blocs visuels</Text>
            <Text style={styles.carteSub}>Assemble des blocs pour programmer le dino</Text>
          </View>
        </View>
        <View style={[styles.carteRow, { borderTopWidth: 1, borderTopColor: '#e8edf2' }]}>
          <Text style={styles.carteIcon}>🐍</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.carteTitle}>Vrai Python</Text>
            <Text style={styles.carteSub}>Vois le code Python généré en temps réel</Text>
          </View>
        </View>
        <View style={[styles.carteRow, { borderTopWidth: 1, borderTopColor: '#e8edf2' }]}>
          <Text style={styles.carteIcon}>⭐</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.carteTitle}>12 niveaux progressifs</Text>
            <Text style={styles.carteSub}>Du plus simple aux boucles et conditions</Text>
          </View>
        </View>
      </View>

      {/* Bouton jouer */}
      <TouchableOpacity
        style={styles.bouton}
        onPress={() => navigation.navigate('Carte')}
        activeOpacity={0.85}
      >
        <Text style={styles.boutonTxt}>▶  Commencer</Text>
      </TouchableOpacity>

      <Text style={styles.version}>v0.1 — usage familial</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  bg: {
    flex: 1,
    backgroundColor: '#f0f4f8',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 32,
    justifyContent: 'center',
  },
  hero: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logo: { fontSize: 72, marginBottom: 8 },
  titre: {
    fontSize: 36,
    fontWeight: '800',
    color: '#1a2332',
    letterSpacing: 0.5,
  },
  sous: {
    fontSize: 16,
    color: '#4a5568',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 24,
  },
  carte: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 24,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  carteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 14,
  },
  carteIcon: { fontSize: 26 },
  carteTitle: { fontSize: 14, fontWeight: '700', color: '#1a2332', marginBottom: 2 },
  carteSub: { fontSize: 12, color: '#4a5568', lineHeight: 18 },
  bouton: {
    backgroundColor: '#1976d2',
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#1976d2',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  boutonTxt: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  version: {
    textAlign: 'center',
    color: '#9aa5b4',
    fontSize: 11,
    marginTop: 20,
  },
});
