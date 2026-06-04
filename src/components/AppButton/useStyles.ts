import { StyleSheet } from 'react-native';

import { COLORS } from '@/theme/colors';
import { FONT_SIZE, RADIUS, SPACING } from '@/theme/tokens';

import type { AppButtonTone } from './AppButton.types';
import type { TextStyle, ViewStyle } from 'react-native';

interface UseStylesParams {
  readonly disabled: boolean;
  readonly tone: AppButtonTone;
}

interface AppButtonStyles {
  readonly container: ViewStyle;
  readonly label: TextStyle;
}

const resolveBackgroundColor = (tone: AppButtonTone, disabled: boolean): string => {
  if (disabled) {
    return COLORS.disabled;
  }
  if (tone === 'danger') {
    return COLORS.error;
  }
  return tone === 'secondary' ? COLORS.surface : COLORS.primary;
};

export const useStyles = ({ disabled, tone }: UseStylesParams): AppButtonStyles => {
  const isSecondary = tone === 'secondary';

  return StyleSheet.create({
    container: {
      backgroundColor: resolveBackgroundColor(tone, disabled),
      paddingVertical: SPACING.md,
      paddingHorizontal: SPACING.lg,
      borderRadius: RADIUS.md,
      alignItems: 'center',
      borderWidth: isSecondary ? StyleSheet.hairlineWidth : 0,
      borderColor: COLORS.border,
    },
    label: {
      color: isSecondary ? COLORS.text : COLORS.primaryText,
      fontSize: FONT_SIZE.md,
      fontWeight: '600',
    },
  });
};
