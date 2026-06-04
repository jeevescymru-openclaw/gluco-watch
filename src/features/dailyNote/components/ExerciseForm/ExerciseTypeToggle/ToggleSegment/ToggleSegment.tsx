import { Pressable, Text } from 'react-native';

import { useStyles } from './useStyles';

import type { ToggleSegmentProps } from './ToggleSegment.types';
import type { ReactElement } from 'react';

export const ToggleSegment = ({
  value,
  label,
  isSelected,
  disabled,
  onPress,
}: ToggleSegmentProps): ReactElement => {
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
      <Text style={styles.label}>{label}</Text>
    </Pressable>
  );
};
