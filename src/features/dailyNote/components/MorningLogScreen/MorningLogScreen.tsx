import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useVaultConfig } from '@/features/vault/hooks/useVaultConfig';
import { VaultPermissionError } from '@/features/vault/services/vaultService';
import { COLORS } from '@/theme/colors';

import { useMorningEntries } from '../../hooks/useMorningEntries';
import { dailyNoteService } from '../../services/dailyNoteServiceInstance';
import { formatNoteDate, parseNoteDate, shiftNoteDate } from '../../utils/dateFormat';
import { MORNING_FORM_LABELS } from '../MorningForm/constants';
import { MorningForm } from '../MorningForm/MorningForm';
import { styles } from './styles';

import type { MorningEntry } from '../../dailyNote.types';
import type { ReactElement } from 'react';

const PREVIOUS_DAY_OFFSET = -1;

export const MorningLogScreen = (): ReactElement => {
  const router = useRouter();
  const { date } = useLocalSearchParams<{ date?: string }>();
  const { status, config } = useVaultConfig();
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const noteDate = date ?? formatNoteDate(new Date());
  const previousDate = shiftNoteDate(parseNoteDate(noteDate), PREVIOUS_DAY_OFFSET);
  const experimentFolderUri = config?.experimentFolderUri ?? '';
  const entries = useMorningEntries(experimentFolderUri, noteDate, previousDate);

  const saveMorning = async (morning: MorningEntry): Promise<void> => {
    if (!config) {
      return;
    }

    setIsSaving(true);
    setErrorMessage(null);

    try {
      await dailyNoteService.saveMorning(config.experimentFolderUri, noteDate, morning);
      router.back();
    } catch (error) {
      setErrorMessage(
        error instanceof VaultPermissionError
          ? MORNING_FORM_LABELS.permissionError
          : MORNING_FORM_LABELS.genericError,
      );
      setIsSaving(false);
    }
  };

  const handleSubmit = (morning: MorningEntry): void => {
    void saveMorning(morning);
  };

  const handleCancel = (): void => {
    router.back();
  };

  if (status === 'loading' || entries.isLoading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color={COLORS.primary} size="large" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <MorningForm
        errorMessage={errorMessage}
        initial={entries.today}
        isSaving={isSaving}
        onCancel={handleCancel}
        onSubmit={handleSubmit}
        yesterday={entries.yesterday}
      />
    </SafeAreaView>
  );
};
