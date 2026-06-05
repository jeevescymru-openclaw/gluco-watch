import DateTimePicker from '@react-native-community/datetimepicker';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppButton } from '@/components/AppButton/AppButton';
import { SOURCE_IDS } from '@/features/glucose/constants';
import { useReminderTime } from '@/features/settings/hooks/useReminderTime';
import {
  ensureNotificationPermission,
  scheduleMorningReminder,
} from '@/features/notifications/services/notificationService';
import { useVaultConfig } from '@/features/vault/hooks/useVaultConfig';

import { GLUCOSE_IMPORT_ROUTE, SETTINGS_LABELS } from './constants';
import { styles } from './styles';

import type { ReminderTime } from '@/features/notifications/notification.types';
import type { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import type { ReactElement } from 'react';

const pad = (value: number): string => value.toString().padStart(2, '0');

const formatReminderTime = ({ hour, minute }: ReminderTime): string =>
  `${pad(hour)}:${pad(minute)}`;

const reminderAsDate = ({ hour, minute }: ReminderTime): Date => {
  const date = new Date();
  date.setHours(hour, minute, 0, 0);
  return date;
};

export const SettingsScreen = (): ReactElement => {
  const router = useRouter();
  const { config, clearConfig } = useVaultConfig();
  const { reminderTime, saveReminderTime } = useReminderTime();
  const [isPickerVisible, setIsPickerVisible] = useState(false);

  const applyReminderTime = async (time: ReminderTime): Promise<void> => {
    await saveReminderTime(time);
    if (await ensureNotificationPermission()) {
      await scheduleMorningReminder(time);
    }
  };

  const handleTimeChange = (event: DateTimePickerEvent, picked?: Date): void => {
    setIsPickerVisible(false);
    if (event.type === 'set' && picked) {
      void applyReminderTime({ hour: picked.getHours(), minute: picked.getMinutes() });
    }
  };

  const handleChangeFolder = async (): Promise<void> => {
    await clearConfig();
    router.back();
  };

  const handleImportCsv = (): void => {
    router.push({ pathname: GLUCOSE_IMPORT_ROUTE, params: { source: SOURCE_IDS.lingoCsv } });
  };

  const handleDone = (): void => {
    router.back();
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>{SETTINGS_LABELS.title}</Text>

        <View style={styles.section}>
          <Text style={styles.label}>{SETTINGS_LABELS.reminderLabel}</Text>
          <Text style={styles.hint}>{SETTINGS_LABELS.reminderHint}</Text>
          <Pressable
            accessibilityRole="button"
            onPress={() => setIsPickerVisible(true)}
            style={styles.value}
          >
            <Text style={styles.valueText}>{formatReminderTime(reminderTime)}</Text>
          </Pressable>
          {isPickerVisible ? (
            <DateTimePicker
              mode="time"
              onChange={handleTimeChange}
              value={reminderAsDate(reminderTime)}
            />
          ) : null}
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>{SETTINGS_LABELS.folderLabel}</Text>
          <Text numberOfLines={1} style={styles.folderPath}>
            {config?.experimentFolderPath ?? ''}
          </Text>
          <AppButton
            label={SETTINGS_LABELS.changeFolder}
            onPress={() => void handleChangeFolder()}
            tone="secondary"
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>{SETTINGS_LABELS.glucoseLabel}</Text>
          <Text style={styles.hint}>{SETTINGS_LABELS.glucoseHint}</Text>
          <AppButton label={SETTINGS_LABELS.importCsv} onPress={handleImportCsv} tone="secondary" />
        </View>

        <View style={styles.spacer} />
        <AppButton label={SETTINGS_LABELS.done} onPress={handleDone} />
      </View>
    </SafeAreaView>
  );
};
