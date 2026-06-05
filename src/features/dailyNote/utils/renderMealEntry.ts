import {
  EMBED_CLOSE,
  EMBED_OPEN,
  ENTRY_HEADING_PREFIX,
  TIME_DESCRIPTION_SEPARATOR,
} from '../constants';
import { renderNotesLine } from './renderNotesLine';

import type { MealEntry } from '../dailyNote.types';

// The H3 heading is a single line that Step 6 parses, so newlines and runs of
// whitespace from a multiline input are collapsed into single spaces.
const toSingleLine = (text: string): string => text.replace(/\s+/g, ' ').trim();

export const renderMealEntry = (meal: MealEntry): string => {
  const description = toSingleLine(meal.description);
  const heading = `${ENTRY_HEADING_PREFIX}${meal.time}${TIME_DESCRIPTION_SEPARATOR}${description}`;
  const notesLine = renderNotesLine(meal.notes, meal.loggedLate);

  const lines = [heading];
  if (meal.photoPath) {
    lines.push(`${EMBED_OPEN}${meal.photoPath}${EMBED_CLOSE}`);
  }
  if (notesLine) {
    // Separate the notes from a photo embed with a blank line, per the plan §3 example.
    if (meal.photoPath) {
      lines.push('');
    }
    lines.push(notesLine);
  }
  return lines.join('\n');
};
