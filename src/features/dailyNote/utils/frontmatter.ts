import { JSON_SCHEMA, load } from 'js-yaml';

import { FRONTMATTER_FENCE } from '../constants';

/** The leading `---` block of a note, split from everything after the closing fence. */
export interface FrontmatterSplit {
  /** Lines strictly between the opening and closing fences. */
  readonly lines: readonly string[];
  /** Index in the original line array where the body (after the closing fence) starts. */
  readonly bodyStartIndex: number;
}

/**
 * Locates the frontmatter block. Returns null when the note has no leading fence or
 * the fence is never closed, so callers can fall back rather than corrupt the note.
 */
export const splitFrontmatter = (lines: readonly string[]): FrontmatterSplit | null => {
  if (lines[0]?.trim() !== FRONTMATTER_FENCE) {
    return null;
  }
  for (let index = 1; index < lines.length; index += 1) {
    if (lines[index].trim() === FRONTMATTER_FENCE) {
      return { lines: lines.slice(1, index), bodyStartIndex: index + 1 };
    }
  }
  return null;
};

/**
 * Parses the frontmatter into a plain object. JSON_SCHEMA is used so a bare date like
 * `2026-05-26` stays a string rather than being coerced into a Date that would round-trip
 * back as a full timestamp.
 */
export const parseFrontmatter = (content: string): Record<string, unknown> | null => {
  const split = splitFrontmatter(content.split('\n'));
  if (!split) {
    return null;
  }
  const data = load(split.lines.join('\n'), { schema: JSON_SCHEMA });
  return data !== null && typeof data === 'object' ? (data as Record<string, unknown>) : null;
};
