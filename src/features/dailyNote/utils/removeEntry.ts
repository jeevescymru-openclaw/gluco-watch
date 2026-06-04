import { splitEntryBlocks } from './mealBlocks';
import { findSectionEnd, withTrailingNewline } from './sections';

/**
 * Removes the entry at `index` from the named `## ` section. Returns the note unchanged
 * if the section or index is absent. The (possibly now-empty) section heading and every
 * other section are preserved.
 */
export const removeSectionEntry = (content: string, heading: string, index: number): string => {
  const lines = content.split('\n');
  const sectionIndex = lines.findIndex((line) => line.trim() === heading);
  if (sectionIndex === -1) {
    return content;
  }

  const sectionEnd = findSectionEnd(lines, sectionIndex + 1);
  const blocks = splitEntryBlocks(lines.slice(sectionIndex + 1, sectionEnd));
  if (index < 0 || index >= blocks.length) {
    return content;
  }

  const remaining = blocks.filter((_block, blockIndex) => blockIndex !== index);
  const head = lines.slice(0, sectionIndex + 1).join('\n');
  const tailLines = lines.slice(sectionEnd);
  while (tailLines.length > 0 && tailLines[0].trim() === '') {
    tailLines.shift();
  }
  const tail = tailLines.join('\n');

  const body = remaining.map((block) => block.text).join('\n\n');
  const parts = [head, body, tail].filter((part) => part.length > 0);
  return withTrailingNewline(parts.join('\n\n'));
};
