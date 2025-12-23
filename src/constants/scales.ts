/**
 * UI Scale Constants
 * Consistent sizing and spacing across all screens
 * Use these values to maintain uniform design language
 */

import { Typography, Spacing, BorderRadius } from './theme';

/**
 * AVATAR SIZES
 * Standardized avatar dimensions for consistency
 */
export const AvatarSizes = {
  small: 28,      // For compact lists, badges
  medium: 34,     // Primary size for lists (Customers, Dashboard)
  large: 44,      // For detail screens, prominent displays
  xlarge: 64,     // For profile headers, featured content
  xxlarge: 80,    // For full profile displays
};

/**
 * ICON SIZES
 * Standardized icon dimensions
 */
export const IconSizes = {
  tiny: 16,       // For inline icons, badges
  small: 18,      // For list items, secondary actions
  medium: 22,     // Primary action cards, buttons
  large: 28,      // Headers, prominent actions
  xlarge: 40,     // Feature highlights
};

/**
 * CARD SIZES
 * For action cards, buttons, interactive elements
 */
export const CardSizes = {
  icon: 56,       // Circular action icons (Dashboard cards)
  iconRadius: 28, // Half of icon size for perfect circle
  small: 48,
  medium: 60,
  large: 72,
};

/**
 * LIST ITEM SCALES
 * Standardized padding and spacing for list items
 */
export const ListItemScale = {
  padding: Spacing.sm,           // Standard item padding
  paddingCompact: Spacing.xs,    // For dense lists
  gap: Spacing.sm,               // Gap between avatar and content
  gapCompact: Spacing.xs,        // For compact layouts
  avatarSize: AvatarSizes.medium,
  chevronSize: IconSizes.small,
};

/**
 * TEXT SCALES
 * Typography sizing for different contexts
 */
export const TextScale = {
  listTitle: Typography.fontSm,      // Primary text in lists
  listSubtitle: Typography.fontXs,   // Secondary text in lists
  cardLabel: Typography.font3xs,     // Labels for action cards
  sectionTitle: Typography.fontBase, // Section headers
  balance: 40,                       // Large balance displays
  statValue: Typography.fontBase,    // Stats, metrics
  statLabel: Typography.font3xs,     // Stat labels
};

/**
 * SPACING SCALES
 * Consistent spacing patterns
 */
export const SpacingScale = {
  sectionPadding: Spacing.lg,        // Padding around sections
  cardPadding: Spacing.md,           // Internal card padding
  listGap: Spacing.xs,               // Gap between list items
  actionCardGap: Spacing.xs,         // Gap between action cards
  verticalSection: Spacing.lg,       // Vertical spacing between sections
};

/**
 * BORDER RADIUS SCALES
 * Consistent rounding across components
 */
export const RadiusScale = {
  card: BorderRadius.md,
  actionCard: BorderRadius.lg,
  avatar: (size: number) => size / 2, // Perfect circle
  button: BorderRadius.lg,
  input: BorderRadius.md,
};

/**
 * SHADOW SCALES
 * Platform-specific elevation/shadows
 */
export const ShadowScale = {
  card: {
    ios: { 
      shadowColor: '#000', 
      shadowOffset: { width: 0, height: 1 }, 
      shadowOpacity: 0.05, 
      shadowRadius: 8 
    },
    android: { elevation: 2 },
  },
  actionCard: {
    ios: { 
      shadowColor: '#000', 
      shadowOffset: { width: 0, height: 2 }, 
      shadowOpacity: 0.06, 
      shadowRadius: 8 
    },
    android: { elevation: 3 },
  },
  prominent: {
    ios: { 
      shadowColor: '#000', 
      shadowOffset: { width: 0, height: 4 }, 
      shadowOpacity: 0.1, 
      shadowRadius: 12 
    },
    android: { elevation: 4 },
  },
};

/**
 * USAGE EXAMPLES:
 * 
 * import { AvatarSizes, ListItemScale, TextScale, SpacingScale } from '@/constants/scales';
 * 
 * // Avatar
 * avatar: {
 *   width: AvatarSizes.medium,
 *   height: AvatarSizes.medium,
 *   borderRadius: AvatarSizes.medium / 2,
 * }
 * 
 * // List Item
 * listItem: {
 *   padding: ListItemScale.padding,
 *   gap: ListItemScale.gap,
 * }
 * 
 * // Text
 * itemName: {
 *   fontSize: TextScale.listTitle,
 *   fontWeight: '600',
 * }
 */
