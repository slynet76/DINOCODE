import React from 'react';
import { View, Text, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { reinitialiser } from '../storage/progression';

export default function ReglagesScreen({ navigation }) {
  function confirmer() {
    Alert.alert('Réinitialiser ?', 'Toute la progression sera effacée.', [
      { text: 'Annuler', style: 'cancel' },
      { text: 'Effacer', style: 'destructive',
        onPress: async () => { await reinitialiser(); navigation.goBack(); } },
    ]);
  }
  return (
    <View style={styles.c}>
      <TouchableOpacity style={styles.bouton} onPress={confirmer}>
        <Text style={styles.txt}>🗑 Réinitialiser la progression</Text>
      </TouchableOpacity>
    </View>
  );
}
const styles = StyleSheet.create({
  c: { flex: 1, padding: 20, backgroundColor: '#dcfce7' },
  bouton: { backgroundColor: '#dc2626', padding: 16, borderRadius: 12 },
  txt: { color: '#fff', fontSize: 16, textAlign: 'center', fontWeight: 'bold' },
});
