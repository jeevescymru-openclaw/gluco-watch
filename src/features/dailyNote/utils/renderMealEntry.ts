import { ENTRY_HEADING_PREFIX, TIME_DESCRIPTION_SEPARATOR } from '../constants';
import { renderNotesLine } from './renderNotesLine';

import type { MealEntry } from '../dailyNote.types';

// The H3 heading is a single line that Step 6 parses, so newlines and runs of
// whitespace from a multiline input are collapsed into single spaces.
const toSingleLine = (text: string): string => text.replace(/\s+/g, ' ').trim();

export const renderMealEntry = (meal: MealEntry): string => {
  const description = toSingleLine(meal.description);
  const heading = `${ENTRY_HEADING_PREFIX}${meal.time}${TIME_DESCRIPTION_SEPARATOR}${description}`;
  const notesLine = renderNotesLine(meal.notes, meal.loggedLate);
  return notesLine ? `${heading}\n${notesLine}` : heading;
};
