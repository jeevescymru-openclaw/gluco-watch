import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { ActivityIndicator, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppButton } from '@/components/AppButton/AppButton';
import { formatRelativeDay } from '@/features/dailyNote/utils/dateFormat';
import { useVaultConfig } from '@/features/vault/hooks/useVaultConfig';
import { COLORS } from '@/theme/colors';

import { useGlucoseImport } from '../../hooks/useGlucoseImport';
import { mealKey } from '../../utils/previewSelection';
import { confirmLabel, GLUCOSE_IMPORT_LABELS, rangeLabel } from './constants';
import { MealPreviewRow } from './MealPreviewRow/MealPreviewRow';
import { styles } from './styles';

import type { GlucosePreviewMeal } from '../../glucose.types';
import type { ReactElement } from 'react';

interface DateGroup {
  readonly date: string;
  readonly meals: readonly GlucosePreviewMeal[];
}

const groupByDate = (meals: readonly GlucosePreviewMeal[]): readonly DateGroup[] => {
  const order: string[] = [];
  const byDate = new Map<string, GlucosePreviewMeal[]>();
  for (const meal of meals) {
    if (!byDate.has(meal.noteDate)) {
      byDate.set(meal.noteDate, []);
      order.push(meal.noteDate);
    }
    byDate.get(meal.noteDate)?.push(meal);
  }
  return order.map((date) => ({ date, meals: byDate.get(date) ?? [] }));
};

export const GlucoseImportScreen = (): ReactElement => {
  const router = useRouter();
  const { config } = useVaultConfig();
  const experimentFolderUri = config?.experimentFolderUri ?? '';
  const { phase, plan, overrides, writeCount, errorMessage, toggleOverride, confirm } =
    useGlucoseImport(experimentFolderUri);

  // Leave once the picker was dismissed or the summaries are written.
  useEffect(() => {
    if (phase === 'cancelled' || phase === 'done') {
      router.back();
    }
  }, [phase, router]);

  if (phase === 'loading' || phase === 'applying' || phase === 'cancelled' || phase === 'done') {
    return (
      <SafeAreaView style={styles.centered}>
        <ActivityIndicator color={COLORS.primary} size="large" />
        <Text style={styles.centeredText}>
          {phase === 'applying' ? GLUCOSE_IMPORT_LABELS.applying : GLUCOSE_IMPORT_LABELS.loading}
        </Text>
      </SafeAreaView>
    );
  }

  if (phase === 'error') {
    return (
      <SafeAreaView style={styles.centered}>
        <Text style={styles.title}>{GLUCOSE_IMPORT_LABELS.errorTitle}</Text>
        <Text style={styles.centeredText}>{errorMessage}</Text>
        <AppButton
          label={GLUCOSE_IMPORT_LABELS.close}
          onPress={() => router.back()}
          tone="secondary"
        />
      </SafeAreaView>
    );
  }

  if (phase === 'empty' || !plan) {
    return (
      <SafeAreaView style={styles.centered}>
        <Text style={styles.title}>{GLUCOSE_IMPORT_LABELS.emptyTitle}</Text>
        <Text style={styles.centeredText}>{GLUCOSE_IMPORT_LABELS.emptyBody}</Text>
        <AppButton
          label={GLUCOSE_IMPORT_LABELS.close}
          onPress={() => router.back()}
          tone="secondary"
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>{GLUCOSE_IMPORT_LABELS.title}</Text>
        <Text style={styles.range}>{rangeLabel(plan.rangeFrom, plan.rangeTo)}</Text>

        {groupByDate(plan.meals).map((group) => (
          <View key={group.date} style={styles.group}>
            <Text style={styles.groupHeader}>{formatRelativeDay(group.date)}</Text>
            {group.meals.map((meal) => (
              <MealPreviewRow
                key={mealKey(meal)}
                isOverridden={overrides.has(mealKey(meal))}
                meal={meal}
                onToggleOverride={() => toggleOverride(mealKey(meal))}
              />
            ))}
          </View>
        ))}
      </ScrollView>

      <View style={styles.footer}>
        <AppButton disabled={writeCount === 0} label={confirmLabel(writeCount)} onPress={confirm} />
        <AppButton
          label={GLUCOSE_IMPORT_LABELS.cancel}
          onPress={() => router.back()}
          tone="secondary"
        />
      </View>
    </SafeAreaView>
  );
};
