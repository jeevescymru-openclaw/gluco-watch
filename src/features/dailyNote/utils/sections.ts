import { splitEntryBlocks } from './mealBlocks';
import { H2_PATTERN } from './patterns';

export const withTrailingNewline = (content: string): string => `${content.replace(/\s+$/, '')}\n`;

/** The index of the next `## ` heading after `sectionStart`, or the end of the note. */
export const findSectionEnd = (lines: readonly string[], sectionStart: number): number => {
  for (let index = sectionStart; index < lines.length; index += 1) {
    if (H2_PATTERN.test(lines[index])) {
      return index;
    }
  }
  return lines.length;
};

/** The verbatim text of each `### ` entry block in a `## ` section, in document order. */
export const sectionBlockTexts = (content: string, heading: string): string[] => {
  const lines = content.split('\n');
  const sectionIndex = lines.findIndex((line) => line.trim() === heading);
  if (sectionIndex === -1) {
    return [];
  }
  const sectionEnd = findSectionEnd(lines, sectionIndex + 1);
  return splitEntryBlocks(lines.slice(sectionIndex + 1, sectionEnd)).map((block) => block.text);
};
