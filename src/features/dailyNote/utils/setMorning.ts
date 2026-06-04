import {
  FRONTMATTER_FENCE,
  MORNING_CHILD_INDENT,
  MORNING_KEY,
  MORNING_YAML_KEYS,
} from '../constants';
import { splitFrontmatter } from './frontmatter';

import type { MorningEntry } from '../dailyNote.types';

const MORNING_LINE_PATTERN = new RegExp(`^${MORNING_KEY}:`);

const isIndented = (line: string): boolean => /^\s/.test(line);

const childLine = (key: string, value: string): string => `${MORNING_CHILD_INDENT}${key}: ${value}`;

// JSON string syntax is a valid YAML double-quoted scalar, so it safely escapes
// colons, quotes, em dashes, and newlines in free-text notes.
const serializeMorning = (morning: MorningEntry): readonly string[] => {
  const lines = [
    `${MORNING_KEY}:`,
    childLine(MORNING_YAML_KEYS.waist, String(morning.waistCm)),
    childLine(MORNING_YAML_KEYS.bloat, String(morning.bloat)),
  ];
  if (morning.sleep !== undefined) {
    lines.push(childLine(MORNING_YAML_KEYS.sleep, String(morning.sleep)));
  }
  const notes = morning.notes?.trim();
  if (notes) {
    lines.push(childLine(MORNING_YAML_KEYS.notes, JSON.stringify(notes)));
  }
  return lines;
};

const replaceMorningBlock = (
  frontmatterLines: readonly string[],
  morningLines: readonly string[],
): string[] => {
  const start = frontmatterLines.findIndex((line) => MORNING_LINE_PATTERN.test(line));
  if (start === -1) {
    return [...frontmatterLines, ...morningLines];
  }
  let end = start + 1;
  while (end < frontmatterLines.length && isIndented(frontmatterLines[end])) {
    end += 1;
  }
  return [...frontmatterLines.slice(0, start), ...morningLines, ...frontmatterLines.slice(end)];
};

/**
 * Writes the morning measurements into the frontmatter `morning:` block, replacing
 * any existing block in place. The `date:` line, any other frontmatter keys, and the
 * whole body below the frontmatter are preserved verbatim.
 */
export const setMorning = (content: string, morning: MorningEntry): string => {
  const lines = content.split('\n');
  const split = splitFrontmatter(lines);
  const morningLines = serializeMorning(morning);

  if (!split) {
    return [FRONTMATTER_FENCE, ...morningLines, FRONTMATTER_FENCE, '', ...lines].join('\n');
  }

  const frontmatter = replaceMorningBlock(split.lines, morningLines);
  const body = lines.slice(split.bodyStartIndex);
  return [FRONTMATTER_FENCE, ...frontmatter, FRONTMATTER_FENCE, ...body].join('\n');
};
