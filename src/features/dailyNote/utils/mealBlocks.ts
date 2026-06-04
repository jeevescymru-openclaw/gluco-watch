import { ENTRY_PATTERN } from './patterns';
import { headingTimeToMinutes } from './time';

/** A single meal entry captured verbatim, tagged with its time for ordering. */
export interface EntryBlock {
  readonly minutes: number;
  readonly text: string;
}

const trimTrailingBlankLines = (lines: readonly string[]): string[] => {
  const result = [...lines];
  while (result.length > 0 && result[result.length - 1].trim() === '') {
    result.pop();
  }
  return result;
};

const toBlock = (entryLines: readonly string[]): EntryBlock => {
  const trimmed = trimTrailingBlankLines(entryLines);
  return { minutes: headingTimeToMinutes(trimmed[0]), text: trimmed.join('\n') };
};

/** Splits the lines inside a `## Meals` section into one block per `### ` entry. */
export const splitEntryBlocks = (sectionLines: readonly string[]): EntryBlock[] => {
  const blocks: EntryBlock[] = [];
  let current: string[] | null = null;

  for (const line of sectionLines) {
    if (ENTRY_PATTERN.test(line)) {
      if (current) {
        blocks.push(toBlock(current));
      }
      current = [line];
    } else if (current) {
      current.push(line);
    }
  }

  if (current) {
    blocks.push(toBlock(current));
  }

  return blocks;
};

export const insertSorted = (
  existing: readonly EntryBlock[],
  incoming: EntryBlock,
): EntryBlock[] => {
  const insertAt = existing.findIndex((block) => block.minutes > incoming.minutes);
  if (insertAt === -1) {
    return [...existing, incoming];
  }
  return [...existing.slice(0, insertAt), incoming, ...existing.slice(insertAt)];
};
