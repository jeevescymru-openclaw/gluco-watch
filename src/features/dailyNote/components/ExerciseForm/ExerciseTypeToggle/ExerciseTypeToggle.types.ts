import type { ExerciseType } from '@/features/dailyNote/dailyNote.types';

export interface ExerciseTypeToggleProps {
  readonly value: ExerciseType;
  readonly onChange: (value: ExerciseType) => void;
  readonly disabled?: boolean;
}
