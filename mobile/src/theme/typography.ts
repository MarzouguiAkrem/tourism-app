import { TextStyle } from 'react-native';

// Font families
export const fonts = {
  latin: {
    regular: 'Poppins-Regular',
    semiBold: 'Poppins-SemiBold',
    bold: 'Poppins-Bold',
  },
  arabic: {
    regular: 'Cairo-Regular',
    semiBold: 'Cairo-SemiBold',
    bold: 'Cairo-Bold',
  },
};

// Typography scale
export const typography: Record<string, TextStyle> = {
  h1: {
    fontSize: 28,
    fontWeight: '700',
    lineHeight: 36,
  },
  h2: {
    fontSize: 24,
    fontWeight: '700',
    lineHeight: 32,
  },
  h3: {
    fontSize: 20,
    fontWeight: '600',
    lineHeight: 28,
  },
  h4: {
    fontSize: 18,
    fontWeight: '600',
    lineHeight: 26,
  },
  body: {
    fontSize: 16,
    fontWeight: '400',
    lineHeight: 24,
  },
  bodyMedium: {
    fontSize: 16,
    fontWeight: '500',
    lineHeight: 24,
  },
  bodySmall: {
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 20,
  },
  caption: {
    fontSize: 12,
    fontWeight: '400',
    lineHeight: 16,
  },
  captionMedium: {
    fontSize: 12,
    fontWeight: '500',
    lineHeight: 16,
  },
  button: {
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 24,
  },
  buttonSmall: {
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 20,
  },
  overline: {
    fontSize: 10,
    fontWeight: '600',
    lineHeight: 14,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
};
