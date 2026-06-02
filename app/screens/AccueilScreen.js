import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

export default function AccueilScreen({ navigation }) {
  return (
    <View style={styles.c}>
      <Text style={styles.titre}>🦖 Yoshi Code</Text>
      <Text style={styles.sous}>Apprends à coder avec le dino !</Text>
      <TouchableOpacity style={styles.bouton} onPress={() => navigation.navigate('Carte')}>
        <Text style={styles.boutonTxt}>▶ Jouer</Text>
      </TouchableOpacity>
    </View>
  );
}
const styles = StyleSheet.create({
  c: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#dcfce7' },
  titre: { fontSize: 40, fontWeight: 'bold', color: '#15803d' },
  sous: { fontSize: 16, color: '#166534', marginVertical: 12 },
  bouton: { backgroundColor: '#16a34a', paddingVertical: 14, paddingHorizontal: 40, borderRadius: 16, marginTop: 20 },
  boutonTxt: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
});
