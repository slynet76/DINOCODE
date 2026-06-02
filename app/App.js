import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AccueilScreen from './screens/AccueilScreen';
import CarteScreen from './screens/CarteScreen';
import JeuScreen from './screens/JeuScreen';
import ReglagesScreen from './screens/ReglagesScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Accueil"
        screenOptions={{
          headerStyle: { backgroundColor: '#1976d2' },
          headerTintColor: '#ffffff',
          headerTitleStyle: { fontWeight: '700', fontSize: 17 },
          headerShadowVisible: false,
        }}
      >
        <Stack.Screen name="Accueil" component={AccueilScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Carte" component={CarteScreen} options={{ title: 'Niveaux' }} />
        <Stack.Screen name="Jeu" component={JeuScreen} options={{ title: 'Atelier de code' }} />
        <Stack.Screen name="Reglages" component={ReglagesScreen} options={{ title: 'Réglages' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
