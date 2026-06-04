import { useState } from 'react';
import { ScrollView, Text, TextInput, View } from 'react-native';

import { AppButton } from '@/components/AppButton/AppButton';
import { RatingSelector } from '@/components/RatingSelector/RatingSelector';

import { DateTimePill } from '../DateTimePill/DateTimePill';
import { DEFAULT_EXERCISE_TYPE, EXERCISE_FORM_LABELS } from './constants';
import { ExerciseTypeToggle } from './ExerciseTypeToggle/ExerciseTypeToggle';
import { styles } from './styles';

import type { ExerciseFormProps } from './ExerciseForm.types';
import type { ExerciseType } from '../../dailyNote.types';
import type { ReactElement } from 'react';

export const ExerciseForm = ({
  initialDateTime,
  targetIsToday,
  isSaving,
  errorMessage,
  onSubmit,
  onCancel,
}: ExerciseFormProps): ReactElement => {
  const [type, setType] = useState<ExerciseType>(DEFAULT_EXERCISE_TYPE);
  const [duration, setDuration] = useState('');
  const [intensity, setIntensity] = useState<number | null>(null);
  const [notes, setNotes] = useState('');
  const [dateTime, setDateTime] = useState(initialDateTime);
  const [isAdjusted, setIsAdjusted] = useState(false);

  const durationMin = Number(duration.trim());
  const isDurationValid =
    duration.trim().length > 0 && Number.isFinite(durationMin) && durationMin > 0;
  const canSave = isDurationValid && intensity !== null && !isSaving;

  const handleDateTimeChange = (next: Date): void => {
    setDateTime(next);
    setIsAdjusted(true);
  };

  const handleSubmit = (): void => {
    if (!canSave || intensity === null) {
      return;
    }
    const trimmedNotes = notes.trim();
    onSubmit({
      type,
      durationMin,
      intensity,
      dateTime,
      loggedLate: isAdjusted || !targetIsToday,
      ...(trimmedNotes ? { notes: trimmedNotes } : {}),
    });
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>{EXERCISE_FORM_LABELS.title}</Text>

        <DateTimePill
          disabled={isSaving}
          maximumDate={new Date()}
          onChange={handleDateTimeChange}
          value={dateTime}
        />

        <View style={styles.field}>
          <Text style={styles.label}>{EXERCISE_FORM_LABELS.typeLabel}</Text>
          <ExerciseTypeToggle disabled={isSaving} onChange={setType} value={type} />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>{EXERCISE_FORM_LABELS.durationLabel}</Text>
          <TextInput
            autoFocus
            editable={!isSaving}
            keyboardType="number-pad"
            onChangeText={setDuration}
            placeholder={EXERCISE_FORM_LABELS.durationPlaceholder}
            style={styles.input}
            value={duration}
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>{EXERCISE_FORM_LABELS.intensityLabel}</Text>
          <RatingSelector
            accessibilityLabel={EXERCISE_FORM_LABELS.intensityLabel}
            disabled={isSaving}
            onChange={setIntensity}
            value={intensity}
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>{EXERCISE_FORM_LABELS.notesLabel}</Text>
          <TextInput
            editable={!isSaving}
            multiline
            onChangeText={setNotes}
            placeholder={EXERCISE_FORM_LABELS.notesPlaceholder}
            style={styles.notesInput}
            value={notes}
          />
        </View>
      </ScrollView>

      <View style={styles.footer}>
        {errorMessage ? <Text style={styles.errorMessage}>{errorMessage}</Text> : null}
        <AppButton
          disabled={!canSave}
          label={isSaving ? EXERCISE_FORM_LABELS.saving : EXERCISE_FORM_LABELS.save}
          onPress={handleSubmit}
        />
        <AppButton
          disabled={isSaving}
          label={EXERCISE_FORM_LABELS.cancel}
          onPress={onCancel}
          tone="secondary"
        />
      </View>
    </View>
  );
};
