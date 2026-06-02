import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AccueilScreen from './screens/AccueilScreen';
import CarteScreen from './screens/CarteScreen';
import JeuScreen from './screens/JeuScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Accueil" screenOptions={{ headerStyle: { backgroundColor: '#16a34a' }, headerTintColor: '#fff' }}>
        <Stack.Screen name="Accueil" component={AccueilScreen} options={{ title: 'Yoshi Code' }} />
        <Stack.Screen name="Carte" component={CarteScreen} options={{ title: 'Les niveaux' }} />
        <Stack.Screen name="Jeu" component={JeuScreen} options={{ title: 'Atelier' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
