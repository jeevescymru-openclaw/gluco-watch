import { StyleSheet } from 'react-native';

import { COLORS } from '@/theme/colors';
import { FONT_SIZE, RADIUS, SPACING } from '@/theme/tokens';

const INPUT_BASE = {
  borderWidth: StyleSheet.hairlineWidth,
  borderColor: COLORS.border,
  borderRadius: RADIUS.md,
  padding: SPACING.md,
  fontSize: FONT_SIZE.md,
  color: COLORS.text,
} as const;

export const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: SPACING.lg,
    gap: SPACING.lg,
  },
  title: {
    fontSize: FONT_SIZE.xl,
    fontWeight: '700',
    color: COLORS.text,
  },
  yesterday: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textMuted,
  },
  field: {
    gap: SPACING.sm,
  },
  label: {
    fontSize: FONT_SIZE.md,
    color: COLORS.text,
  },
  input: INPUT_BASE,
  notesInput: {
    ...INPUT_BASE,
    minHeight: 96,
    textAlignVertical: 'top',
  },
  footer: {
    padding: SPACING.lg,
    gap: SPACING.sm,
  },
  errorMessage: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.error,
  },
});
