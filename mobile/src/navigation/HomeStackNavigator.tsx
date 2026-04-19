import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { HomeStackParamList } from '../types/navigation';

import HomeScreen from '../screens/home/HomeScreen';
import PlaceDetailScreen from '../screens/places/PlaceDetailScreen';
import PlacesByCategoryScreen from '../screens/places/PlacesByCategoryScreen';

const Stack = createNativeStackNavigator<HomeStackParamList>();

export default function HomeStackNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="HomeMain" component={HomeScreen} />
      <Stack.Screen name="PlaceDetail" component={PlaceDetailScreen} />
      <Stack.Screen name="PlacesByCategory" component={PlacesByCategoryScreen} />
    </Stack.Navigator>
  );
}
