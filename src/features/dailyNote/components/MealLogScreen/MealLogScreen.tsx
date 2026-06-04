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
import { MEAL_FORM_LABELS } from '../MealForm/constants';
import { MealForm } from '../MealForm/MealForm';
import { styles } from './styles';

import type { MealFormValues } from '../MealForm/MealForm.types';
import type { ReactElement } from 'react';

export const MealLogScreen = (): ReactElement => {
  const router = useRouter();
  const { date } = useLocalSearchParams<{ date?: string }>();
  const { status, config } = useVaultConfig();
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const targetDate = date ?? formatNoteDate(new Date());

  const saveMeal = async (values: MealFormValues): Promise<void> => {
    if (!config) {
      return;
    }

    setIsSaving(true);
    setErrorMessage(null);

    try {
      await dailyNoteService.logMeal(config.experimentFolderUri, formatNoteDate(values.dateTime), {
        time: formatEntryTime(values.dateTime),
        description: values.description,
        loggedLate: values.loggedLate,
      });
      router.back();
    } catch (error) {
      setErrorMessage(
        error instanceof VaultPermissionError
          ? MEAL_FORM_LABELS.permissionError
          : MEAL_FORM_LABELS.genericError,
      );
      setIsSaving(false);
    }
  };

  const handleSubmit = (values: MealFormValues): void => {
    void saveMeal(values);
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
      <MealForm
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
