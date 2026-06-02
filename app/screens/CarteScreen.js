import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import niveaux from '../../levels';
import { lireProgression } from '../storage/progression';

export default function CarteScreen({ navigation }) {
  const [prog, setProg] = useState({});

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

  return (
    <ScrollView contentContainerStyle={styles.grille}>
      {niveaux.map((n) => {
        const ouvert = debloque(n.id);
        return (
          <TouchableOpacity
            key={n.id}
            disabled={!ouvert}
            style={[styles.case, !ouvert && styles.verrou]}
            onPress={() => navigation.navigate('Jeu', { niveauId: n.id })}
          >
            <Text style={styles.num}>{ouvert ? n.id : '🔒'}</Text>
            <Text style={styles.etoiles}>{etoilesPour(n.id)}</Text>
            <Text style={styles.titre}>{n.titre}</Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}
const styles = StyleSheet.create({
  grille: { flexDirection: 'row', flexWrap: 'wrap', padding: 12, justifyContent: 'center', backgroundColor: '#dcfce7' },
  case: { width: 100, height: 100, backgroundColor: '#22c55e', margin: 8, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  verrou: { backgroundColor: '#9ca3af' },
  num: { fontSize: 26, fontWeight: 'bold', color: '#fff' },
  etoiles: { fontSize: 12, color: '#fde68a' },
  titre: { fontSize: 10, color: '#fff', marginTop: 2 },
});
