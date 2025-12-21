/**
 * Design System & Theme Configuration
 * React Native standard dark/light mode support
 */

// Light Theme Colors
export const LightColors = {
  // Primary Colors
  primary: '#7c3aed',
  primaryDark: '#6d28d9',
  primaryLight: '#5f259f',
  primaryTransparent: 'rgba(124, 58, 237, 0.2)',

  // Background Colors
  background: '#ffffff',
  backgroundSecondary: '#f9fafb',
  card: '#ffffff',
  bgLightPurple: '#f5f3ff',
  bgLightGreen: '#d1fae5',
  bgLightBlue: '#dbeafe',
  bgLightOrange: '#fff7ed',

  // Text Colors
  textPrimary: '#111827',
  textSecondary: '#6b7280',
  textTertiary: '#9ca3af',

  // Border Colors
  borderLight: '#e5e7eb',

  // Status Colors
  paymentGreen: '#059669',
  creditGreen: '#059669',
  creditRed: '#ef4444',
  orange: '#ea580c',
  blue: '#2563eb',

  // White & Black
  white: '#ffffff',
  black: '#000000',
};

// Dark Theme Colors (React Native standard dark mode)
export const DarkColors = {
  // Primary Colors
  primary: '#a78bfa',
  primaryDark: '#8b5cf6',
  primaryLight: '#c4b5fd',
  primaryTransparent: 'rgba(167, 139, 250, 0.2)',

  // Background Colors
  background: '#000000',
  backgroundSecondary: '#1a1a1a',
  card: '#1f1f1f',
  bgLightPurple: '#2e1065',
  bgLightGreen: '#064e3b',
  bgLightBlue: '#1e3a8a',
  bgLightOrange: '#7c2d12',

  // Text Colors
  textPrimary: '#f9fafb',
  textSecondary: '#d1d5db',
  textTertiary: '#9ca3af',

  // Border Colors
  borderLight: '#374151',

  // Status Colors
  paymentGreen: '#10b981',
  creditGreen: '#10b981',
  creditRed: '#f87171',
  orange: '#fb923c',
  blue: '#60a5fa',

  // White & Black
  white: '#ffffff',
  black: '#000000',
};

// Avatar Colors (same for both themes)
export const AvatarColors = [
  { bg: '#e9d5ff', text: '#7c3aed', bgDark: '#4c1d95', textDark: '#c4b5fd' }, // Purple
  { bg: '#fce7f3', text: '#db2777', bgDark: '#831843', textDark: '#f9a8d4' }, // Pink
  { bg: '#dbeafe', text: '#2563eb', bgDark: '#1e3a8a', textDark: '#93c5fd' }, // Blue
  { bg: '#cffafe', text: '#0891b2', bgDark: '#164e63', textDark: '#67e8f9' }, // Cyan
  { bg: '#d1fae5', text: '#059669', bgDark: '#064e3b', textDark: '#6ee7b7' }, // Green
  { bg: '#ccfbf1', text: '#0d9488', bgDark: '#134e4a', textDark: '#5eead4' }, // Mint
  { bg: '#fef3c7', text: '#d97706', bgDark: '#78350f', textDark: '#fcd34d' }, // Yellow
  { bg: '#fed7aa', text: '#ea580c', bgDark: '#7c2d12', textDark: '#fdba74' }, // Orange
  { bg: '#fee2e2', text: '#dc2626', bgDark: '#7f1d1d', textDark: '#fca5a5' }, // Red
  { bg: '#e0e7ff', text: '#4f46e5', bgDark: '#312e81', textDark: '#a5b4fc' }, // Indigo
];

// Helper function to get themed colors
export const getThemedColors = (isDark: boolean) => isDark ? DarkColors : LightColors;

// Legacy export for backward compatibility (defaults to light theme)
export const Colors = LightColors;

export const Typography = {
  // Font Sizes (reduced by 10% for mobile)
  font3xl: 43,  // was 48
  font2xl: 32,  // was 36
  fontXl: 25,   // was 28
  fontLg: 22,   // was 24
  fontMd: 16,   // was 18
  fontBase: 14, // was 16
  fontSm: 13,   // was 14
  fontXs: 12,   // was 13
  font2xs: 11,  // was 12
  font3xs: 10,  // was 11

  // Font Weights
  extraBold: '800' as const,
  bold: '700' as const,
  semiBold: '600' as const,
  medium: '500' as const,
  regular: '400' as const,
};

export const Spacing = {
  xs: 4,      // was 4 (no change)
  sm: 7,      // was 8
  md: 11,     // was 12
  lg: 14,     // was 16
  xl: 18,     // was 20
  space2: 7,  // was 8
  space3: 11, // was 12
  space4: 14, // was 16
  space5: 18, // was 20
  space6: 22, // was 24
  space8: 29, // was 32
  space12: 43, // was 48
  space16: 58, // was 64
  space20: 72, // was 80
  space24: 86, // was 96
  space28: 101, // was 112
};

export const BorderRadius = {
  sm: 7,   // was 8
  md: 11,  // was 12
  lg: 14,  // was 16
  xl: 18,  // was 20
  xxl: 22, // was 24
  full: 9999,
};

export const Shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 8,
  },
  purple: {
    shadowColor: '#7c3aed',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 32,
    elevation: 12,
  },
  fab: {
    shadowColor: '#7c3aed',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
};

export const Layout = {
  maxWidth: 614,        // was 768
  bottomNavHeight: 58,  // was 72
  appBarHeight: 45,     // was 56
  touchTarget: 35,      // was 44
};
