/** A meal to insert into a daily note. Time is the event time in 24h `HH:MM`. */
export interface MealEntry {
  readonly time: string;
  readonly description: string;
  readonly notes?: string;
  readonly loggedLate?: boolean;
}

/** A meal parsed back out of a daily note for display on the home screen. */
export interface ParsedMeal {
  readonly time: string;
  readonly description: string;
}

export type ExerciseType = 'strength' | 'cardio';

/** An exercise session to insert into a daily note. Time is the event time `HH:MM`. */
export interface ExerciseEntry {
  readonly time: string;
  readonly type: ExerciseType;
  readonly durationMin: number;
  readonly intensity: number;
  readonly notes?: string;
  readonly loggedLate?: boolean;
}

export type DailyEntryKind = 'meal' | 'exercise';

/** A meal or exercise entry parsed from a daily note for the merged home feed. */
export interface DailyEntry {
  readonly kind: DailyEntryKind;
  readonly time: string;
  readonly description: string;
  /** Position within its own section (the Nth meal / Nth exercise), used to target edits. */
  readonly index: number;
}

/** The editable fields of an existing meal, read back from its note for the edit form. */
export interface MealDetails {
  readonly time: string;
  readonly description: string;
  readonly loggedLate: boolean;
  readonly notes?: string;
}

/** The editable fields of an existing exercise session, read back for the edit form. */
export interface ExerciseDetails {
  readonly time: string;
  readonly type: ExerciseType;
  readonly durationMin: number;
  readonly intensity: number;
  readonly loggedLate: boolean;
  readonly notes?: string;
}

/**
 * The morning measurements held in a daily note's frontmatter `morning:` block.
 * Field names are the app-facing camelCase; the YAML keys (`waist_cm`, …) live in
 * the frontmatter serializer.
 */
export interface MorningEntry {
  readonly waistCm: number;
  readonly bloat: number;
  readonly sleep?: number;
  readonly notes?: string;
}
