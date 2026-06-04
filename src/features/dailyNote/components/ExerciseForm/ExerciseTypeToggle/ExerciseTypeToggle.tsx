import { View } from 'react-native';

import { EXERCISE_TYPE_OPTIONS } from './constants';
import { styles } from './styles';
import { ToggleSegment } from './ToggleSegment/ToggleSegment';

import type { ExerciseTypeToggleProps } from './ExerciseTypeToggle.types';
import type { ReactElement } from 'react';

export const ExerciseTypeToggle = ({
  value,
  onChange,
  disabled = false,
}: ExerciseTypeToggleProps): ReactElement => (
  <View style={styles.row}>
    {EXERCISE_TYPE_OPTIONS.map((option) => (
      <ToggleSegment
        key={option.value}
        disabled={disabled}
        isSelected={value === option.value}
        label={option.label}
        onPress={onChange}
        value={option.value}
      />
    ))}
  </View>
);
