import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect } from 'react';
import { ActivityIndicator, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppButton } from '@/components/AppButton/AppButton';
import { formatRelativeDay } from '@/features/dailyNote/utils/dateFormat';
import { useVaultConfig } from '@/features/vault/hooks/useVaultConfig';
import { COLORS } from '@/theme/colors';

import { SOURCE_IDS } from '../../constants';
import { useGlucoseImport } from '../../hooks/useGlucoseImport';
import {
  openHealthConnectInstall,
  openHealthConnectSettings,
} from '../../services/healthConnectClient';
import { mealKey } from '../../utils/previewSelection';
import { confirmLabel, GLUCOSE_IMPORT_LABELS, rangeLabel, SOURCE_TITLES } from './constants';
import { MealPreviewRow } from './MealPreviewRow/MealPreviewRow';
import { styles } from './styles';

import type { GlucosePreviewMeal, GlucoseSourceId } from '../../glucose.types';
import type { ReactElement } from 'react';

interface DateGroup {
  readonly date: string;
  readonly meals: readonly GlucosePreviewMeal[];
}

interface BlockedState {
  readonly title: string;
  readonly body: string;
  readonly actionLabel: string;
  readonly onAction: () => void;
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

const resolveSource = (raw: string | undefined): GlucoseSourceId =>
  raw === SOURCE_IDS.lingoCsv ? SOURCE_IDS.lingoCsv : SOURCE_IDS.healthConnect;

export const GlucoseImportScreen = (): ReactElement => {
  const router = useRouter();
  const { source } = useLocalSearchParams<{ source?: string }>();
  const { config } = useVaultConfig();
  const experimentFolderUri = config?.experimentFolderUri ?? '';
  const sourceId = resolveSource(source);
  const { phase, plan, overrides, writeCount, errorMessage, toggleOverride, confirm } =
    useGlucoseImport(experimentFolderUri, sourceId);

  // Leave once the picker was dismissed or the summaries are written.
  useEffect(() => {
    if (phase === 'cancelled' || phase === 'done') {
      router.back();
    }
  }, [phase, router]);

  const goBack = (): void => router.back();

  const blockedState = (): BlockedState | null => {
    if (phase === 'unavailable') {
      return {
        title: GLUCOSE_IMPORT_LABELS.unavailableTitle,
        body: GLUCOSE_IMPORT_LABELS.unavailableBody,
        actionLabel: GLUCOSE_IMPORT_LABELS.installAction,
        onAction: openHealthConnectInstall,
      };
    }
    if (phase === 'update-required') {
      return {
        title: GLUCOSE_IMPORT_LABELS.updateTitle,
        body: GLUCOSE_IMPORT_LABELS.updateBody,
        actionLabel: GLUCOSE_IMPORT_LABELS.installAction,
        onAction: openHealthConnectInstall,
      };
    }
    if (phase === 'permission-denied') {
      return {
        title: GLUCOSE_IMPORT_LABELS.permissionTitle,
        body: GLUCOSE_IMPORT_LABELS.permissionBody,
        actionLabel: GLUCOSE_IMPORT_LABELS.settingsAction,
        onAction: openHealthConnectSettings,
      };
    }
    return null;
  };

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

  const blocked = blockedState();
  if (blocked) {
    return (
      <SafeAreaView style={styles.centered}>
        <Text style={styles.title}>{blocked.title}</Text>
        <Text style={styles.centeredText}>{blocked.body}</Text>
        <AppButton label={blocked.actionLabel} onPress={blocked.onAction} />
        <AppButton label={GLUCOSE_IMPORT_LABELS.close} onPress={goBack} tone="secondary" />
      </SafeAreaView>
    );
  }

  if (phase === 'error') {
    return (
      <SafeAreaView style={styles.centered}>
        <Text style={styles.title}>{GLUCOSE_IMPORT_LABELS.errorTitle}</Text>
        <Text style={styles.centeredText}>{errorMessage}</Text>
        <AppButton label={GLUCOSE_IMPORT_LABELS.close} onPress={goBack} tone="secondary" />
      </SafeAreaView>
    );
  }

  if (phase === 'empty' || !plan) {
    return (
      <SafeAreaView style={styles.centered}>
        <Text style={styles.title}>{GLUCOSE_IMPORT_LABELS.emptyTitle}</Text>
        <Text style={styles.centeredText}>{GLUCOSE_IMPORT_LABELS.emptyBody}</Text>
        <AppButton label={GLUCOSE_IMPORT_LABELS.close} onPress={goBack} tone="secondary" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>{SOURCE_TITLES[plan.sourceId]}</Text>
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
        <AppButton label={GLUCOSE_IMPORT_LABELS.cancel} onPress={goBack} tone="secondary" />
      </View>
    </SafeAreaView>
  );
};
