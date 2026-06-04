import type { DailyEntryKind } from '@/features/dailyNote/dailyNote.types';

interface LogChooserOption {
  readonly kind: DailyEntryKind;
  readonly label: string;
}

export const LOG_CHOOSER_LABELS = {
  title: 'What do you want to log?',
  cancel: 'Cancel',
} as const;

export const LOG_CHOOSER_OPTIONS: readonly LogChooserOption[] = [
  { kind: 'meal', label: 'Meal' },
  { kind: 'exercise', label: 'Exercise' },
];
