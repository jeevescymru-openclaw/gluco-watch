import { Pressable, Text, View } from 'react-native';

import { Chevron } from './Chevron/Chevron';
import { DATE_HEADER_GLYPHS, DATE_HEADER_LABELS } from './constants';
import { styles } from './styles';

import type { DateHeaderProps } from './DateHeader.types';
import type { ReactElement } from 'react';

export const DateHeader = ({
  label,
  canGoForward,
  isToday,
  onPreviousDay,
  onNextDay,
  onToday,
}: DateHeaderProps): ReactElement => (
  <View style={styles.row}>
    <Chevron
      accessibilityLabel={DATE_HEADER_LABELS.previousDay}
      disabled={false}
      glyph={DATE_HEADER_GLYPHS.previous}
      onPress={onPreviousDay}
    />
    <Text style={styles.label}>{label}</Text>
    {isToday ? null : (
      <Pressable accessibilityRole="button" onPress={onToday} style={styles.todayButton}>
        <Text style={styles.todayLabel}>{DATE_HEADER_LABELS.today}</Text>
      </Pressable>
    )}
    <Chevron
      accessibilityLabel={DATE_HEADER_LABELS.nextDay}
      disabled={!canGoForward}
      glyph={DATE_HEADER_GLYPHS.next}
      onPress={onNextDay}
    />
  </View>
);
