import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AdminStackParamList } from '../types/navigation';

import AdminDashboardScreen from '../screens/admin/AdminDashboardScreen';
import RecommendationConfigScreen from '../screens/admin/RecommendationConfigScreen';
import AdminUsersScreen from '../screens/admin/AdminUsersScreen';
import AdminUserFormScreen from '../screens/admin/AdminUserFormScreen';
import AdminAlertsScreen from '../screens/admin/AdminAlertsScreen';
import AdminAlertFormScreen from '../screens/admin/AdminAlertFormScreen';
import AdminFeedbackListScreen from '../screens/admin/AdminFeedbackListScreen';
import AdminPlacesScreen from '../screens/admin/AdminPlacesScreen';
import AdminPlaceFormScreen from '../screens/admin/AdminPlaceFormScreen';

const Stack = createNativeStackNavigator<AdminStackParamList>();

export default function AdminStackNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="AdminDashboard" component={AdminDashboardScreen} />
      <Stack.Screen name="RecommendationConfig" component={RecommendationConfigScreen} />
      <Stack.Screen name="AdminUsers" component={AdminUsersScreen} />
      <Stack.Screen name="AdminUserForm" component={AdminUserFormScreen} />
      <Stack.Screen name="AdminAlerts" component={AdminAlertsScreen} />
      <Stack.Screen name="AdminAlertForm" component={AdminAlertFormScreen} />
      <Stack.Screen name="AdminFeedbackList" component={AdminFeedbackListScreen} />
      <Stack.Screen name="AdminPlaces" component={AdminPlacesScreen} />
      <Stack.Screen name="AdminPlaceForm" component={AdminPlaceFormScreen} />
    </Stack.Navigator>
  );
}
