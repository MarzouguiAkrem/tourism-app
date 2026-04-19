import React, { createContext, useContext } from 'react';
import { lightTheme, darkTheme, Theme } from './colors';

export { palette, lightTheme, darkTheme } from './colors';
export type { Theme } from './colors';
export { typography, fonts } from './typography';
export { spacing, borderRadius, shadows } from './spacing';

// Theme context
interface ThemeContextValue {
  theme: Theme;
  isDark: boolean;
}

export const ThemeContext = createContext<ThemeContextValue>({
  theme: lightTheme,
  isDark: false,
});

export const useTheme = () => useContext(ThemeContext);
