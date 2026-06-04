import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useVaultConfig } from '@/features/vault/hooks/useVaultConfig';
import { VaultPermissionError } from '@/features/vault/services/vaultService';
import { COLORS } from '@/theme/colors';

import { dailyNoteService } from '../../services/dailyNoteServiceInstance';
import { formatEntryTime, formatNoteDate } from '../../utils/dateFormat';
import { MEAL_FORM_LABELS } from '../MealForm/constants';
import { MealForm } from '../MealForm/MealForm';
import { styles } from './styles';

import type { ReactElement } from 'react';

export const MealLogScreen = (): ReactElement => {
  const router = useRouter();
  const { status, config } = useVaultConfig();
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const saveMeal = async (description: string): Promise<void> => {
    if (!config || description.length === 0) {
      return;
    }

    setIsSaving(true);
    setErrorMessage(null);

    try {
      const now = new Date();
      await dailyNoteService.logMeal(config.experimentFolderUri, formatNoteDate(now), {
        time: formatEntryTime(now),
        description,
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

  const handleSubmit = (description: string): void => {
    void saveMeal(description);
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
        isSaving={isSaving}
        onCancel={handleCancel}
        onSubmit={handleSubmit}
      />
    </SafeAreaView>
  );
};
