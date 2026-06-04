import { EXERCISE_HEADING, MEALS_HEADING } from '../constants';
import { ENTRY_HEADING_PATTERN, H2_PATTERN } from './patterns';
import { timeToMinutes } from './time';

import type { DailyEntry, DailyEntryKind } from '../dailyNote.types';

interface ParsedEntry {
  readonly time: string;
  readonly description: string;
}

/** Reads the `### HH:MM — description` entries out of a single `## ` section, in document order. */
export const parseSectionEntries = (content: string, heading: string): ParsedEntry[] => {
  const lines = content.split('\n');
  const sectionIndex = lines.findIndex((line) => line.trim() === heading);
  if (sectionIndex === -1) {
    return [];
  }

  const entries: ParsedEntry[] = [];
  for (let index = sectionIndex + 1; index < lines.length; index += 1) {
    const line = lines[index];
    if (H2_PATTERN.test(line)) {
      break;
    }
    const match = ENTRY_HEADING_PATTERN.exec(line);
    if (match) {
      entries.push({ time: match[1], description: match[2].trim() });
    }
  }
  return entries;
};

const sectionEntries = (content: string, heading: string, kind: DailyEntryKind): DailyEntry[] =>
  parseSectionEntries(content, heading).map((entry, index) => ({ ...entry, kind, index }));

/** Merges the meals and exercise of a daily note into one chronological feed. */
export const parseDailyEntries = (content: string): DailyEntry[] =>
  [
    ...sectionEntries(content, MEALS_HEADING, 'meal'),
    ...sectionEntries(content, EXERCISE_HEADING, 'exercise'),
  ].sort((first, second) => timeToMinutes(first.time) - timeToMinutes(second.time));
