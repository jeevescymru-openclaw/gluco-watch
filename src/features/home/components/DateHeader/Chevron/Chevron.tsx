import { Pressable, Text } from 'react-native';

import { useStyles } from './useStyles';

import type { ChevronProps } from './Chevron.types';
import type { ReactElement } from 'react';

export const Chevron = ({
  glyph,
  accessibilityLabel,
  disabled,
  onPress,
}: ChevronProps): ReactElement => {
  const styles = useStyles({ disabled });

  return (
    <Pressable
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={styles.container}
    >
      <Text style={styles.glyph}>{glyph}</Text>
    </Pressable>
  );
};
