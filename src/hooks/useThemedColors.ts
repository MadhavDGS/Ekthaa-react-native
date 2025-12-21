/**
 * Hook to get themed colors
 */

import { useTheme } from '../context/ThemeContext';
import { getThemedColors } from '../constants/theme';

export const useThemedColors = () => {
  const { isDark } = useTheme();
  return getThemedColors(isDark);
};
