import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { HomeStackParamList } from '../types/navigation';

import HomeScreen from '../screens/home/HomeScreen';
import PlaceDetailScreen from '../screens/places/PlaceDetailScreen';
import PlacesByCategoryScreen from '../screens/places/PlacesByCategoryScreen';
import CurrencyConverterScreen from '../screens/currency/CurrencyConverterScreen';
import CulturalScreen from '../screens/cultural/CulturalScreen';
import SafetyScreen from '../screens/safety/SafetyScreen';
import SOSScreen from '../screens/safety/SOSScreen';
import PricesScreen from '../screens/livingcost/PricesScreen';
import HeritageScreen from '../screens/home/HeritageScreen';

const Stack = createNativeStackNavigator<HomeStackParamList>();

export default function HomeStackNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="HomeMain" component={HomeScreen} />
      <Stack.Screen name="PlaceDetail" component={PlaceDetailScreen} />
      <Stack.Screen name="PlacesByCategory" component={PlacesByCategoryScreen} />
      <Stack.Screen name="CurrencyConverter" component={CurrencyConverterScreen} />
      <Stack.Screen name="CulturalGuide" component={CulturalScreen} />
      <Stack.Screen name="SafetyTips" component={SafetyScreen} />
      <Stack.Screen name="SOS" component={SOSScreen} />
      <Stack.Screen name="Prices" component={PricesScreen} />
      <Stack.Screen name="Heritage" component={HeritageScreen} />
    </Stack.Navigator>
  );
}
