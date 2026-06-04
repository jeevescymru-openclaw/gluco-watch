import type { ExerciseEntry } from '../../dailyNote.types';

export type ExerciseFormValues = Omit<ExerciseEntry, 'time'>;

export interface ExerciseFormProps {
  readonly isSaving: boolean;
  readonly errorMessage: string | null;
  readonly onSubmit: (exercise: ExerciseFormValues) => void;
  readonly onCancel: () => void;
}
