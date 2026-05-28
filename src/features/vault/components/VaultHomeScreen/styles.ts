import { StyleSheet } from 'react-native';

import { COLORS } from '@/theme/colors';
import { FONT_SIZE, SPACING } from '@/theme/tokens';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
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
  ready: {
    fontSize: FONT_SIZE.md,
    color: COLORS.textMuted,
  },
  successMessage: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.success,
  },
  errorMessage: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.error,
  },
  spacer: {
    flex: 1,
  },
  footer: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textMuted,
  },
});
