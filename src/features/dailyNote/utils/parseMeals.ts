import { MEALS_HEADING } from '../constants';
import { parseSectionEntries } from './parseEntries';

import type { ParsedMeal } from '../dailyNote.types';

/** Reads the meals out of a daily note for display, in document (chronological) order. */
export const parseMeals = (content: string): ParsedMeal[] =>
  parseSectionEntries(content, MEALS_HEADING);
