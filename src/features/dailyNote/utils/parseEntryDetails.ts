import {
  EXERCISE_DURATION_UNIT,
  EXERCISE_HEADING,
  EXERCISE_INTENSITY_LABEL,
  EXERCISE_TYPE_LABELS,
  LOGGED_LATE_MARKER,
  MEALS_HEADING,
  NOTES_PREFIX,
} from '../constants';
import { ENTRY_HEADING_PATTERN } from './patterns';
import { sectionBlockTexts } from './sections';

import type { ExerciseDetails, ExerciseType, MealDetails } from '../dailyNote.types';

const EXERCISE_DESCRIPTION_PATTERN = new RegExp(
  `^(${EXERCISE_TYPE_LABELS.strength}|${EXERCISE_TYPE_LABELS.cardio}), (\\d+) ${EXERCISE_DURATION_UNIT}, ${EXERCISE_INTENSITY_LABEL} (\\d+)$`,
);

const TYPE_BY_LABEL: Record<string, ExerciseType> = {
  [EXERCISE_TYPE_LABELS.strength]: 'strength',
  [EXERCISE_TYPE_LABELS.cardio]: 'cardio',
};

// The marker is recomputed from the chosen time on save, so it is split off the user's
// own notes here, while its presence is reported separately to seed the form.
const stripMarker = (notes: string): string =>
  notes.endsWith(LOGGED_LATE_MARKER) ? notes.slice(0, -LOGGED_LATE_MARKER.length).trim() : notes;

const parseBlock = (blockText: string): MealDetails | null => {
  const lines = blockText.split('\n');
  const heading = ENTRY_HEADING_PATTERN.exec(lines[0]);
  if (!heading) {
    return null;
  }
  const notesLine = lines.find((line) => line.startsWith(NOTES_PREFIX));
  const rawNotes = notesLine ? notesLine.slice(NOTES_PREFIX.length).trim() : '';
  const notes = stripMarker(rawNotes);
  return {
    time: heading[1],
    description: heading[2].trim(),
    loggedLate: rawNotes.endsWith(LOGGED_LATE_MARKER),
    ...(notes ? { notes } : {}),
  };
};

const blockAt = (content: string, heading: string, index: number): MealDetails | null => {
  const block = sectionBlockTexts(content, heading)[index];
  return block ? parseBlock(block) : null;
};

export const parseMealDetails = (content: string, index: number): MealDetails | null =>
  blockAt(content, MEALS_HEADING, index);

export const parseExerciseDetails = (content: string, index: number): ExerciseDetails | null => {
  const block = blockAt(content, EXERCISE_HEADING, index);
  if (!block) {
    return null;
  }
  const match = EXERCISE_DESCRIPTION_PATTERN.exec(block.description);
  if (!match) {
    return null;
  }
  return {
    time: block.time,
    type: TYPE_BY_LABEL[match[1]],
    durationMin: Number(match[2]),
    intensity: Number(match[3]),
    loggedLate: block.loggedLate,
    ...(block.notes ? { notes: block.notes } : {}),
  };
};
