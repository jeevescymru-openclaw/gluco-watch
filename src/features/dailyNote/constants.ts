export const MEALS_HEADING = '## Meals';

export const ENTRY_HEADING_PREFIX = '### ';

// U+2014 em dash, padded with single spaces. The H3 format `### HH:MM — description`
// is parsed in Step 6 (Lingo import) to match meals by time, so this separator must
// stay exactly as the plan §3 specifies.
export const TIME_DESCRIPTION_SEPARATOR = ' — ';

export const NOTES_PREFIX = 'Notes: ';

export const FRONTMATTER_FENCE = '---';

export const MORNING_NOT_LOGGED = 'morning: null';

// The frontmatter `morning:` block keys. Snake_case is fixed by the storage model
// (plan §3) so the analysis agent can rely on it; the app-facing type is camelCase.
export const MORNING_KEY = 'morning';

export const MORNING_YAML_KEYS = {
  waist: 'waist_cm',
  bloat: 'bloat',
  sleep: 'sleep',
  notes: 'notes',
} as const;

// Indentation of the morning block's child keys within the frontmatter.
export const MORNING_CHILD_INDENT = '  ';

export const WAIST_UNIT = 'cm';

export const DAILY_SUBFOLDER = 'Daily';

export const MARKDOWN_MIME_TYPE = 'text/markdown';

// SAF derives the `.md` extension from the MIME type, so file base names are
// passed without it. The temp file therefore lands as `${date}.tmp.md`.
export const TEMP_BASE_SUFFIX = '.tmp';
