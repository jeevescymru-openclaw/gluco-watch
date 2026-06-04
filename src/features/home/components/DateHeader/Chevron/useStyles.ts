import { StyleSheet } from 'react-native';

import { COLORS } from '@/theme/colors';
import { SPACING } from '@/theme/tokens';

import type { TextStyle, ViewStyle } from 'react-native';

interface UseStylesParams {
  readonly disabled: boolean;
}

interface ChevronStyles {
  readonly container: ViewStyle;
  readonly glyph: TextStyle;
}

const GLYPH_SIZE = 28;

export const useStyles = ({ disabled }: UseStylesParams): ChevronStyles =>
  StyleSheet.create({
    container: {
      paddingHorizontal: SPACING.sm,
      paddingVertical: SPACING.xs,
    },
    glyph: {
      fontSize: GLYPH_SIZE,
      lineHeight: GLYPH_SIZE,
      fontWeight: '700',
      color: disabled ? COLORS.disabled : COLORS.primary,
    },
  });
