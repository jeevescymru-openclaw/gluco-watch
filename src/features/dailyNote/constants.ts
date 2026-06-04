export const MEALS_HEADING = '## Meals';

export const EXERCISE_HEADING = '## Exercise';

// The H3 entry text for an exercise reads `Strength, 60 min, intensity 4`, kept
// human-scannable and machine-parseable per the storage model (plan §3).
export const EXERCISE_TYPE_LABELS = {
  strength: 'Strength',
  cardio: 'Cardio',
} as const;

export const EXERCISE_DURATION_UNIT = 'min';

export const EXERCISE_INTENSITY_LABEL = 'intensity';

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

// Appended to a backdated entry's notes line so the analysis agent knows the
// timestamp was reconstructed after the fact and may be approximate (plan §4).
export const LOGGED_LATE_MARKER = '(logged late)';

// A browsed past day has no obvious event time, so its picker defaults to midday.
export const DEFAULT_BACKDATE_HOUR = 12;

export const WEEKDAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const;

export const MONTH_LABELS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
] as const;

export const RELATIVE_DAY_LABELS = {
  today: 'Today',
  yesterday: 'Yesterday',
} as const;

export const DAILY_SUBFOLDER = 'Daily';

export const MARKDOWN_MIME_TYPE = 'text/markdown';

// SAF derives the `.md` extension from the MIME type, so file base names are
// passed without it. The temp file therefore lands as `${date}.tmp.md`.
export const TEMP_BASE_SUFFIX = '.tmp';
