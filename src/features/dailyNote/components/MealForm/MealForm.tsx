import { useState } from 'react';
import { Text, TextInput, View } from 'react-native';

import { AppButton } from '@/components/AppButton/AppButton';

import { DateTimePill } from '../DateTimePill/DateTimePill';
import { MEAL_FORM_LABELS } from './constants';
import { styles } from './styles';

import type { MealFormProps } from './MealForm.types';
import type { ReactElement } from 'react';

export const MealForm = ({
  initialDateTime,
  targetIsToday,
  isSaving,
  errorMessage,
  onSubmit,
  onCancel,
}: MealFormProps): ReactElement => {
  const [description, setDescription] = useState('');
  const [dateTime, setDateTime] = useState(initialDateTime);
  const [isAdjusted, setIsAdjusted] = useState(false);

  const trimmedDescription = description.trim();
  const canSave = trimmedDescription.length > 0 && !isSaving;

  const handleDateTimeChange = (next: Date): void => {
    setDateTime(next);
    setIsAdjusted(true);
  };

  const handleSubmit = (): void => {
    onSubmit({
      description: trimmedDescription,
      dateTime,
      loggedLate: isAdjusted || !targetIsToday,
    });
  };

  return (
    <View style={styles.content}>
      <Text style={styles.title}>{MEAL_FORM_LABELS.title}</Text>

      <DateTimePill
        disabled={isSaving}
        maximumDate={new Date()}
        onChange={handleDateTimeChange}
        value={dateTime}
      />

      <Text style={styles.label}>{MEAL_FORM_LABELS.descriptionLabel}</Text>
      <TextInput
        autoFocus
        editable={!isSaving}
        multiline
        onChangeText={setDescription}
        placeholder={MEAL_FORM_LABELS.descriptionPlaceholder}
        style={styles.input}
        value={description}
      />

      {errorMessage ? <Text style={styles.errorMessage}>{errorMessage}</Text> : null}

      <View style={styles.spacer} />
      <AppButton
        disabled={!canSave}
        label={isSaving ? MEAL_FORM_LABELS.saving : MEAL_FORM_LABELS.save}
        onPress={handleSubmit}
      />
      <AppButton
        disabled={isSaving}
        label={MEAL_FORM_LABELS.cancel}
        onPress={onCancel}
        tone="secondary"
      />
    </View>
  );
};
