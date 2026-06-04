import { MEALS_HEADING } from '../constants';
import { insertSorted, splitEntryBlocks } from './mealBlocks';
import { H2_PATTERN } from './patterns';
import { renderMealEntry } from './renderMealEntry';
import { timeToMinutes } from './time';

import type { EntryBlock } from './mealBlocks';
import type { MealEntry } from '../dailyNote.types';

const withTrailingNewline = (content: string): string => `${content.replace(/\s+$/, '')}\n`;

const appendMealsSection = (content: string, entryText: string): string =>
  withTrailingNewline(`${content.replace(/\s+$/, '')}\n\n${MEALS_HEADING}\n\n${entryText}`);

const findSectionEnd = (lines: readonly string[], sectionStart: number): number => {
  for (let index = sectionStart; index < lines.length; index += 1) {
    if (H2_PATTERN.test(lines[index])) {
      return index;
    }
  }
  return lines.length;
};

/**
 * Inserts a meal into the `## Meals` section in chronological order, creating the
 * section if the note doesn't have one. Existing entries are preserved verbatim;
 * only the separators between them are normalised.
 */
export const insertMeal = (content: string, meal: MealEntry): string => {
  const entryText = renderMealEntry(meal);
  const lines = content.split('\n');
  const mealsIndex = lines.findIndex((line) => line.trim() === MEALS_HEADING);

  if (mealsIndex === -1) {
    return appendMealsSection(content, entryText);
  }

  const sectionEnd = findSectionEnd(lines, mealsIndex + 1);
  const existingBlocks = splitEntryBlocks(lines.slice(mealsIndex + 1, sectionEnd));
  const incoming: EntryBlock = { minutes: timeToMinutes(meal.time), text: entryText };
  const mergedBody = insertSorted(existingBlocks, incoming)
    .map((block) => block.text)
    .join('\n\n');

  const head = lines.slice(0, mealsIndex + 1).join('\n');
  const tailLines = lines.slice(sectionEnd);
  while (tailLines.length > 0 && tailLines[0].trim() === '') {
    tailLines.shift();
  }
  const tail = tailLines.join('\n');

  const rebuilt = tail ? `${head}\n\n${mergedBody}\n\n${tail}` : `${head}\n\n${mergedBody}`;
  return withTrailingNewline(rebuilt);
};
