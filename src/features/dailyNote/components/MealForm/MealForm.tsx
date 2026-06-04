import { useState } from 'react';
import { Alert, Text, TextInput, View } from 'react-native';

import { AppButton } from '@/components/AppButton/AppButton';

import { DateTimePill } from '../DateTimePill/DateTimePill';
import { MEAL_FORM_LABELS } from './constants';
import { styles } from './styles';

import type { MealFormProps } from './MealForm.types';
import type { ReactElement } from 'react';

export const MealForm = ({
  initialValues,
  isSaving,
  errorMessage,
  onSubmit,
  onCancel,
  onDelete,
}: MealFormProps): ReactElement => {
  const [description, setDescription] = useState(initialValues.description);
  const [dateTime, setDateTime] = useState(initialValues.dateTime);
  const [isAdjusted, setIsAdjusted] = useState(false);

  const isEditing = onDelete !== undefined;
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
      loggedLate: initialValues.loggedLate || isAdjusted,
    });
  };

  const handleDelete = (): void => {
    if (!onDelete) {
      return;
    }
    Alert.alert(MEAL_FORM_LABELS.deleteTitle, MEAL_FORM_LABELS.deleteMessage, [
      { text: MEAL_FORM_LABELS.deleteCancel, style: 'cancel' },
      { text: MEAL_FORM_LABELS.deleteConfirm, style: 'destructive', onPress: onDelete },
    ]);
  };

  return (
    <View style={styles.content}>
      <Text style={styles.title}>
        {isEditing ? MEAL_FORM_LABELS.editTitle : MEAL_FORM_LABELS.title}
      </Text>

      <DateTimePill
        disabled={isSaving}
        maximumDate={new Date()}
        onChange={handleDateTimeChange}
        value={dateTime}
      />

      <Text style={styles.label}>{MEAL_FORM_LABELS.descriptionLabel}</Text>
      <TextInput
        autoFocus={!isEditing}
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
      {onDelete ? (
        <AppButton
          disabled={isSaving}
          label={MEAL_FORM_LABELS.delete}
          onPress={handleDelete}
          tone="danger"
        />
      ) : null}
      <AppButton
        disabled={isSaving}
        label={MEAL_FORM_LABELS.cancel}
        onPress={onCancel}
        tone="secondary"
      />
    </View>
  );
};
