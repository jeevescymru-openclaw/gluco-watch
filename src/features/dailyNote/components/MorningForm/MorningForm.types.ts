import type { MorningEntry } from '../../dailyNote.types';

export interface MorningFormProps {
  readonly initial: MorningEntry | null;
  readonly yesterday: MorningEntry | null;
  readonly isSaving: boolean;
  readonly errorMessage: string | null;
  readonly onSubmit: (morning: MorningEntry) => void;
  readonly onCancel: () => void;
}
