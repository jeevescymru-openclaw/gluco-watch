import { StyleSheet } from 'react-native';

import { COLORS } from '@/theme/colors';
import { FONT_SIZE, RADIUS, SPACING } from '@/theme/tokens';

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
  intro: {
    fontSize: FONT_SIZE.md,
    color: COLORS.textMuted,
    lineHeight: FONT_SIZE.md * 1.4,
  },
  vaultName: {
    fontSize: FONT_SIZE.md,
    color: COLORS.text,
  },
  inputLabel: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textMuted,
    marginTop: SPACING.sm,
  },
  input: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.md,
    fontSize: FONT_SIZE.md,
    color: COLORS.text,
  },
  error: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.error,
  },
  spacer: {
    flex: 1,
  },
});
