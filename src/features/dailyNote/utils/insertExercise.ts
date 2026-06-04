import { EXERCISE_HEADING } from '../constants';
import { insertSectionEntry } from './insertEntry';
import { renderExerciseEntry } from './renderExerciseEntry';

import type { ExerciseEntry } from '../dailyNote.types';

/** Inserts an exercise session into the `## Exercise` section in chronological order. */
export const insertExercise = (content: string, exercise: ExerciseEntry): string =>
  insertSectionEntry(content, EXERCISE_HEADING, exercise.time, renderExerciseEntry(exercise));
