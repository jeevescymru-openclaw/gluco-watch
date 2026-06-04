import { StyleSheet } from 'react-native';

import { COLORS } from '@/theme/colors';
import { FONT_SIZE, RADIUS, SPACING } from '@/theme/tokens';

import type { TextStyle, ViewStyle } from 'react-native';

interface UseStylesParams {
  readonly isSelected: boolean;
  readonly disabled: boolean;
}

interface ToggleSegmentStyles {
  readonly container: ViewStyle;
  readonly label: TextStyle;
}

export const useStyles = ({ isSelected, disabled }: UseStylesParams): ToggleSegmentStyles =>
  StyleSheet.create({
    container: {
      flex: 1,
      paddingVertical: SPACING.md,
      borderRadius: RADIUS.md,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: isSelected ? COLORS.primary : COLORS.border,
      backgroundColor: isSelected ? COLORS.primary : COLORS.surface,
      opacity: disabled ? 0.5 : 1,
    },
    label: {
      fontSize: FONT_SIZE.md,
      fontWeight: '600',
      color: isSelected ? COLORS.primaryText : COLORS.text,
    },
  });
