import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ItineraryStackParamList } from '../types/navigation';

import MyItinerariesScreen from '../screens/itinerary/MyItinerariesScreen';

const Stack = createNativeStackNavigator<ItineraryStackParamList>();

export default function ItineraryStackNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="MyItineraries" component={MyItinerariesScreen} />
    </Stack.Navigator>
  );
}
