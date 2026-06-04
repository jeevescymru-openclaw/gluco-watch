import { EXERCISE_TYPE_LABELS } from '@/features/dailyNote/constants';

import type { ExerciseType } from '@/features/dailyNote/dailyNote.types';

interface ExerciseTypeOption {
  readonly value: ExerciseType;
  readonly label: string;
}

export const EXERCISE_TYPE_OPTIONS: readonly ExerciseTypeOption[] = [
  { value: 'strength', label: EXERCISE_TYPE_LABELS.strength },
  { value: 'cardio', label: EXERCISE_TYPE_LABELS.cardio },
];
