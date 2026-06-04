import { StyleSheet } from 'react-native';

import { COLORS } from '@/theme/colors';
import { FONT_SIZE, RADIUS, SPACING } from '@/theme/tokens';

import type { TextStyle, ViewStyle } from 'react-native';

interface UseStylesParams {
  readonly hasMorning: boolean;
}

interface MorningSummaryStyles {
  readonly card: ViewStyle;
  readonly text: TextStyle;
}

export const useStyles = ({ hasMorning }: UseStylesParams): MorningSummaryStyles =>
  StyleSheet.create({
    card: {
      padding: SPACING.md,
      borderRadius: RADIUS.md,
      backgroundColor: COLORS.surface,
    },
    text: {
      fontSize: FONT_SIZE.md,
      fontWeight: hasMorning ? '400' : '600',
      color: hasMorning ? COLORS.text : COLORS.primary,
    },
  });
