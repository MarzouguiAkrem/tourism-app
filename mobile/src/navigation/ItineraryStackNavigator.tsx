import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ItineraryStackParamList } from '../types/navigation';

import MyItinerariesScreen from '../screens/itinerary/MyItinerariesScreen';
import ItineraryPlannerScreen from '../screens/itinerary/ItineraryPlannerScreen';
import ItineraryResultScreen from '../screens/itinerary/ItineraryResultScreen';

const Stack = createNativeStackNavigator<ItineraryStackParamList>();

export default function ItineraryStackNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="MyItineraries" component={MyItinerariesScreen} />
      <Stack.Screen
        name="ItineraryPlanner"
        component={ItineraryPlannerScreen}
        options={{ presentation: 'modal', animation: 'slide_from_bottom' }}
      />
      <Stack.Screen name="ItineraryResult" component={ItineraryResultScreen} />
    </Stack.Navigator>
  );
}
