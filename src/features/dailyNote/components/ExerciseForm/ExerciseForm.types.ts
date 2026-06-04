import type { ExerciseType } from '../../dailyNote.types';

export interface ExerciseFormValues {
  readonly type: ExerciseType;
  readonly durationMin: number;
  readonly intensity: number;
  readonly notes?: string;
  readonly dateTime: Date;
  readonly loggedLate: boolean;
}

export interface ExerciseFormInitialValues {
  readonly type: ExerciseType;
  readonly duration: string;
  readonly intensity: number | null;
  readonly notes: string;
  readonly dateTime: Date;
  readonly loggedLate: boolean;
}

export interface ExerciseFormProps {
  readonly initialValues: ExerciseFormInitialValues;
  readonly isSaving: boolean;
  readonly errorMessage: string | null;
  readonly onSubmit: (exercise: ExerciseFormValues) => void;
  readonly onCancel: () => void;
  readonly onDelete?: () => void;
}
