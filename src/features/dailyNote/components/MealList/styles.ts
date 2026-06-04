import { StyleSheet } from 'react-native';

import { COLORS } from '@/theme/colors';
import { FONT_SIZE, SPACING } from '@/theme/tokens';

export const styles = StyleSheet.create({
  content: {
    gap: SPACING.md,
    paddingBottom: SPACING.xl,
  },
  row: {
    flexDirection: 'row',
    gap: SPACING.md,
    alignItems: 'baseline',
  },
  time: {
    fontSize: FONT_SIZE.md,
    fontWeight: '700',
    color: COLORS.primary,
  },
  description: {
    flex: 1,
    fontSize: FONT_SIZE.md,
    color: COLORS.text,
  },
  empty: {
    fontSize: FONT_SIZE.md,
    color: COLORS.textMuted,
  },
});
