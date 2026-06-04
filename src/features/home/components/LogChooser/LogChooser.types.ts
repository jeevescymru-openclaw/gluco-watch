import type { DailyEntryKind } from '@/features/dailyNote/dailyNote.types';

export interface LogChooserProps {
  readonly visible: boolean;
  readonly onSelect: (kind: DailyEntryKind) => void;
  readonly onClose: () => void;
}
