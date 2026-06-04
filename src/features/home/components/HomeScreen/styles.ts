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
  list: {
    flex: 1,
  },
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorMessage: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.error,
  },
  footer: {
    gap: SPACING.sm,
  },
  folderPath: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textMuted,
  },
});
