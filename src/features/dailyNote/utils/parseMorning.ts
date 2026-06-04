import { MORNING_KEY, MORNING_YAML_KEYS } from '../constants';
import { parseFrontmatter } from './frontmatter';

import type { MorningEntry } from '../dailyNote.types';

const isFiniteNumber = (value: unknown): value is number =>
  typeof value === 'number' && Number.isFinite(value);

const isNonEmptyString = (value: unknown): value is string =>
  typeof value === 'string' && value.trim().length > 0;

/**
 * Reads the morning measurements from a note's frontmatter. Returns null when the
 * `morning:` block is null/absent or missing its required waist and bloat values,
 * so a half-written or hand-edited block degrades gracefully rather than throwing.
 */
export const parseMorning = (content: string): MorningEntry | null => {
  const raw = parseFrontmatter(content)?.[MORNING_KEY];
  if (raw === null || typeof raw !== 'object') {
    return null;
  }

  const block = raw as Record<string, unknown>;
  const waistCm = block[MORNING_YAML_KEYS.waist];
  const bloat = block[MORNING_YAML_KEYS.bloat];
  if (!isFiniteNumber(waistCm) || !isFiniteNumber(bloat)) {
    return null;
  }

  const sleep = block[MORNING_YAML_KEYS.sleep];
  const notes = block[MORNING_YAML_KEYS.notes];
  return {
    waistCm,
    bloat,
    ...(isFiniteNumber(sleep) ? { sleep } : {}),
    ...(isNonEmptyString(notes) ? { notes: notes.trim() } : {}),
  };
};
