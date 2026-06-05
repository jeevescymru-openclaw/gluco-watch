import { StyleSheet } from 'react-native';

import { COLORS } from '@/theme/colors';
import { FONT_SIZE, RADIUS, SPACING } from '@/theme/tokens';

import { BADGE_COLORS } from './constants';

import type { MealClassification } from '../../../glucose.types';
import type { TextStyle, ViewStyle } from 'react-native';

interface UseStylesParams {
  readonly classification: MealClassification;
}

interface MealPreviewRowStyles {
  readonly container: ViewStyle;
  readonly headerRow: ViewStyle;
  readonly time: TextStyle;
  readonly badge: ViewStyle;
  readonly badgeLabel: TextStyle;
  readonly description: TextStyle;
  readonly summary: TextStyle;
  readonly protectedHint: TextStyle;
  readonly toggleRow: ViewStyle;
  readonly toggleLabel: TextStyle;
}

export const useStyles = ({ classification }: UseStylesParams): MealPreviewRowStyles =>
  StyleSheet.create({
    container: {
      paddingVertical: SPACING.sm,
      gap: SPACING.xs,
    },
    headerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: SPACING.sm,
    },
    time: {
      fontSize: FONT_SIZE.md,
      fontWeight: '700',
      color: COLORS.text,
    },
    badge: {
      backgroundColor: BADGE_COLORS[classification],
      borderRadius: RADIUS.md,
      paddingHorizontal: SPACING.sm,
      paddingVertical: SPACING.xs / 2,
    },
    badgeLabel: {
      color: COLORS.primaryText,
      fontSize: FONT_SIZE.sm,
      fontWeight: '600',
    },
    description: {
      fontSize: FONT_SIZE.md,
      color: COLORS.text,
    },
    summary: {
      fontSize: FONT_SIZE.sm,
      color: COLORS.textMuted,
    },
    protectedHint: {
      fontSize: FONT_SIZE.sm,
      color: COLORS.textMuted,
    },
    toggleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    toggleLabel: {
      fontSize: FONT_SIZE.md,
      color: COLORS.text,
    },
  });
