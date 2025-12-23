# UI Scaling Standards

## Overview
This document defines the standardized scaling system used across all screens in the Ekthaa React Native app. **All developers must follow these standards** to maintain consistency.

## Core Principles

1. **Use Constants, Not Magic Numbers** - Never hardcode sizes like `34`, `22`, etc.
2. **Import from Scales** - Always use values from `src/constants/scales.ts`
3. **Reuse Common Styles** - Use `src/styles/commonStyles.ts` for standard components
4. **Theme-Aware Colors** - Always use `Colors` from `getThemedColors(isDark)`

---

## Avatar Sizes

Import: `import { AvatarSizes } from '@/constants/scales';`

| Size | Value | Use Case |
|------|-------|----------|
| `small` | 28px | Compact lists, badges |
| `medium` | 34px | **PRIMARY** - Customer/Product lists, Dashboard recent items |
| `large` | 44px | Detail screens, prominent displays |
| `xlarge` | 64px | Profile headers, featured content |
| `xxlarge` | 80px | Full profile displays |

**Example:**
```typescript
avatar: {
  width: AvatarSizes.medium,
  height: AvatarSizes.medium,
  borderRadius: AvatarSizes.medium / 2,
}
```

---

## Icon Sizes

Import: `import { IconSizes } from '@/constants/scales';`

| Size | Value | Use Case |
|------|-------|----------|
| `tiny` | 16px | Inline icons, badges |
| `small` | 18px | **PRIMARY** - List items chevrons, secondary actions |
| `medium` | 22px | **PRIMARY** - Action cards, primary buttons |
| `large` | 28px | Headers, prominent actions |
| `xlarge` | 40px | Feature highlights |

**Example:**
```typescript
<Ionicons name="chevron-forward" size={IconSizes.small} color={Colors.textTertiary} />
```

---

## Typography Scales

Import: `import { TextScale } from '@/constants/scales';`

| Scale | Value | Use Case |
|-------|-------|----------|
| `listTitle` | `fontSm` | **PRIMARY** - Names in lists |
| `listSubtitle` | `fontXs` | **PRIMARY** - Balance, secondary info |
| `cardLabel` | `font3xs` | Action card labels |
| `sectionTitle` | `fontBase` | Section headers |
| `balance` | 40px | Large balance displays |
| `statValue` | `fontBase` | Stats, metrics |
| `statLabel` | `font3xs` | Stat labels |

**Example:**
```typescript
itemName: {
  fontSize: TextScale.listTitle,
  fontWeight: '600',
}
```

---

## Spacing Scales

Import: `import { SpacingScale } from '@/constants/scales';`

| Scale | Value | Use Case |
|-------|-------|----------|
| `sectionPadding` | `lg` | Horizontal padding for sections |
| `cardPadding` | `md` | Internal card padding |
| `listGap` | `xs` | **PRIMARY** - Gap between list items |
| `actionCardGap` | `xs` | Gap between action cards |
| `verticalSection` | `lg` | Vertical spacing between sections |

**Example:**
```typescript
section: {
  paddingHorizontal: SpacingScale.sectionPadding,
  paddingTop: SpacingScale.verticalSection,
}
```

---

## Common Styles Usage

Import: `import { listStyles, avatarStyles, sectionStyles } from '@/styles/commonStyles';`

### List Items (Primary Pattern)

```typescript
// Container
<View style={listStyles.container}>
  {items.map((item, i) => (
    <TouchableOpacity 
      key={item.id}
      style={[listStyles.item, { backgroundColor: Colors.card }]}
      onPress={handlePress}
    >
      {/* Avatar */}
      <View style={[avatarStyles.medium, { backgroundColor: color }]}>
        <Text style={avatarStyles.text}>{item.name[0]}</Text>
      </View>
      
      {/* Content */}
      <View style={listStyles.itemInfo}>
        <Text style={[listStyles.itemName, { color: Colors.textPrimary }]}>
          {item.name}
        </Text>
        <Text style={[listStyles.itemSubtitle, { color: Colors.creditGreen }]}>
          {formatBalance(item.balance)}
        </Text>
      </View>
      
      {/* Chevron */}
      <Ionicons name="chevron-forward" size={IconSizes.small} color={Colors.textTertiary} />
    </TouchableOpacity>
  ))}
</View>
```

### Action Cards (Dashboard Pattern)

```typescript
import { actionCardStyles } from '@/styles/commonStyles';

<View style={actionCardStyles.container}>
  <TouchableOpacity style={actionCardStyles.card} onPress={handlePress}>
    <View style={[
      actionCardStyles.icon, 
      { backgroundColor: isDark ? 'rgba(90, 154, 142, 0.15)' : '#E8F5F3' }
    ]}>
      <Ionicons name="people-outline" size={IconSizes.medium} color={Colors.primary} />
    </View>
    <Text style={[actionCardStyles.label, { color: Colors.textPrimary }]}>
      Customers
    </Text>
  </TouchableOpacity>
</View>
```

### Section Headers

```typescript
import { sectionStyles } from '@/styles/commonStyles';

<View style={sectionStyles.container}>
  <View style={sectionStyles.header}>
    <Text style={[sectionStyles.title, { color: Colors.textPrimary }]}>
      Recent Customers
    </Text>
    <TouchableOpacity onPress={handleViewAll}>
      <Text style={[sectionStyles.viewAll, { color: Colors.primary }]}>
        View All
      </Text>
    </TouchableOpacity>
  </View>
  {/* Content */}
</View>
```

---

## Migration Checklist

When creating or updating a screen:

- [ ] Import scales: `import { AvatarSizes, IconSizes, TextScale, SpacingScale } from '@/constants/scales';`
- [ ] Import common styles: `import { listStyles, avatarStyles } from '@/styles/commonStyles';`
- [ ] Replace hardcoded avatar sizes with `AvatarSizes.medium`
- [ ] Replace hardcoded icon sizes with `IconSizes.small` or `IconSizes.medium`
- [ ] Replace hardcoded text sizes with `TextScale.listTitle`, `TextScale.listSubtitle`
- [ ] Replace hardcoded padding with `SpacingScale` values
- [ ] Use `listStyles.item`, `listStyles.itemInfo` for list items
- [ ] Use `avatarStyles.medium` for avatars
- [ ] Use `actionCardStyles` for action cards
- [ ] Ensure all colors come from `Colors` (theme-aware)

---

## Screen Templates

### List Screen Template

```typescript
import React from 'react';
import { View, Text, TouchableOpacity, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getThemedColors } from '@/constants/theme';
import { useTheme } from '@/context/ThemeContext';
import { AvatarSizes, IconSizes, TextScale } from '@/constants/scales';
import { listStyles, avatarStyles } from '@/styles/commonStyles';

export default function ListScreen() {
  const { isDark } = useTheme();
  const Colors = getThemedColors(isDark);

  return (
    <FlatList
      data={items}
      contentContainerStyle={listStyles.container}
      renderItem={({ item, index }) => (
        <TouchableOpacity 
          style={[listStyles.item, { backgroundColor: Colors.card }]}
          onPress={() => handlePress(item)}
        >
          <View style={[avatarStyles.medium, { backgroundColor: getColor(index) }]}>
            <Text style={avatarStyles.text}>{item.name[0]}</Text>
          </View>
          <View style={listStyles.itemInfo}>
            <Text style={[listStyles.itemName, { color: Colors.textPrimary }]}>
              {item.name}
            </Text>
            <Text style={[listStyles.itemSubtitle, { color: Colors.textSecondary }]}>
              {item.subtitle}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={IconSizes.small} color={Colors.textTertiary} />
        </TouchableOpacity>
      )}
    />
  );
}
```

---

## Color Theme Standards

Always use theme-aware colors:

```typescript
const { isDark } = useTheme();
const Colors = getThemedColors(isDark);

// ✅ Correct
{ backgroundColor: Colors.card }
{ color: Colors.textPrimary }
{ backgroundColor: isDark ? 'rgba(90, 154, 142, 0.2)' : 'rgba(90, 154, 142, 0.1)' }

// ❌ Wrong
{ backgroundColor: '#ffffff' }
{ color: '#000000' }
```

---

## Enforcement

1. **Code Review**: All PRs must follow these standards
2. **No Magic Numbers**: Hardcoded sizes will be rejected
3. **Consistency**: New screens should match existing patterns exactly
4. **Documentation**: Update this file if new patterns are needed

---

## Questions?

If you need a size or pattern not covered here:
1. Check if existing scales can be composed
2. Discuss with team before adding new constants
3. Update this document with approved patterns
