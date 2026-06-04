import { useState } from 'react';
import { Text, TextInput, View } from 'react-native';

import { AppButton } from '@/components/AppButton/AppButton';

import { MEAL_FORM_LABELS } from './constants';
import { styles } from './styles';

import type { MealFormProps } from './MealForm.types';
import type { ReactElement } from 'react';

export const MealForm = ({
  isSaving,
  errorMessage,
  onSubmit,
  onCancel,
}: MealFormProps): ReactElement => {
  const [description, setDescription] = useState('');

  const trimmedDescription = description.trim();
  const canSave = trimmedDescription.length > 0 && !isSaving;

  const handleSubmit = (): void => {
    onSubmit(trimmedDescription);
  };

  return (
    <View style={styles.content}>
      <Text style={styles.title}>{MEAL_FORM_LABELS.title}</Text>

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
