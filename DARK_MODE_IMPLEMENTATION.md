# Dark Mode Implementation Guide

## ✅ Completed Changes

### 1. Theme System (20% UI Scale Reduction Applied)
- **Created**: `src/context/ThemeContext.tsx` - React Context for managing theme state
- **Updated**: `src/constants/theme.ts` - Added LightColors and DarkColors, reduced all sizes by 20%
- **Created**: `src/hooks/useThemedColors.ts` - Helper hook for easy theme access

### 2. Core App Structure
- **Updated**: `App.tsx` - Wrapped app with ThemeProvider, integrated React Navigation themes
- **Default Theme**: Dark mode (as requested)

### 3. Screens Updated
- ✅ **ProfileScreen** - Full dark mode support + theme toggle added
- ✅ **DashboardScreen** - Full dark mode support with avatar colors
- ✅ **LoginScreen** - Full dark mode support

## 📝 How to Update Remaining Screens

For each screen, follow these steps:

### Step 1: Update Imports
```tsx
// OLD
import { Colors, Typography, Spacing... } from '../../constants/theme';

// NEW
import { getThemedColors, Typography, Spacing... } from '../../constants/theme';
import { useTheme } from '../../context/ThemeContext';
```

### Step 2: Add Theme Hook to Component
```tsx
export default function YourScreen({ navigation }: any) {
  const { isDark } = useTheme();
  const Colors = getThemedColors(isDark);
  // ... rest of component
}
```

### Step 3: Update Container Styles
```tsx
// OLD
<View style={styles.container}>

// NEW
<View style={[styles.container, { backgroundColor: Colors.background }]}>
```

### Step 4: Update Text Styles
```tsx
// OLD
<Text style={styles.title}>Hello</Text>

// NEW
<Text style={[styles.title, { color: Colors.textPrimary }]}>Hello</Text>
```

### Step 5: Update Card/Surface Backgrounds
```tsx
// OLD
<View style={styles.card}>

// NEW
<View style={[styles.card, { backgroundColor: Colors.card }]}>
```

### Step 6: Remove Hardcoded Colors from StyleSheet
```tsx
// OLD
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff', // ❌ Remove this
  },
  text: {
    color: '#111827', // ❌ Remove this
  },
});

// NEW
const styles = StyleSheet.create({
  container: {
    flex: 1,
    // backgroundColor moved to inline style
  },
  text: {
    // color moved to inline style
  },
});
```

### Step 7: Handle Conditional Dark Mode Colors
```tsx
// For colors that differ significantly
<View style={[
  styles.icon,
  { backgroundColor: isDark ? '#4c1d95' : '#f5f3ff' }
]}>
```

## 🎨 Available Colors

### Light Theme Colors
- `background`: '#ffffff'
- `backgroundSecondary`: '#f9fafb'
- `card`: '#ffffff'
- `textPrimary`: '#111827'
- `textSecondary`: '#6b7280'
- `textTertiary`: '#9ca3af'
- `primary`: '#7c3aed'
- `borderLight`: '#e5e7eb'

### Dark Theme Colors
- `background`: '#000000'
- `backgroundSecondary`: '#1a1a1a'
- `card`: '#1f1f1f'
- `textPrimary`: '#f9fafb'
- `textSecondary`: '#d1d5db'
- `textTertiary`: '#9ca3af'
- `primary`: '#a78bfa'
- `borderLight`: '#374151'

## 📦 Remaining Screens to Update

1. **RegisterScreen** - Auth/RegisterScreen.tsx
2. **CustomersScreen** - Customers/CustomersScreen.tsx
3. **CustomerDetailsScreen** - Customers/CustomerDetailsScreen.tsx
4. **AddCustomerScreen** - Customers/AddCustomerScreen.tsx
5. **ProductsScreen** - Products/ProductsScreen.tsx
6. **AddProductScreen** - Products/AddProductScreen.tsx
7. **TransactionsScreen** - Transactions/TransactionsScreen.tsx
8. **BusinessScreen** - Business/BusinessScreen.tsx
9. **QRCodeScreen** - Business/QRCodeScreen.tsx

## 🚀 Testing

1. Open the app (defaults to dark mode)
2. Navigate to Profile screen
3. Toggle the "Dark Mode" switch
4. Navigate through all screens to verify theming
5. Check that all text is readable in both modes
6. Verify borders and shadows are visible

## 📏 UI Scale Changes

All typography, spacing, and layout values have been reduced by 20%:
- Font sizes: e.g., 16 → 13, 24 → 19
- Spacing: e.g., 16 → 13, 24 → 19
- Border radius: e.g., 16 → 13, 24 → 19
- Touch targets: 44 → 35

This follows mobile app industry standards for more content density.

## 🎯 Theme Toggle Location

The dark/light mode toggle is in the **Profile Screen** under "Appearance" section, as requested.

## 💡 Tips

1. Always test in both light and dark modes
2. Use Colors object, never hardcode color values
3. For special cases, use conditional `isDark ? darkColor : lightColor`
4. StatusBar is set to 'light' for both modes (works well with purple header)
5. React Navigation theme automatically adapts to dark/light mode
