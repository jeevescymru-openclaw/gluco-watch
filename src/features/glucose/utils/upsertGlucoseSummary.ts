import { MEALS_HEADING } from '@/features/dailyNote/constants';
import { splitEntryBlocks } from '@/features/dailyNote/utils/mealBlocks';
import { findSectionEnd, withTrailingNewline } from '@/features/dailyNote/utils/sections';

import { GLUCOSE_SUMMARY_HEADING } from '../constants';

const trimTrailingBlankLines = (lines: readonly string[]): string[] => {
  const result = [...lines];
  while (result.length > 0 && result[result.length - 1].trim() === '') {
    result.pop();
  }
  return result;
};

/** Replaces any existing summary in a meal block, or appends one after the meal's content. */
const setBlockSummary = (blockText: string, summaryText: string): string => {
  const lines = blockText.split('\n');
  const headingIndex = lines.findIndex((line) => line.trim() === GLUCOSE_SUMMARY_HEADING);
  const kept = trimTrailingBlankLines(headingIndex === -1 ? lines : lines.slice(0, headingIndex));
  return `${kept.join('\n')}\n\n${summaryText}`;
};

/**
 * Inserts or replaces the `#### Glucose summary` block under the meal at `mealIndex`
 * within the `## Meals` section, leaving every other entry verbatim. Returns the note
 * unchanged when the meal index is out of range.
 */
export const upsertGlucoseSummary = (
  content: string,
  mealIndex: number,
  summaryText: string,
): string => {
  const lines = content.split('\n');
  const sectionIndex = lines.findIndex((line) => line.trim() === MEALS_HEADING);
  if (sectionIndex === -1) {
    return content;
  }

  const sectionEnd = findSectionEnd(lines, sectionIndex + 1);
  const blocks = splitEntryBlocks(lines.slice(sectionIndex + 1, sectionEnd));
  if (mealIndex < 0 || mealIndex >= blocks.length) {
    return content;
  }

  const mergedBody = blocks
    .map((block, index) =>
      index === mealIndex ? setBlockSummary(block.text, summaryText) : block.text,
    )
    .join('\n\n');

  const head = lines.slice(0, sectionIndex + 1).join('\n');
  const tailLines = lines.slice(sectionEnd);
  while (tailLines.length > 0 && tailLines[0].trim() === '') {
    tailLines.shift();
  }
  const tail = tailLines.join('\n');

  const rebuilt = tail ? `${head}\n\n${mergedBody}\n\n${tail}` : `${head}\n\n${mergedBody}`;
  return withTrailingNewline(rebuilt);
};
