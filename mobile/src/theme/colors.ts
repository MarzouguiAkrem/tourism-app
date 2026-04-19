// Tunisian cultural color palette
export const palette = {
  // Primary - Mediterranean sea
  mediterraneanBlue: '#1B4D8E',
  skyBlue: '#4A90D9',
  lightBlue: '#A3C4E8',

  // Tunisian architecture
  white: '#FFFFFF',
  offWhite: '#F8F9FA',

  // Accent - clay/pottery
  terracotta: '#C75B39',
  terracottaLight: '#E8845C',

  // Background warm - sand
  sand: '#F5E6D3',
  sandLight: '#FDF6EE',

  // Secondary - olive groves
  olive: '#6B8E4E',
  oliveLight: '#8FB06A',

  // Accent - mosaics/gold
  gold: '#D4A843',
  goldLight: '#E8C96E',

  // Neutrals
  gray50: '#F9FAFB',
  gray100: '#F3F4F6',
  gray200: '#E5E7EB',
  gray300: '#D1D5DB',
  gray400: '#9CA3AF',
  gray500: '#6B7280',
  gray600: '#4B5563',
  gray700: '#374151',
  gray800: '#1F2937',
  gray900: '#111827',

  // Semantic
  success: '#10B981',
  successLight: '#D1FAE5',
  warning: '#F59E0B',
  warningLight: '#FEF3C7',
  error: '#EF4444',
  errorLight: '#FEE2E2',
  info: '#3B82F6',
  infoLight: '#DBEAFE',

  // Transparent
  transparent: 'transparent',
  black: '#000000',
  overlay: 'rgba(0, 0, 0, 0.5)',
};

export const lightTheme = {
  background: palette.gray50,
  surface: palette.white,
  surfaceVariant: palette.sandLight,
  primary: palette.mediterraneanBlue,
  primaryLight: palette.skyBlue,
  accent: palette.terracotta,
  accentLight: palette.terracottaLight,
  secondary: palette.olive,
  secondaryLight: palette.oliveLight,
  gold: palette.gold,
  textPrimary: palette.gray900,
  textSecondary: palette.gray600,
  textTertiary: palette.gray400,
  textInverse: palette.white,
  border: palette.gray200,
  borderLight: palette.gray100,
  cardBackground: palette.white,
  tabBarBackground: palette.white,
  tabBarActive: palette.mediterraneanBlue,
  tabBarInactive: palette.gray400,
  inputBackground: palette.gray50,
  inputBorder: palette.gray300,
  placeholder: palette.gray400,
  skeleton: palette.gray200,
  success: palette.success,
  warning: palette.warning,
  error: palette.error,
  info: palette.info,
  statusBar: 'dark-content' as const,
};

export const darkTheme = {
  background: palette.gray900,
  surface: palette.gray800,
  surfaceVariant: palette.gray700,
  primary: palette.skyBlue,
  primaryLight: palette.mediterraneanBlue,
  accent: palette.terracottaLight,
  accentLight: palette.terracotta,
  secondary: palette.olive,
  secondaryLight: palette.oliveLight,
  gold: palette.goldLight,
  textPrimary: palette.gray50,
  textSecondary: palette.gray400,
  textTertiary: palette.gray500,
  textInverse: palette.gray900,
  border: palette.gray700,
  borderLight: palette.gray800,
  cardBackground: palette.gray800,
  tabBarBackground: palette.gray800,
  tabBarActive: palette.skyBlue,
  tabBarInactive: palette.gray500,
  inputBackground: palette.gray800,
  inputBorder: palette.gray600,
  placeholder: palette.gray500,
  skeleton: palette.gray700,
  success: palette.success,
  warning: palette.warning,
  error: palette.error,
  info: palette.info,
  statusBar: 'light-content' as const,
};

export type Theme = typeof lightTheme;
