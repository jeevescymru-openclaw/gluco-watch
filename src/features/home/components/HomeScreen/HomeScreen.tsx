import { useRouter } from 'expo-router';
import { ActivityIndicator, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppButton } from '@/components/AppButton/AppButton';
import { Fab } from '@/components/Fab/Fab';
import { MealList } from '@/features/dailyNote/components/MealList/MealList';
import { useDailyMeals } from '@/features/dailyNote/hooks/useDailyMeals';
import { useMorningEntries } from '@/features/dailyNote/hooks/useMorningEntries';
import { formatNoteDate } from '@/features/dailyNote/utils/dateFormat';
import { COLORS } from '@/theme/colors';

import { MorningSummary } from '../MorningSummary/MorningSummary';
import { HOME_LABELS, MEAL_ROUTE, MORNING_ROUTE } from './constants';
import { styles } from './styles';

import type { HomeScreenProps } from './HomeScreen.types';
import type { ReactElement } from 'react';

export const HomeScreen = ({ config, onReconfigure }: HomeScreenProps): ReactElement => {
  const router = useRouter();
  const noteDate = formatNoteDate(new Date());
  const { meals, isLoading, hasError } = useDailyMeals(config.experimentFolderUri, noteDate);
  const { today: morning } = useMorningEntries(config.experimentFolderUri, noteDate);

  const handleAddMeal = (): void => {
    router.push(MEAL_ROUTE);
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
            <MealList meals={meals} />
          )}
        </View>

        <View style={styles.footer}>
          <Text numberOfLines={1} style={styles.folderPath}>
            {`${HOME_LABELS.folderPrefix}${config.experimentFolderPath}`}
          </Text>
          <AppButton label={HOME_LABELS.changeFolder} onPress={onReconfigure} tone="secondary" />
        </View>
      </View>

      <Fab accessibilityLabel={HOME_LABELS.addMeal} onPress={handleAddMeal} />
    </SafeAreaView>
  );
};
