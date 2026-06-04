import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppButton } from '@/components/AppButton/AppButton';
import { Fab } from '@/components/Fab/Fab';
import { DailyEntryList } from '@/features/dailyNote/components/DailyEntryList/DailyEntryList';
import { useDailyEntries } from '@/features/dailyNote/hooks/useDailyEntries';
import { useMorningEntries } from '@/features/dailyNote/hooks/useMorningEntries';
import { formatNoteDate } from '@/features/dailyNote/utils/dateFormat';
import { COLORS } from '@/theme/colors';

import { LogChooser } from '../LogChooser/LogChooser';
import { MorningSummary } from '../MorningSummary/MorningSummary';
import { ENTRY_ROUTES, HOME_LABELS, MORNING_ROUTE } from './constants';
import { styles } from './styles';

import type { HomeScreenProps } from './HomeScreen.types';
import type { DailyEntryKind } from '@/features/dailyNote/dailyNote.types';
import type { ReactElement } from 'react';

export const HomeScreen = ({ config, onReconfigure }: HomeScreenProps): ReactElement => {
  const router = useRouter();
  const noteDate = formatNoteDate(new Date());
  const { entries, isLoading, hasError } = useDailyEntries(config.experimentFolderUri, noteDate);
  const { today: morning } = useMorningEntries(config.experimentFolderUri, noteDate);
  const [isChooserVisible, setIsChooserVisible] = useState(false);

  const handleOpenChooser = (): void => {
    setIsChooserVisible(true);
  };

  const handleCloseChooser = (): void => {
    setIsChooserVisible(false);
  };

  const handleSelectKind = (kind: DailyEntryKind): void => {
    setIsChooserVisible(false);
    router.push(ENTRY_ROUTES[kind]);
  };

  const handleOpenMorning = (): void => {
    router.push(MORNING_ROUTE);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.date}>{noteDate}</Text>

        {hasError ? <Text style={styles.errorMessage}>{HOME_LABELS.readError}</Text> : null}

        <MorningSummary morning={morning} onPress={handleOpenMorning} />

        <View style={styles.list}>
          {isLoading ? (
            <View style={styles.loading}>
              <ActivityIndicator color={COLORS.primary} size="large" />
            </View>
          ) : (
            <DailyEntryList entries={entries} />
          )}
        </View>

        <View style={styles.footer}>
          <Text numberOfLines={1} style={styles.folderPath}>
            {`${HOME_LABELS.folderPrefix}${config.experimentFolderPath}`}
          </Text>
          <AppButton label={HOME_LABELS.changeFolder} onPress={onReconfigure} tone="secondary" />
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
