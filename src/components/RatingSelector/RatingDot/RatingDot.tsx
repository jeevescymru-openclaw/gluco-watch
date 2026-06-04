import { Pressable, Text } from 'react-native';

import { useStyles } from './useStyles';

import type { RatingDotProps } from './RatingDot.types';
import type { ReactElement } from 'react';

export const RatingDot = ({
  value,
  isSelected,
  disabled,
  onPress,
}: RatingDotProps): ReactElement => {
  const styles = useStyles({ isSelected, disabled });

  const handlePress = (): void => {
    onPress(value);
  };

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled, selected: isSelected }}
      disabled={disabled}
      onPress={handlePress}
      style={styles.container}
    >
      <Text style={styles.label}>{value}</Text>
    </Pressable>
  );
};
