import React, { useEffect } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ActivityIndicator, View, StyleSheet, Text } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import { RootStackParamList } from '../types/navigation';
import { useAppSelector, useAppDispatch } from '../store/hooks';
import { loadUser } from '../store/slices/authSlice';
import { loadFavoriteIds, clearFavorites } from '../store/slices/favoritesSlice';
import { palette } from '../theme';
import { syncService } from '../services/sync.service';

import OnboardingScreen from '../screens/onboarding/OnboardingScreen';
import AuthNavigator from './AuthNavigator';
import MainTabNavigator from './MainTabNavigator';
import AdminStackNavigator from './AdminStackNavigator';
import OfflineBanner from '../components/feedback/OfflineBanner';
import AppLogo from '../components/common/AppLogo';

const Stack = createNativeStackNavigator<RootStackParamList>();

function SplashLoading() {
  return (
    <View style={styles.loading}>
      <AppLogo size={140} style={{ marginBottom: 16 }} />
      <Text style={styles.splashTitle}>Smart Tunisia Explore</Text>
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

  // Phase 8: download offline bundle once authenticated; auto-flush write queue
  // and refresh bundle when coming back online.
  useEffect(() => {
    if (!isAuthenticated) return;
    syncService.ensureBundle().catch(() => {});
    const sub = NetInfo.addEventListener((state) => {
      if (state.isConnected && state.isInternetReachable !== false) {
        syncService.flushQueue().catch(() => {});
        syncService.checkVersion().then((v) => {
          if (v.needsUpdate) syncService.downloadBundle().catch(() => {});
        });
      }
    });
    return () => sub();
  }, [isAuthenticated]);

  if (isLoading) {
    return <SplashLoading />;
  }

  return (
    <>
    <OfflineBanner />
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
        <>
          <Stack.Screen name="Main" component={MainTabNavigator} />
          <Stack.Screen name="Admin" component={AdminStackNavigator} />
        </>
      )}
    </Stack.Navigator>
    </>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: palette.sandLight,
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
