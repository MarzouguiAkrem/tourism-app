import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { FavoritesStackParamList } from '../types/navigation';

import FavoritesScreen from '../screens/favorites/FavoritesScreen';
import PlaceDetailScreen from '../screens/places/PlaceDetailScreen';

const Stack = createNativeStackNavigator<FavoritesStackParamList>();

export default function FavoritesStackNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="FavoritesList" component={FavoritesScreen} />
      <Stack.Screen name="PlaceDetail" component={PlaceDetailScreen} />
    </Stack.Navigator>
  );
}
