import { StyleSheet } from 'react-native';

import { COLORS } from '@/theme/colors';
import { FONT_SIZE, SPACING } from '@/theme/tokens';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.background,
  },
  message: {
    flex: 1,
    justifyContent: 'center',
    gap: SPACING.lg,
    padding: SPACING.lg,
  },
  messageText: {
    fontSize: FONT_SIZE.md,
    color: COLORS.text,
    textAlign: 'center',
  },
});
