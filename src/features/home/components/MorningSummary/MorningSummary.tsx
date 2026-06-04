import { Pressable, Text } from 'react-native';

import { formatRating } from '@/components/RatingSelector/formatRating';
import { WAIST_UNIT } from '@/features/dailyNote/constants';

import { MORNING_SUMMARY_LABELS, SUMMARY_SEPARATOR } from './constants';
import { useStyles } from './useStyles';

import type { MorningSummaryProps } from './MorningSummary.types';
import type { MorningEntry } from '@/features/dailyNote/dailyNote.types';
import type { ReactElement } from 'react';

const buildSummary = (morning: MorningEntry): string => {
  const parts = [
    `${MORNING_SUMMARY_LABELS.waist} ${morning.waistCm}${WAIST_UNIT}`,
    `${MORNING_SUMMARY_LABELS.bloat} ${formatRating(morning.bloat)}`,
  ];
  if (morning.sleep !== undefined) {
    parts.push(`${MORNING_SUMMARY_LABELS.sleep} ${formatRating(morning.sleep)}`);
  }
  return parts.join(SUMMARY_SEPARATOR);
};

export const MorningSummary = ({ morning, onPress }: MorningSummaryProps): ReactElement => {
  const styles = useStyles({ hasMorning: morning !== null });

  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={styles.card}>
      <Text style={styles.text}>
        {morning ? buildSummary(morning) : MORNING_SUMMARY_LABELS.addPrompt}
      </Text>
    </Pressable>
  );
};
