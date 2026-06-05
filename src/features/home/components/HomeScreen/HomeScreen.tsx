import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppButton } from '@/components/AppButton/AppButton';
import { Fab } from '@/components/Fab/Fab';
import { DailyEntryList } from '@/features/dailyNote/components/DailyEntryList/DailyEntryList';
import { useDailyEntries } from '@/features/dailyNote/hooks/useDailyEntries';
import { useMorningEntries } from '@/features/dailyNote/hooks/useMorningEntries';
import { formatRelativeDay } from '@/features/dailyNote/utils/dateFormat';
import { useMorningReminder } from '@/features/notifications/hooks/useMorningReminder';
import { COLORS } from '@/theme/colors';

import { useSelectedDate } from '../../hooks/useSelectedDate';
import { DateHeader } from '../DateHeader/DateHeader';
import { LogChooser } from '../LogChooser/LogChooser';
import { MorningSummary } from '../MorningSummary/MorningSummary';
import {
  ENTRY_ROUTES,
  GLUCOSE_IMPORT_ROUTE,
  HOME_LABELS,
  MORNING_ROUTE,
  SETTINGS_ROUTE,
} from './constants';
import { styles } from './styles';

import type { HomeScreenProps } from './HomeScreen.types';
import type { DailyEntry, DailyEntryKind } from '@/features/dailyNote/dailyNote.types';
import type { ReactElement } from 'react';

export const HomeScreen = ({ config }: HomeScreenProps): ReactElement => {
  const router = useRouter();
  useMorningReminder();
  const { selectedDate, isToday, canGoForward, goToPreviousDay, goToNextDay, goToToday } =
    useSelectedDate();
  const { entries, isLoading, hasError } = useDailyEntries(
    config.experimentFolderUri,
    selectedDate,
  );
  const { today: morning } = useMorningEntries(config.experimentFolderUri, selectedDate);
  const [isChooserVisible, setIsChooserVisible] = useState(false);

  const handleOpenChooser = (): void => {
    setIsChooserVisible(true);
  };

  const handleCloseChooser = (): void => {
    setIsChooserVisible(false);
  };

  const handleSelectKind = (kind: DailyEntryKind): void => {
    setIsChooserVisible(false);
    router.push({ pathname: ENTRY_ROUTES[kind], params: { date: selectedDate } });
  };

  const handleOpenMorning = (): void => {
    router.push({ pathname: MORNING_ROUTE, params: { date: selectedDate } });
  };

  const handlePressEntry = (entry: DailyEntry): void => {
    router.push({
      pathname: ENTRY_ROUTES[entry.kind],
      params: { date: selectedDate, index: String(entry.index) },
    });
  };

  const handleOpenSettings = (): void => {
    router.push(SETTINGS_ROUTE);
  };

  const handleImportGlucose = (): void => {
    router.push(GLUCOSE_IMPORT_ROUTE);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <DateHeader
          canGoForward={canGoForward}
          isToday={isToday}
          label={formatRelativeDay(selectedDate)}
          onNextDay={goToNextDay}
          onPreviousDay={goToPreviousDay}
          onToday={goToToday}
        />

        {hasError ? <Text style={styles.errorMessage}>{HOME_LABELS.readError}</Text> : null}

        <MorningSummary morning={morning} onPress={handleOpenMorning} />

        <View style={styles.list}>
          {isLoading ? (
            <View style={styles.loading}>
              <ActivityIndicator color={COLORS.primary} size="large" />
            </View>
          ) : (
            <DailyEntryList entries={entries} onPressEntry={handlePressEntry} />
          )}
        </View>

        <View style={styles.footer}>
          <Text numberOfLines={1} style={styles.folderPath}>
            {`${HOME_LABELS.folderPrefix}${config.experimentFolderPath}`}
          </Text>
          <AppButton
            label={HOME_LABELS.importGlucose}
            onPress={handleImportGlucose}
            tone="secondary"
          />
          <AppButton label={HOME_LABELS.settings} onPress={handleOpenSettings} tone="secondary" />
        </View>
      </View>

      <Fab accessibilityLabel={HOME_LABELS.addEntry} onPress={handleOpenChooser} />
      <LogChooser
        onClose={handleCloseChooser}
        onSelect={handleSelectKind}
        visible={isChooserVisible}
      />
    </SafeAreaView>
  );
};
