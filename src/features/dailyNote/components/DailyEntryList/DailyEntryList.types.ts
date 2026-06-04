import type { DailyEntry } from '../../dailyNote.types';

export interface DailyEntryListProps {
  readonly entries: readonly DailyEntry[];
  readonly onPressEntry: (entry: DailyEntry) => void;
}
