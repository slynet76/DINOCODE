import React, { useState, useCallback, useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import niveaux from '../../levels';
import { lireProgression } from '../storage/progression';

// Zones du monde (groupes de 4 niveaux, style Yoshi Island)
const ZONES = [
  { nom: 'Forêt de Yoshi',  couleur: '#5dcf20', fond: '#2d7a0e', niveaux: [1,2,3,4] },
  { nom: 'Grotte aux œufs', couleur: '#e8a020', fond: '#a05010', niveaux: [5,6,7,8] },
  { nom: 'Sommet des nuages', couleur: '#0ea5e9', fond: '#0369a1', niveaux: [9,10,11,12] },
];

export default function CarteScreen({ navigation }) {
  const [prog, setProg] = useState({});

  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Text onPress={() => navigation.navigate('Reglages')} style={styles.engrenage}>⚙</Text>
      ),
    });
  }, [navigation]);

  useFocusEffect(useCallback(() => {
    lireProgression().then(setProg);
  }, []));

  function etoilesPour(id) {
    const p = prog[String(id)];
    if (!p) return '☆☆☆';
    return '⭐'.repeat(p.etoiles) + '☆'.repeat(3 - p.etoiles);
  }

  function debloque(id) {
    if (id === 1) return true;
    return Boolean(prog[String(id - 1)]);
  }

  const cartes = useMemo(() => niveaux.map((n) => ({
    ...n,
    ouvert: debloque(n.id),
    etoiles: etoilesPour(n.id),
  })), [prog]);

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.contenu}>
      {ZONES.map((zone) => (
        <View key={zone.nom} style={styles.zone}>
          {/* Bandeau zone */}
          <View style={[styles.zoneHeader, { backgroundColor: zone.fond }]}>
            <Text style={styles.zoneNom}>🗺 {zone.nom}</Text>
          </View>

          {/* Grille niveaux de la zone */}
          <View style={[styles.zoneGrille, { borderColor: zone.fond }]}>
            {zone.niveaux.map((id) => {
              const n = cartes.find((c) => c.id === id);
              if (!n) return null;
              return (
                <TouchableOpacity
                  key={id}
                  disabled={!n.ouvert}
                  style={[
                    styles.case,
                    { backgroundColor: n.ouvert ? zone.couleur : '#b0b0b0' },
                    { borderColor: n.ouvert ? zone.fond : '#888' },
                    n.ouvert && styles.caseOuverte,
                  ]}
                  onPress={() => navigation.navigate('Jeu', { niveauId: id })}
                  activeOpacity={0.75}
                >
                  <Text style={styles.caseNum}>{n.ouvert ? id : '🔒'}</Text>
                  <Text style={styles.caseEtoiles}>{n.etoiles}</Text>
                  <Text style={styles.caseTitre} numberOfLines={2}>{n.titre}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { backgroundColor: '#87ceeb' },
  contenu: { padding: 10, paddingBottom: 24 },
  engrenage: { color: '#ffd700', fontSize: 22, marginRight: 10, fontWeight: 'bold' },

  zone: {
    marginBottom: 14,
    borderRadius: 14,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 5,
  },
  zoneHeader: {
    paddingVertical: 8,
    paddingHorizontal: 14,
  },
  zoneNom: {
    color: 'white',
    fontWeight: '900',
    fontSize: 15,
    letterSpacing: 0.5,
    textShadowColor: 'rgba(0,0,0,0.4)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  zoneGrille: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    backgroundColor: 'rgba(255,255,255,0.15)',
    padding: 8,
    gap: 8,
    justifyContent: 'center',
    borderWidth: 2,
    borderTopWidth: 0,
    borderBottomLeftRadius: 14,
    borderBottomRightRadius: 14,
  },

  case: {
    width: 80,
    height: 90,
    borderRadius: 14,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 4,
  },
  caseOuverte: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
  },
  caseNum: {
    fontSize: 24,
    fontWeight: '900',
    color: 'white',
    textShadowColor: 'rgba(0,0,0,0.4)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  caseEtoiles: { fontSize: 12, marginVertical: 1 },
  caseTitre: {
    fontSize: 9,
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 12,
  },
});
