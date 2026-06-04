import { MEALS_HEADING } from '../constants';
import { ENTRY_HEADING_PATTERN, H2_PATTERN } from './patterns';

import type { ParsedMeal } from '../dailyNote.types';

/** Reads the meals out of a daily note for display, in document (chronological) order. */
export const parseMeals = (content: string): ParsedMeal[] => {
  const lines = content.split('\n');
  const mealsIndex = lines.findIndex((line) => line.trim() === MEALS_HEADING);
  if (mealsIndex === -1) {
    return [];
  }

  const meals: ParsedMeal[] = [];
  for (let index = mealsIndex + 1; index < lines.length; index += 1) {
    const line = lines[index];
    if (H2_PATTERN.test(line)) {
      break;
    }
    const match = ENTRY_HEADING_PATTERN.exec(line);
    if (match) {
      meals.push({ time: match[1], description: match[2].trim() });
    }
  }
  return meals;
};
