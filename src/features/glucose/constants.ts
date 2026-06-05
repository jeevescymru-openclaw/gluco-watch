import type { GlucoseSourceId } from './glucose.types';

export const LINGO_EXPORTS_SUBFOLDER = 'Lingo Exports';

export const CSV_MIME_TYPE = 'text/csv';

export const CSV_FILE_EXTENSION = 'csv';

export const GLUCOSE_UNIT = 'mmol/L';

export const AUC_UNIT = 'mmol/L·min';

// Health Connect only carries 3.1–11.1 mmol/L; a curve reaching this ceiling has its
// true peak and AUC under-reported (amendment §6b).
export const HEALTH_CONNECT_CEILING_MMOL = 11.1;

// Summary computation windows (plan §4 / amendment).
export const BASELINE_WINDOW_MIN = 15;
export const POST_MEAL_WINDOW_MIN = 120;
export const RETURN_TO_BASELINE_THRESHOLD_MMOL = 0.3;

// Lingo writes a reading every 5 minutes; a gap wider than this in the post-meal
// window means the curve is too sparse to trust, so it is flagged as missing_data.
export const MAX_READING_GAP_MIN = 20;

// A complete post-meal window must reach at least this far past the meal, otherwise
// the curve is truncated (missing_data for a historical CSV, pending for a live run).
export const MIN_POST_WINDOW_COVERAGE_MIN = 110;

export const SOURCE_IDS = {
  lingoCsv: 'lingo-csv',
  healthConnect: 'health-connect',
} as const;

// Import precedence (amendment v2): Health Connect is primary — fresher and finer-grained
// — so a stale CSV backfill must not clobber a good HC summary by default. The CSV's one
// edge is clamped HC curves, handled separately as the clamp exception (§6c).
export const SOURCE_PRECEDENCE: Record<GlucoseSourceId, number> = {
  'health-connect': 2,
  'lingo-csv': 1,
};

export const GLUCOSE_SUMMARY_HEADING = '#### Glucose summary';

export const SUMMARY_LABELS = {
  baseline: 'Baseline',
  peak: 'Peak',
  returnedToBaseline: 'Returned to baseline',
  auc: 'AUC (2h above baseline)',
  quality: 'Quality',
  source: 'Source',
  note: 'Note',
} as const;

export const SUMMARY_NOT_RETURNED = 'not within 2h';

export const CEILING_NOTE = `peak reached the ${HEALTH_CONNECT_CEILING_MMOL} ${GLUCOSE_UNIT} Health Connect ceiling — true peak and AUC under-reported`;
