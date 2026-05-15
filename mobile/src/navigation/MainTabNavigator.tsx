import React from 'react';
import { Platform } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { MainTabParamList } from '../types/navigation';
import { palette } from '../theme';

import HomeStackNavigator from './HomeStackNavigator';
import ExploreStackNavigator from './ExploreStackNavigator';
import ItineraryStackNavigator from './ItineraryStackNavigator';
import ProfileStackNavigator from './ProfileStackNavigator';
import FavoritesStackNavigator from './FavoritesStackNavigator';

const Tab = createBottomTabNavigator<MainTabParamList>();

const getTabIcon = (routeName: string, focused: boolean): keyof typeof Ionicons.glyphMap => {
  const icons: Record<string, keyof typeof Ionicons.glyphMap> = {
    Home: focused ? 'home' : 'home-outline',
    Explore: focused ? 'compass' : 'compass-outline',
    Itinerary: focused ? 'map' : 'map-outline',
    Favorites: focused ? 'heart' : 'heart-outline',
    Profile: focused ? 'person' : 'person-outline',
  };
  return icons[routeName] || 'ellipse';
};

export default function MainTabNavigator() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();

  // Floor the bottom inset to a sensible minimum so the tab bar never sits
  // right on the edge (Android edge-to-edge devices report 0 for `bottom`).
  const bottomPad = Math.max(insets.bottom, Platform.OS === 'android' ? 12 : 8);

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => (
          <Ionicons
            name={getTabIcon(route.name, focused)}
            size={size}
            color={color}
          />
        ),
        tabBarActiveTintColor: palette.mediterraneanBlue,
        tabBarInactiveTintColor: palette.gray400,
        tabBarStyle: {
          backgroundColor: palette.white,
          borderTopColor: palette.gray200,
          borderTopWidth: 1,
          paddingBottom: bottomPad,
          paddingTop: 8,
          height: 56 + bottomPad,
          elevation: 8,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.05,
          shadowRadius: 4,
        },
        tabBarItemStyle: {
          paddingVertical: 4,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '500' as const,
          marginTop: 2,
        },
        // Reserve room at the bottom of each screen for the absolute tab bar
        sceneContainerStyle: {
          backgroundColor: palette.gray50,
        },
      })}
    >
      <Tab.Screen
        name="Home"
        component={HomeStackNavigator}
        options={{ tabBarLabel: t('home') }}
      />
      <Tab.Screen
        name="Explore"
        component={ExploreStackNavigator}
        options={{ tabBarLabel: t('explore') }}
      />
      <Tab.Screen
        name="Itinerary"
        component={ItineraryStackNavigator}
        options={{ tabBarLabel: t('itinerary') }}
      />
      <Tab.Screen
        name="Favorites"
        component={FavoritesStackNavigator}
        options={{ tabBarLabel: t('favorites') }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileStackNavigator}
        options={{ tabBarLabel: t('profile') }}
      />
    </Tab.Navigator>
  );
}
