/**
 * Nurtura Design System — iOS
 * Sage green palette matching web app
 */

export const Colors = {
  light: {
    // Brand
    primary: '#3D7A5F',
    primaryLight: '#E8F5EE',
    primaryDark: '#2D5A47',

    // Surfaces
    background: '#FFFFFF',
    surface: '#FFFFFF',
    surfaceMuted: '#F4F4F5',
    card: '#FFFFFF',

    // Text
    text: '#09090B',
    textSecondary: '#71717A',
    textTertiary: '#A1A1AA',
    textInverse: '#FFFFFF',

    // Borders
    border: '#E4E4E7',
    borderLight: '#F4F4F5',

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
    chart1: '#3D7A5F',
    chart2: '#F59E0B',
    chart3: '#3B82F6',
    chart4: '#8B5CF6',

    // Tab bar
    tabBar: '#FFFFFF',
    tabBarBorder: '#E4E4E7',
    tabBarActive: '#3D7A5F',
    tabBarInactive: '#A1A1AA',
  },
  dark: {
    primary: '#4E9B76',
    primaryLight: '#1A2E24',
    primaryDark: '#6BB893',

    background: '#09090B',
    surface: '#18181B',
    surfaceMuted: '#27272A',
    card: '#18181B',

    text: '#FAFAFA',
    textSecondary: '#A1A1AA',
    textTertiary: '#71717A',
    textInverse: '#09090B',

    border: '#27272A',
    borderLight: '#3F3F46',

    success: '#22C55E',
    successBg: '#052E16',
    warning: '#F59E0B',
    warningBg: '#451A03',
    error: '#EF4444',
    errorBg: '#450A0A',
    info: '#3B82F6',
    infoBg: '#172554',

    chart1: '#4E9B76',
    chart2: '#F59E0B',
    chart3: '#60A5FA',
    chart4: '#A78BFA',

    tabBar: '#18181B',
    tabBarBorder: '#27272A',
    tabBarActive: '#4E9B76',
    tabBarInactive: '#71717A',
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
  md: 10,
  lg: 12,
  xl: 16,
  '2xl': 20,
  full: 9999,
} as const;

export const Typography = {
  largeTitle: { fontSize: 34, fontWeight: '700' as const, lineHeight: 41 },
  title1: { fontSize: 28, fontWeight: '700' as const, lineHeight: 34 },
  title2: { fontSize: 22, fontWeight: '700' as const, lineHeight: 28 },
  title3: { fontSize: 20, fontWeight: '600' as const, lineHeight: 25 },
  headline: { fontSize: 17, fontWeight: '600' as const, lineHeight: 22 },
  body: { fontSize: 17, fontWeight: '400' as const, lineHeight: 22 },
  callout: { fontSize: 16, fontWeight: '400' as const, lineHeight: 21 },
  subheadline: { fontSize: 15, fontWeight: '400' as const, lineHeight: 20 },
  footnote: { fontSize: 13, fontWeight: '400' as const, lineHeight: 18 },
  caption1: { fontSize: 12, fontWeight: '400' as const, lineHeight: 16 },
  caption2: { fontSize: 11, fontWeight: '400' as const, lineHeight: 13 },
} as const;
