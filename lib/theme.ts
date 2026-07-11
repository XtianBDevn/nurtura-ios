/**
 * Nurtura Design System — iOS
 * Premium care palette tuned for calm, clinical warmth.
 */

export const Colors = {
  light: {
    // Brand
    primary: '#276855',
    primaryLight: '#E6F0EB',
    primaryDark: '#173C34',
    accent: '#B88A44',
    accentLight: '#F6EEDC',
    lavender: '#756AA8',
    lavenderLight: '#ECE9F6',

    // Surfaces
    background: '#F7F5F0',
    surface: '#FFFFFF',
    surfaceMuted: '#EFEEE8',
    card: '#FFFFFF',
    cardRaised: '#FFFDF8',

    // Text
    text: '#16211F',
    textSecondary: '#66716D',
    textTertiary: '#9AA19D',
    textInverse: '#FFFFFF',

    // Borders
    border: '#DDD9CE',
    borderLight: '#ECE8DE',

    // Semantic
    success: '#22C55E',
    successBg: '#F0FDF4',
    warning: '#F59E0B',
    warningBg: '#FFFBEB',
    error: '#EF4444',
    errorBg: '#FEF2F2',
    info: '#3B82F6',
    infoBg: '#EFF6FF',

    // Chart colors (matching web)
    chart1: '#276855',
    chart2: '#B88A44',
    chart3: '#4977A3',
    chart4: '#756AA8',

    // Tab bar
    tabBar: '#FFFDF8',
    tabBarBorder: '#DDD9CE',
    tabBarActive: '#276855',
    tabBarInactive: '#8B938F',
  },
  dark: {
    primary: '#79B79D',
    primaryLight: '#1D342D',
    primaryDark: '#B6D9C9',
    accent: '#D7B171',
    accentLight: '#392E1C',
    lavender: '#B7AFE0',
    lavenderLight: '#29263C',

    background: '#101614',
    surface: '#18211E',
    surfaceMuted: '#222D29',
    card: '#18211E',
    cardRaised: '#1D2824',

    text: '#F5F2EA',
    textSecondary: '#B4BDB8',
    textTertiary: '#7E8B85',
    textInverse: '#09090B',

    border: '#2E3A35',
    borderLight: '#3C4944',

    success: '#22C55E',
    successBg: '#052E16',
    warning: '#F59E0B',
    warningBg: '#451A03',
    error: '#EF4444',
    errorBg: '#450A0A',
    info: '#3B82F6',
    infoBg: '#172554',

    chart1: '#79B79D',
    chart2: '#D7B171',
    chart3: '#86A9C9',
    chart4: '#B7AFE0',

    tabBar: '#18211E',
    tabBarBorder: '#2E3A35',
    tabBarActive: '#79B79D',
    tabBarInactive: '#7E8B85',
  },
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  '3xl': 32,
  '4xl': 40,
  '5xl': 48,
} as const;

export const Radius = {
  sm: 6,
  md: 8,
  lg: 10,
  xl: 12,
  '2xl': 16,
  full: 9999,
} as const;

export const Typography = {
  largeTitle: { fontSize: 34, fontWeight: '800' as const, lineHeight: 40 },
  title1: { fontSize: 28, fontWeight: '800' as const, lineHeight: 34 },
  title2: { fontSize: 23, fontWeight: '700' as const, lineHeight: 29 },
  title3: { fontSize: 20, fontWeight: '600' as const, lineHeight: 25 },
  headline: { fontSize: 17, fontWeight: '600' as const, lineHeight: 22 },
  body: { fontSize: 17, fontWeight: '400' as const, lineHeight: 22 },
  callout: { fontSize: 16, fontWeight: '400' as const, lineHeight: 21 },
  subheadline: { fontSize: 15, fontWeight: '400' as const, lineHeight: 20 },
  footnote: { fontSize: 13, fontWeight: '400' as const, lineHeight: 18 },
  caption1: { fontSize: 12, fontWeight: '400' as const, lineHeight: 16 },
  caption2: { fontSize: 11, fontWeight: '400' as const, lineHeight: 13 },
} as const;
