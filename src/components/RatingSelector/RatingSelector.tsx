import { View } from 'react-native';

import { RATING_VALUES } from './constants';
import { RatingDot } from './RatingDot/RatingDot';
import { styles } from './styles';

import type { RatingSelectorProps } from './RatingSelector.types';
import type { ReactElement } from 'react';

export const RatingSelector = ({
  value,
  onChange,
  disabled = false,
  accessibilityLabel,
}: RatingSelectorProps): ReactElement => (
  <View accessibilityLabel={accessibilityLabel} style={styles.row}>
    {RATING_VALUES.map((rating) => (
      <RatingDot
        key={rating}
        disabled={disabled}
        isSelected={value === rating}
        onPress={onChange}
        value={rating}
      />
    ))}
  </View>
);
