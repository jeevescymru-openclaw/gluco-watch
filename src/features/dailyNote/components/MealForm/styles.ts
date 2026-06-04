import { StyleSheet } from 'react-native';

import { COLORS } from '@/theme/colors';
import { FONT_SIZE, RADIUS, SPACING } from '@/theme/tokens';

export const styles = StyleSheet.create({
  content: {
    flex: 1,
    padding: SPACING.lg,
    gap: SPACING.md,
  },
  title: {
    fontSize: FONT_SIZE.xl,
    fontWeight: '700',
    color: COLORS.text,
  },
  label: {
    fontSize: FONT_SIZE.md,
    color: COLORS.text,
  },
  input: {
    minHeight: 96,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    fontSize: FONT_SIZE.md,
    color: COLORS.text,
    textAlignVertical: 'top',
  },
  errorMessage: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.error,
  },
  spacer: {
    flex: 1,
  },
});
