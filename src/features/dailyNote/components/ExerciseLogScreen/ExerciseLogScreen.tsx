import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useVaultConfig } from '@/features/vault/hooks/useVaultConfig';
import { VaultPermissionError } from '@/features/vault/services/vaultService';
import { COLORS } from '@/theme/colors';

import { dailyNoteService } from '../../services/dailyNoteServiceInstance';
import {
  formatEntryTime,
  formatNoteDate,
  initialEntryDateTime,
  isNoteDateToday,
} from '../../utils/dateFormat';
import { EXERCISE_FORM_LABELS } from '../ExerciseForm/constants';
import { ExerciseForm } from '../ExerciseForm/ExerciseForm';
import { styles } from './styles';

import type { ExerciseFormValues } from '../ExerciseForm/ExerciseForm.types';
import type { ReactElement } from 'react';

export const ExerciseLogScreen = (): ReactElement => {
  const router = useRouter();
  const { date } = useLocalSearchParams<{ date?: string }>();
  const { status, config } = useVaultConfig();
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const targetDate = date ?? formatNoteDate(new Date());

  const saveExercise = async (values: ExerciseFormValues): Promise<void> => {
    if (!config) {
      return;
    }

    setIsSaving(true);
    setErrorMessage(null);

    try {
      await dailyNoteService.logExercise(
        config.experimentFolderUri,
        formatNoteDate(values.dateTime),
        {
          time: formatEntryTime(values.dateTime),
          type: values.type,
          durationMin: values.durationMin,
          intensity: values.intensity,
          loggedLate: values.loggedLate,
          ...(values.notes ? { notes: values.notes } : {}),
        },
      );
      router.back();
    } catch (error) {
      setErrorMessage(
        error instanceof VaultPermissionError
          ? EXERCISE_FORM_LABELS.permissionError
          : EXERCISE_FORM_LABELS.genericError,
      );
      setIsSaving(false);
    }
  };

  const handleSubmit = (values: ExerciseFormValues): void => {
    void saveExercise(values);
  };

  const handleCancel = (): void => {
    router.back();
  };

  if (status === 'loading') {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color={COLORS.primary} size="large" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ExerciseForm
        errorMessage={errorMessage}
        initialDateTime={initialEntryDateTime(targetDate)}
        isSaving={isSaving}
        onCancel={handleCancel}
        onSubmit={handleSubmit}
        targetIsToday={isNoteDateToday(targetDate)}
      />
    </SafeAreaView>
  );
};
