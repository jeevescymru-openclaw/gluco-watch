import { Pressable, Text } from 'react-native';

import { useStyles } from './useStyles';

import type { AppButtonProps } from './AppButton.types';
import type { ReactElement } from 'react';

export const AppButton = ({
  label,
  onPress,
  disabled = false,
  tone = 'primary',
}: AppButtonProps): ReactElement => {
  const styles = useStyles({ disabled, tone });

  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={styles.container}
    >
      <Text style={styles.label}>{label}</Text>
    </Pressable>
  );
};
