import type { MorningEntry } from '@/features/dailyNote/dailyNote.types';

export interface MorningSummaryProps {
  readonly morning: MorningEntry | null;
  readonly onPress: () => void;
}
