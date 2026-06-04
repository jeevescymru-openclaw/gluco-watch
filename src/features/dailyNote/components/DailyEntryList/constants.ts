import type { DailyEntryKind } from '../../dailyNote.types';

export const DAILY_ENTRY_LIST_LABELS = {
  empty: 'Nothing logged yet today.',
} as const;

export const ENTRY_ICONS: Record<DailyEntryKind, string> = {
  meal: '🍽️',
  exercise: '🏋️',
};
