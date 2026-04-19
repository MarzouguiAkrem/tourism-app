import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
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
          paddingBottom: 4,
          height: 60,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '500' as const,
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
