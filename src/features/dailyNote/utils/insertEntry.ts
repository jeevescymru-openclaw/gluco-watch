import { insertSorted, splitEntryBlocks } from './mealBlocks';
import { findSectionEnd, withTrailingNewline } from './sections';
import { timeToMinutes } from './time';

import type { EntryBlock } from './mealBlocks';

const appendSection = (content: string, heading: string, entryText: string): string =>
  withTrailingNewline(`${content.replace(/\s+$/, '')}\n\n${heading}\n\n${entryText}`);

/**
 * Inserts an entry into the named `## ` section in chronological order, creating the
 * section (appended after any existing content) if the note doesn't have one. Existing
 * entries are preserved verbatim; only the separators between them are normalised.
 */
export const insertSectionEntry = (
  content: string,
  heading: string,
  time: string,
  entryText: string,
): string => {
  const lines = content.split('\n');
  const sectionIndex = lines.findIndex((line) => line.trim() === heading);

  if (sectionIndex === -1) {
    return appendSection(content, heading, entryText);
  }

  const sectionEnd = findSectionEnd(lines, sectionIndex + 1);
  const existingBlocks = splitEntryBlocks(lines.slice(sectionIndex + 1, sectionEnd));
  const incoming: EntryBlock = { minutes: timeToMinutes(time), text: entryText };
  const mergedBody = insertSorted(existingBlocks, incoming)
    .map((block) => block.text)
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
