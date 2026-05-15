import React, { ReactNode, useMemo } from 'react';
import { useColorScheme } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import {
  NavigationContainer,
  DefaultTheme as NavDefaultTheme,
  DarkTheme as NavDarkTheme,
  Theme as NavTheme,
} from '@react-navigation/native';

import { useAppSelector } from '../../store/hooks';
import {
  ThemeContext,
  lightTheme,
  darkTheme,
  palette,
  Theme,
} from '../../theme';

/**
 * Reads the user's theme preference from Redux (`settings.theme`):
 *  - 'light'  → always lightTheme
 *  - 'dark'   → always darkTheme
 *  - 'system' → follows the device's color scheme via useColorScheme()
 *
 * Pushes the resolved theme to:
 *  - our app-wide ThemeContext (consumed via `useTheme()`)
 *  - the React Navigation theme (controls screen backgrounds and headers)
 *  - the StatusBar style (icons color: light vs dark)
 */
export default function ThemedApp({ children }: { children: ReactNode }) {
  const themeMode = useAppSelector((s) => s.settings.theme);
  const systemScheme = useColorScheme();
  const isDark =
    themeMode === 'dark' || (themeMode === 'system' && systemScheme === 'dark');

  const theme: Theme = isDark ? darkTheme : lightTheme;

  const navTheme: NavTheme = useMemo(
    () => ({
      ...(isDark ? NavDarkTheme : NavDefaultTheme),
      colors: {
        ...(isDark ? NavDarkTheme.colors : NavDefaultTheme.colors),
        background: theme.background,
        card: theme.surface,
        text: theme.textPrimary,
        border: theme.border,
        primary: theme.primary,
        notification: palette.terracotta,
      },
    }),
    [isDark, theme]
  );

  return (
    <ThemeContext.Provider value={{ theme, isDark }}>
      <NavigationContainer theme={navTheme}>
        {children}
        <StatusBar style={isDark ? 'light' : 'dark'} />
      </NavigationContainer>
    </ThemeContext.Provider>
  );
}
