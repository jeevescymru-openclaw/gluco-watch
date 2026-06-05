import { Switch, Text, View } from 'react-native';

import { COLORS } from '@/theme/colors';

import { CLASSIFICATION_LABELS, GLUCOSE_IMPORT_LABELS } from '../constants';
import { summaryLine } from './constants';
import { useStyles } from './useStyles';

import type { MealPreviewRowProps } from './MealPreviewRow.types';
import type { ReactElement } from 'react';

export const MealPreviewRow = ({
  meal,
  isOverridden,
  onToggleOverride,
}: MealPreviewRowProps): ReactElement => {
  const styles = useStyles({ classification: meal.classification });
  const isProtected = meal.classification === 'protected';

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.time}>{meal.mealTime}</Text>
        <View style={styles.badge}>
          <Text style={styles.badgeLabel}>{CLASSIFICATION_LABELS[meal.classification]}</Text>
        </View>
      </View>
      <Text style={styles.description}>{meal.description}</Text>
      <Text style={styles.summary}>{summaryLine(meal.summary)}</Text>

      {isProtected ? (
        <>
          <Text style={styles.protectedHint}>{GLUCOSE_IMPORT_LABELS.protectedHint}</Text>
          <View style={styles.toggleRow}>
            <Text style={styles.toggleLabel}>{GLUCOSE_IMPORT_LABELS.resummarise}</Text>
            <Switch
              onValueChange={onToggleOverride}
              thumbColor={COLORS.background}
              trackColor={{ false: COLORS.border, true: COLORS.primary }}
              value={isOverridden}
            />
          </View>
        </>
      ) : null}
    </View>
  );
};
