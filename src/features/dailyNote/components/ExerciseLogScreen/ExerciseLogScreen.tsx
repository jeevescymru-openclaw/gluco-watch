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
import { DEFAULT_EXERCISE_TYPE, EXERCISE_FORM_LABELS } from '../ExerciseForm/constants';
import { ExerciseForm } from '../ExerciseForm/ExerciseForm';
import { styles } from './styles';

import type {
  ExerciseFormInitialValues,
  ExerciseFormValues,
} from '../ExerciseForm/ExerciseForm.types';
import type { ExerciseDetails } from '../../dailyNote.types';
import type { ReactElement } from 'react';

export const ExerciseLogScreen = (): ReactElement => {
  const router = useRouter();
  const { date, index } = useLocalSearchParams<{ date?: string; index?: string }>();
  const { status, config } = useVaultConfig();
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const targetDate = date ?? formatNoteDate(new Date());
  const editIndex = index !== undefined ? Number(index) : undefined;
  const isEdit = editIndex !== undefined && Number.isInteger(editIndex);
  const experimentFolderUri = config?.experimentFolderUri ?? '';

  const { details, isReady } = useEntryForEdit<ExerciseDetails>(
    experimentFolderUri,
    targetDate,
    isEdit ? editIndex : undefined,
    dailyNoteService.readExerciseDetails,
  );

  const fail = (error: unknown): void => {
    setErrorMessage(
      error instanceof VaultPermissionError
        ? EXERCISE_FORM_LABELS.permissionError
        : EXERCISE_FORM_LABELS.genericError,
    );
    setIsSaving(false);
  };

  const saveExercise = async (values: ExerciseFormValues): Promise<void> => {
    if (!config) {
      return;
    }
    setIsSaving(true);
    setErrorMessage(null);

    const newDate = formatNoteDate(values.dateTime);
    const exercise = {
      time: formatEntryTime(values.dateTime),
      type: values.type,
      durationMin: values.durationMin,
      intensity: values.intensity,
      loggedLate: values.loggedLate,
      ...(values.notes ? { notes: values.notes } : {}),
    };

    try {
      if (isEdit && editIndex !== undefined) {
        await dailyNoteService.updateExercise(
          config.experimentFolderUri,
          targetDate,
          editIndex,
          newDate,
          exercise,
        );
      } else {
        await dailyNoteService.logExercise(config.experimentFolderUri, newDate, exercise);
      }
      router.back();
    } catch (error) {
      fail(error);
    }
  };

  const deleteExercise = async (): Promise<void> => {
    if (!config || editIndex === undefined) {
      return;
    }
    setIsSaving(true);
    setErrorMessage(null);
    try {
      await dailyNoteService.deleteEntry(
        config.experimentFolderUri,
        targetDate,
        'exercise',
        editIndex,
      );
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
          <Text style={styles.messageText}>{EXERCISE_FORM_LABELS.notFound}</Text>
          <AppButton label={EXERCISE_FORM_LABELS.cancel} onPress={handleCancel} tone="secondary" />
        </View>
      </SafeAreaView>
    );
  }

  const initialValues: ExerciseFormInitialValues = details
    ? {
        type: details.type,
        duration: String(details.durationMin),
        intensity: details.intensity,
        notes: details.notes ?? '',
        dateTime: entryDateTime(targetDate, details.time),
        loggedLate: details.loggedLate,
      }
    : {
        type: DEFAULT_EXERCISE_TYPE,
        duration: '',
        intensity: null,
        notes: '',
        dateTime: initialEntryDateTime(targetDate),
        loggedLate: !isNoteDateToday(targetDate),
      };

  return (
    <SafeAreaView style={styles.container}>
      <ExerciseForm
        errorMessage={errorMessage}
        initialValues={initialValues}
        isSaving={isSaving}
        onCancel={handleCancel}
        onDelete={isEdit ? () => void deleteExercise() : undefined}
        onSubmit={(values) => void saveExercise(values)}
      />
    </SafeAreaView>
  );
};
