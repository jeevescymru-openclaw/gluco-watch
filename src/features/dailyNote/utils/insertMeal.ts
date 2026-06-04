import { MEALS_HEADING } from '../constants';
import { insertSectionEntry } from './insertEntry';
import { renderMealEntry } from './renderMealEntry';

import type { MealEntry } from '../dailyNote.types';

/** Inserts a meal into the `## Meals` section in chronological order. */
export const insertMeal = (content: string, meal: MealEntry): string =>
  insertSectionEntry(content, MEALS_HEADING, meal.time, renderMealEntry(meal));
