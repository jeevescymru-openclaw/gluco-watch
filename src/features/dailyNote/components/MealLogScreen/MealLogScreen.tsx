import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppButton } from '@/components/AppButton/AppButton';
import { useVaultConfig } from '@/features/vault/hooks/useVaultConfig';
import { VaultPermissionError } from '@/features/vault/services/vaultService';
import { COLORS } from '@/theme/colors';

import { useEntryForEdit } from '../../hooks/useEntryForEdit';
import { dailyNoteService } from '../../services/dailyNoteServiceInstance';
import {
  entryDateTime,
  formatEntryTime,
  formatNoteDate,
  initialEntryDateTime,
  isNoteDateToday,
} from '../../utils/dateFormat';
import { MEAL_FORM_LABELS } from '../MealForm/constants';
import { MealForm } from '../MealForm/MealForm';
import { styles } from './styles';

import type { MealFormValues } from '../MealForm/MealForm.types';
import type { MealDetails } from '../../dailyNote.types';
import type { ReactElement } from 'react';

export const MealLogScreen = (): ReactElement => {
  const router = useRouter();
  const { date, index } = useLocalSearchParams<{ date?: string; index?: string }>();
  const { status, config } = useVaultConfig();
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const targetDate = date ?? formatNoteDate(new Date());
  const editIndex = index !== undefined ? Number(index) : undefined;
  const isEdit = editIndex !== undefined && Number.isInteger(editIndex);
  const experimentFolderUri = config?.experimentFolderUri ?? '';

  const { details, isReady } = useEntryForEdit<MealDetails>(
    experimentFolderUri,
    targetDate,
    isEdit ? editIndex : undefined,
    dailyNoteService.readMealDetails,
  );

  const fail = (error: unknown): void => {
    setErrorMessage(
      error instanceof VaultPermissionError
        ? MEAL_FORM_LABELS.permissionError
        : MEAL_FORM_LABELS.genericError,
    );
    setIsSaving(false);
  };

  const saveMeal = async (values: MealFormValues): Promise<void> => {
    if (!config) {
      return;
    }
    setIsSaving(true);
    setErrorMessage(null);

    const newDate = formatNoteDate(values.dateTime);
    const meal = {
      time: formatEntryTime(values.dateTime),
      description: values.description,
      loggedLate: values.loggedLate,
    };

    try {
      if (isEdit && editIndex !== undefined) {
        await dailyNoteService.updateMeal(
          config.experimentFolderUri,
          targetDate,
          editIndex,
          newDate,
          meal,
        );
      } else {
        await dailyNoteService.logMeal(config.experimentFolderUri, newDate, meal);
      }
      router.back();
    } catch (error) {
      fail(error);
    }
  };

  const deleteMeal = async (): Promise<void> => {
    if (!config || editIndex === undefined) {
      return;
    }
    setIsSaving(true);
    setErrorMessage(null);
    try {
      await dailyNoteService.deleteEntry(config.experimentFolderUri, targetDate, 'meal', editIndex);
      router.back();
    } catch (error) {
      fail(error);
    }
  };

  const handleCancel = (): void => {
    router.back();
  };

  if (status === 'loading' || !isReady) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color={COLORS.primary} size="large" />
      </View>
    );
  }

  if (isEdit && !details) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.message}>
          <Text style={styles.messageText}>{MEAL_FORM_LABELS.notFound}</Text>
          <AppButton label={MEAL_FORM_LABELS.cancel} onPress={handleCancel} tone="secondary" />
        </View>
      </SafeAreaView>
    );
  }

  const initialValues: MealFormValues = details
    ? {
        description: details.description,
        dateTime: entryDateTime(targetDate, details.time),
        loggedLate: details.loggedLate,
      }
    : {
        description: '',
        dateTime: initialEntryDateTime(targetDate),
        loggedLate: !isNoteDateToday(targetDate),
      };

  return (
    <SafeAreaView style={styles.container}>
      <MealForm
        errorMessage={errorMessage}
        initialValues={initialValues}
        isSaving={isSaving}
        onCancel={handleCancel}
        onDelete={isEdit ? () => void deleteMeal() : undefined}
        onSubmit={(values) => void saveMeal(values)}
      />
    </SafeAreaView>
  );
};
