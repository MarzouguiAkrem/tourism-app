import React, { useEffect, useState } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';

import { store, persistor } from './src/store';
import RootNavigator from './src/navigation/RootNavigator';
import ThemedApp from './src/components/common/ThemedApp';
import { palette } from './src/theme';
import './src/i18n';

// Keep the Expo splash screen visible while we boot. If this throws (already
// hidden on hot reload, web, etc.) we don't want to crash the bundle.
SplashScreen.preventAutoHideAsync().catch(() => {});

function LoadingScreen() {
  return (
    <View style={styles.loading}>
      <ActivityIndicator size="large" color={palette.mediterraneanBlue} />
    </View>
  );
}

export default function App() {
  const [appIsReady, setAppIsReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        // await Font.loadAsync({ ... })
      } catch (e) {
        console.warn('[App] prepare error', e);
      } finally {
        if (!cancelled) setAppIsReady(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!appIsReady) return;
    SplashScreen.hideAsync().catch(() => {});
  }, [appIsReady]);

  useEffect(() => {
    const timer = setTimeout(() => {
      SplashScreen.hideAsync().catch(() => {});
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  if (!appIsReady) {
    return null;
  }

  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaProvider>
        <Provider store={store}>
          <PersistGate loading={<LoadingScreen />} persistor={persistor}>
            <ThemedApp>
              <RootNavigator />
            </ThemedApp>
          </PersistGate>
        </Provider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: palette.white,
  },
});
