import React, { useEffect } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ActivityIndicator, View, StyleSheet, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { RootStackParamList } from '../types/navigation';
import { useAppSelector, useAppDispatch } from '../store/hooks';
import { loadUser } from '../store/slices/authSlice';
import { loadFavoriteIds, clearFavorites } from '../store/slices/favoritesSlice';
import { palette } from '../theme';

import OnboardingScreen from '../screens/onboarding/OnboardingScreen';
import AuthNavigator from './AuthNavigator';
import MainTabNavigator from './MainTabNavigator';

const Stack = createNativeStackNavigator<RootStackParamList>();

function SplashLoading() {
  return (
    <View style={styles.loading}>
      <View style={styles.splashLogo}>
        <Ionicons name="airplane" size={48} color={palette.white} />
      </View>
      <Text style={styles.splashTitle}>Tunisia Travel</Text>
      <ActivityIndicator
        size="small"
        color={palette.mediterraneanBlue}
        style={styles.spinner}
      />
    </View>
  );
}

export default function RootNavigator() {
  const dispatch = useAppDispatch();
  const { isAuthenticated, isLoading, hasOnboarded } = useAppSelector(
    (state) => state.auth
  );

  useEffect(() => {
    dispatch(loadUser());
  }, [dispatch]);

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(loadFavoriteIds());
    } else {
      dispatch(clearFavorites());
    }
  }, [isAuthenticated, dispatch]);

  if (isLoading) {
    return <SplashLoading />;
  }

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'fade',
      }}
    >
      {!hasOnboarded ? (
        <Stack.Screen name="Onboarding" component={OnboardingScreen} />
      ) : !isAuthenticated ? (
        <Stack.Screen name="Auth" component={AuthNavigator} />
      ) : (
        <Stack.Screen name="Main" component={MainTabNavigator} />
      )}
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: palette.white,
  },
  splashLogo: {
    width: 80,
    height: 80,
    borderRadius: 20,
    backgroundColor: palette.mediterraneanBlue,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  splashTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: palette.mediterraneanBlue,
    marginBottom: 24,
  },
  spinner: {
    marginTop: 8,
  },
});
