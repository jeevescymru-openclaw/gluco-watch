import {
  ENTRY_HEADING_PREFIX,
  EXERCISE_DURATION_UNIT,
  EXERCISE_INTENSITY_LABEL,
  EXERCISE_TYPE_LABELS,
  NOTES_PREFIX,
  TIME_DESCRIPTION_SEPARATOR,
} from '../constants';

import type { ExerciseEntry } from '../dailyNote.types';

const describeExercise = (exercise: ExerciseEntry): string =>
  `${EXERCISE_TYPE_LABELS[exercise.type]}, ${exercise.durationMin} ${EXERCISE_DURATION_UNIT}, ${EXERCISE_INTENSITY_LABEL} ${exercise.intensity}`;

export const renderExerciseEntry = (exercise: ExerciseEntry): string => {
  const heading = `${ENTRY_HEADING_PREFIX}${exercise.time}${TIME_DESCRIPTION_SEPARATOR}${describeExercise(exercise)}`;
  const trimmedNotes = exercise.notes?.trim();
  return trimmedNotes ? `${heading}\n${NOTES_PREFIX}${trimmedNotes}` : heading;
};
