import type { ExerciseType } from '@/features/dailyNote/dailyNote.types';

export interface ToggleSegmentProps {
  readonly value: ExerciseType;
  readonly label: string;
  readonly isSelected: boolean;
  readonly disabled: boolean;
  readonly onPress: (value: ExerciseType) => void;
}
