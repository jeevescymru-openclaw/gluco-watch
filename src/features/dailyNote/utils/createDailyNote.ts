import { FRONTMATTER_FENCE, MEALS_HEADING, MORNING_NOT_LOGGED } from '../constants';

/** Builds a fresh daily note with well-formed frontmatter and an empty Meals section. */
export const createDailyNote = (noteDate: string): string =>
  [
    FRONTMATTER_FENCE,
    `date: ${noteDate}`,
    MORNING_NOT_LOGGED,
    FRONTMATTER_FENCE,
    '',
    `# ${noteDate}`,
    '',
    MEALS_HEADING,
  ].join('\n');
