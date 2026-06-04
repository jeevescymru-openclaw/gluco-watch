import { useState } from 'react';
import { Alert, ScrollView, Text, TextInput, View } from 'react-native';

import { AppButton } from '@/components/AppButton/AppButton';
import { RatingSelector } from '@/components/RatingSelector/RatingSelector';

import { DateTimePill } from '../DateTimePill/DateTimePill';
import { EXERCISE_FORM_LABELS } from './constants';
import { ExerciseTypeToggle } from './ExerciseTypeToggle/ExerciseTypeToggle';
import { styles } from './styles';

import type { ExerciseFormProps } from './ExerciseForm.types';
import type { ReactElement } from 'react';

export const ExerciseForm = ({
  initialValues,
  isSaving,
  errorMessage,
  onSubmit,
  onCancel,
  onDelete,
}: ExerciseFormProps): ReactElement => {
  const [type, setType] = useState(initialValues.type);
  const [duration, setDuration] = useState(initialValues.duration);
  const [intensity, setIntensity] = useState<number | null>(initialValues.intensity);
  const [notes, setNotes] = useState(initialValues.notes);
  const [dateTime, setDateTime] = useState(initialValues.dateTime);
  const [isAdjusted, setIsAdjusted] = useState(false);

  const isEditing = onDelete !== undefined;
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
      loggedLate: initialValues.loggedLate || isAdjusted,
      ...(trimmedNotes ? { notes: trimmedNotes } : {}),
    });
  };

  const handleDelete = (): void => {
    if (!onDelete) {
      return;
    }
    Alert.alert(EXERCISE_FORM_LABELS.deleteTitle, EXERCISE_FORM_LABELS.deleteMessage, [
      { text: EXERCISE_FORM_LABELS.deleteCancel, style: 'cancel' },
      { text: EXERCISE_FORM_LABELS.deleteConfirm, style: 'destructive', onPress: onDelete },
    ]);
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>
          {isEditing ? EXERCISE_FORM_LABELS.editTitle : EXERCISE_FORM_LABELS.title}
        </Text>

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
            autoFocus={!isEditing}
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
        {onDelete ? (
          <AppButton
            disabled={isSaving}
            label={EXERCISE_FORM_LABELS.delete}
            onPress={handleDelete}
            tone="danger"
          />
        ) : null}
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
