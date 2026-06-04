import { StyleSheet } from 'react-native';

import { COLORS } from '@/theme/colors';
import { SPACING } from '@/theme/tokens';

const FAB_SIZE = 56;

export const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    right: SPACING.lg,
    bottom: SPACING.lg,
    width: FAB_SIZE,
    height: FAB_SIZE,
    borderRadius: FAB_SIZE / 2,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  glyph: {
    color: COLORS.primaryText,
    fontSize: 32,
    lineHeight: 36,
    fontWeight: '600',
  },
});
