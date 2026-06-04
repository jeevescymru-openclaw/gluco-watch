import DateTimePicker from '@react-native-community/datetimepicker';
import { useState } from 'react';
import { Pressable, Text } from 'react-native';

import { formatPillDateTime } from '../../utils/dateFormat';
import { PILL_GLYPH } from './constants';
import { styles } from './styles';

import type { DateTimePillProps } from './DateTimePill.types';
import type { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import type { ReactElement } from 'react';

type PickerMode = 'date' | 'time' | null;

const mergeDate = (base: Date, picked: Date): Date => {
  const merged = new Date(base);
  merged.setFullYear(picked.getFullYear(), picked.getMonth(), picked.getDate());
  return merged;
};

const mergeTime = (base: Date, picked: Date): Date => {
  const merged = new Date(base);
  merged.setHours(picked.getHours(), picked.getMinutes(), 0, 0);
  return merged;
};

export const DateTimePill = ({
  value,
  onChange,
  maximumDate,
  disabled = false,
}: DateTimePillProps): ReactElement => {
  const [mode, setMode] = useState<PickerMode>(null);
  const [draft, setDraft] = useState(value);

  const handleOpen = (): void => {
    setMode('date');
  };

  // Android shows date and time as two sequential dialogs: pick the day, then the time.
  const handleDateChange = (event: DateTimePickerEvent, picked?: Date): void => {
    if (event.type === 'dismissed' || !picked) {
      setMode(null);
      return;
    }
    setDraft(mergeDate(value, picked));
    setMode('time');
  };

  const handleTimeChange = (event: DateTimePickerEvent, picked?: Date): void => {
    setMode(null);
    if (event.type === 'dismissed' || !picked) {
      return;
    }
    onChange(mergeTime(draft, picked));
  };

  return (
    <>
      <Pressable
        accessibilityRole="button"
        disabled={disabled}
        onPress={handleOpen}
        style={styles.pill}
      >
        <Text style={styles.label}>{formatPillDateTime(value)}</Text>
        <Text style={styles.glyph}>{PILL_GLYPH}</Text>
      </Pressable>

      {mode === 'date' ? (
        <DateTimePicker
          maximumDate={maximumDate}
          mode="date"
          onChange={handleDateChange}
          value={value}
        />
      ) : null}
      {mode === 'time' ? (
        <DateTimePicker mode="time" onChange={handleTimeChange} value={draft} />
      ) : null}
    </>
  );
};
