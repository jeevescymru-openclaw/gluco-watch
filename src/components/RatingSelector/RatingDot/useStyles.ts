import { StyleSheet } from 'react-native';

import { COLORS } from '@/theme/colors';
import { FONT_SIZE } from '@/theme/tokens';

import { DOT_SIZE } from '../constants';

import type { TextStyle, ViewStyle } from 'react-native';

interface UseStylesParams {
  readonly isSelected: boolean;
  readonly disabled: boolean;
}

interface RatingDotStyles {
  readonly container: ViewStyle;
  readonly label: TextStyle;
}

const resolveBorderColor = (isSelected: boolean, disabled: boolean): string => {
  if (disabled) {
    return COLORS.disabled;
  }
  return isSelected ? COLORS.primary : COLORS.border;
};

export const useStyles = ({ isSelected, disabled }: UseStylesParams): RatingDotStyles =>
  StyleSheet.create({
    container: {
      width: DOT_SIZE,
      height: DOT_SIZE,
      borderRadius: DOT_SIZE / 2,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: resolveBorderColor(isSelected, disabled),
      backgroundColor: isSelected ? COLORS.primary : COLORS.surface,
      opacity: disabled ? 0.5 : 1,
    },
    label: {
      fontSize: FONT_SIZE.md,
      fontWeight: '600',
      color: isSelected ? COLORS.primaryText : COLORS.text,
    },
  });
