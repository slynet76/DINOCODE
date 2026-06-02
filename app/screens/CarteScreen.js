import React, { useState, useCallback, useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import niveaux from '../../levels';
import { lireProgression } from '../storage/progression';

const SECTIONS = [
  { id: 'seq',  titre: 'Séquences',         niveaux: [1,2,3,4],   couleur: '#1976d2', icone: '▶' },
  { id: 'loop', titre: 'Boucles',            niveaux: [5,6,7,8],   couleur: '#388e3c', icone: '🔁' },
  { id: 'cond', titre: 'Conditions',         niveaux: [9,10,11,12],couleur: '#7b1fa2', icone: '❓' },
];

export default function CarteScreen({ navigation }) {
  const [prog, setProg] = useState({});

  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Text
          onPress={() => navigation.navigate('Reglages')}
          style={styles.headerBtn}
        >⚙️</Text>
      ),
    });
  }, [navigation]);

  useFocusEffect(useCallback(() => {
    lireProgression().then(setProg);
  }, []));

  const etoilesPour = (id) => {
    const p = prog[String(id)];
    if (!p) return '○ ○ ○';
    return '★'.repeat(p.etoiles) + '☆'.repeat(3 - p.etoiles);
  };

  const debloque = (id) => id === 1 || Boolean(prog[String(id - 1)]);

  const cartes = useMemo(() => niveaux.map((n) => ({
    ...n, ouvert: debloque(n.id), etoiles: etoilesPour(n.id),
  })), [prog]);

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.contenu}>

      {/* Progression globale */}
      <View style={styles.progBar}>
        <Text style={styles.progTxt}>
          {Object.keys(prog).length} / {niveaux.length} niveaux terminés
        </Text>
        <View style={styles.progTrack}>
          <View style={[styles.progFill, { width: `${(Object.keys(prog).length / niveaux.length) * 100}%` }]} />
        </View>
      </View>

      {SECTIONS.map((sec) => (
        <View key={sec.id} style={styles.section}>
          {/* En-tête section */}
          <View style={[styles.secHeader, { backgroundColor: sec.couleur }]}>
            <Text style={styles.secIcone}>{sec.icone}</Text>
            <Text style={styles.secTitre}>{sec.titre}</Text>
            <Text style={styles.secSub}>niveaux {sec.niveaux[0]}–{sec.niveaux[sec.niveaux.length-1]}</Text>
          </View>

          {/* Niveaux de la section */}
          <View style={styles.secGrille}>
            {sec.niveaux.map((id) => {
              const n = cartes.find((c) => c.id === id);
              if (!n) return null;
              const terminé = Boolean(prog[String(id)]);
              return (
                <TouchableOpacity
                  key={id}
                  disabled={!n.ouvert}
                  style={[
                    styles.niveauCard,
                    n.ouvert && { borderColor: sec.couleur },
                    terminé && { backgroundColor: sec.couleur + '12' },
                    !n.ouvert && styles.niveauVerrou,
                  ]}
                  onPress={() => navigation.navigate('Jeu', { niveauId: id })}
                  activeOpacity={0.75}
                >
                  <View style={[styles.niveauNum, n.ouvert && { backgroundColor: sec.couleur }]}>
                    <Text style={styles.niveauNumTxt}>{n.ouvert ? id : '🔒'}</Text>
                  </View>
                  <Text style={[styles.niveauTitre, !n.ouvert && { color: '#9aa5b4' }]} numberOfLines={2}>
                    {n.titre}
                  </Text>
                  <Text style={[styles.niveauEtoiles, { color: n.ouvert ? sec.couleur : '#ccc' }]}>
                    {n.etoiles}
                  </Text>
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
  scroll: { backgroundColor: '#f0f4f8' },
  contenu: { padding: 14, paddingBottom: 32, gap: 14 },
  headerBtn: { color: '#fff', fontSize: 20, marginRight: 12 },

  progBar: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    elevation: 1,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 4,
  },
  progTxt: { fontSize: 13, fontWeight: '600', color: '#4a5568', marginBottom: 8 },
  progTrack: { height: 8, backgroundColor: '#e2e8f0', borderRadius: 4, overflow: 'hidden' },
  progFill: { height: 8, backgroundColor: '#1976d2', borderRadius: 4 },

  section: {
    backgroundColor: '#fff',
    borderRadius: 14,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 6,
  },
  secHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    gap: 10,
  },
  secIcone: { fontSize: 18, color: 'white' },
  secTitre: { fontSize: 15, fontWeight: '800', color: 'white', flex: 1 },
  secSub: { fontSize: 11, color: 'rgba(255,255,255,0.75)' },

  secGrille: { flexDirection: 'row', padding: 10, gap: 8, flexWrap: 'wrap' },

  niveauCard: {
    width: 82,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    padding: 10,
    alignItems: 'center',
    gap: 5,
  },
  niveauVerrou: { borderColor: '#e2e8f0', backgroundColor: '#f8f9fa', opacity: 0.65 },
  niveauNum: {
    width: 32, height: 32,
    borderRadius: 16,
    backgroundColor: '#cbd5e0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  niveauNumTxt: { fontSize: 14, fontWeight: '800', color: 'white' },
  niveauTitre: { fontSize: 9, color: '#4a5568', fontWeight: '600', textAlign: 'center', lineHeight: 13 },
  niveauEtoiles: { fontSize: 11, letterSpacing: 1 },
});
