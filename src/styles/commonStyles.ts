/**
 * Common Styles
 * Reusable style definitions for consistent UI across all screens
 * Import and use these instead of creating custom styles
 */

import { StyleSheet, Platform } from 'react-native';
import { Typography, Spacing, BorderRadius } from '../constants/theme';
import { AvatarSizes, IconSizes, ListItemScale, TextScale, SpacingScale, RadiusScale, ShadowScale } from '../constants/scales';

/**
 * Common Avatar Styles
 * Use these for all avatar displays
 */
export const avatarStyles = StyleSheet.create({
  small: {
    width: AvatarSizes.small,
    height: AvatarSizes.small,
    borderRadius: AvatarSizes.small / 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  medium: {
    width: AvatarSizes.medium,
    height: AvatarSizes.medium,
    borderRadius: AvatarSizes.medium / 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  large: {
    width: AvatarSizes.large,
    height: AvatarSizes.large,
    borderRadius: AvatarSizes.large / 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  xlarge: {
    width: AvatarSizes.xlarge,
    height: AvatarSizes.xlarge,
    borderRadius: AvatarSizes.xlarge / 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontSize: TextScale.listTitle,
    fontWeight: '700',
    color: '#ffffff',
  },
});

/**
 * Common List Item Styles
 * Use these for all list-based screens
 */
export const listStyles = StyleSheet.create({
  container: {
    gap: ListItemScale.gapCompact,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: ListItemScale.padding,
    borderRadius: RadiusScale.card,
    gap: ListItemScale.gap,
    ...(Platform.select(ShadowScale.card) as any),
  },
  itemCompact: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: ListItemScale.paddingCompact,
    borderRadius: RadiusScale.card,
    gap: ListItemScale.gapCompact,
  },
  itemInfo: {
    flex: 1,
    gap: 2,
  },
  itemName: {
    fontSize: TextScale.listTitle,
    fontWeight: '600',
  },
  itemSubtitle: {
    fontSize: TextScale.listSubtitle,
    fontWeight: '700',
  },
});

/**
 * Common Action Card Styles
 * Use these for dashboard-style action cards
 */
export const actionCardStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: SpacingScale.sectionPadding,
    paddingVertical: SpacingScale.verticalSection,
  },
  card: {
    alignItems: 'center',
    gap: Spacing.xs,
  },
  icon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    ...(Platform.select(ShadowScale.actionCard) as any),
  },
  label: {
    fontSize: TextScale.cardLabel,
    fontWeight: '600',
  },
});

/**
 * Common Section Styles
 * Use these for section headers and containers
 */
export const sectionStyles = StyleSheet.create({
  container: {
    paddingHorizontal: SpacingScale.sectionPadding,
    paddingTop: SpacingScale.verticalSection,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  title: {
    fontSize: TextScale.sectionTitle,
    fontWeight: '700',
  },
  viewAll: {
    fontSize: Typography.fontSm,
    fontWeight: '600',
  },
});

/**
 * Common Stats Card Styles
 * Use these for displaying metrics and statistics
 */
export const statsStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    borderWidth: 1,
    borderRadius: BorderRadius.lg,
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.md,
  },
  item: {
    flex: 1,
    alignItems: 'flex-start',
  },
  divider: {
    width: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    marginHorizontal: Spacing.md,
  },
  label: {
    fontSize: TextScale.statLabel,
    marginBottom: 4,
    fontWeight: '500',
  },
  value: {
    fontSize: TextScale.statValue,
    fontWeight: '700',
  },
});

/**
 * Common Search Bar Styles
 * Use these for search inputs
 */
export const searchBarStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.lg,
    gap: Spacing.sm,
  },
  input: {
    flex: 1,
    fontSize: Typography.fontSm,
    padding: 0,
  },
  icon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

/**
 * Common Header/AppBar Styles
 * Use these for navigation headers and app bars
 */
export const headerStyles = StyleSheet.create({
  appBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    height: 56,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: Typography.fontLg,
    fontWeight: '700',
  },
  titleContainer: {
    flex: 1,
    alignItems: 'center',
  },
  rightAction: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

/**
 * USAGE INSTRUCTIONS:
 * 
 * 1. Import the styles you need:
 *    import { listStyles, avatarStyles, sectionStyles } from '@/styles/commonStyles';
 * 
 * 2. Use them in your components:
 *    <View style={[listStyles.item, { backgroundColor: Colors.card }]}>
 *      <View style={[avatarStyles.medium, { backgroundColor: color }]}>
 *        <Text style={avatarStyles.text}>{initial}</Text>
 *      </View>
 *      <View style={listStyles.itemInfo}>
 *        <Text style={[listStyles.itemName, { color: Colors.textPrimary }]}>Name</Text>
 *        <Text style={[listStyles.itemSubtitle, { color: Colors.textSecondary }]}>Subtitle</Text>
 *      </View>
 *    </View>
 * 
 * 3. For theme-aware colors, always merge with Colors:
 *    style={[commonStyles.item, { backgroundColor: Colors.card, borderColor: Colors.border }]}
 * 
 * 4. Avoid creating custom sizes - use the provided scales
 */
