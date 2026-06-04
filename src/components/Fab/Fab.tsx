import { Pressable, Text } from 'react-native';

import { FAB_GLYPH } from './constants';
import { styles } from './styles';

import type { FabProps } from './Fab.types';
import type { ReactElement } from 'react';

export const Fab = ({ onPress, accessibilityLabel }: FabProps): ReactElement => (
  <Pressable
    accessibilityLabel={accessibilityLabel}
    accessibilityRole="button"
    onPress={onPress}
    style={styles.container}
  >
    <Text style={styles.glyph}>{FAB_GLYPH}</Text>
  </Pressable>
);
