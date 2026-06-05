import type { GlucoseSourceId } from './glucose.types';

export const LINGO_EXPORTS_SUBFOLDER = 'Lingo Exports';

export const CSV_MIME_TYPE = 'text/csv';

export const CSV_FILE_EXTENSION = 'csv';

// The header line of a real Lingo export, reused when serialising the Health Connect
// derived export so the vault file is indistinguishable in format (6d).
export const LINGO_CSV_HEADER =
  'Time of Glucose Reading [T=(local time) +/- (time zone offset)], Measurement(mmol/L)';

export const HEALTH_CONNECT_PROVIDER_PACKAGE = 'com.google.android.apps.healthdata';

export const HEALTH_CONNECT_PLAY_STORE_URL =
  'market://details?id=com.google.android.apps.healthdata';

export const BLOOD_GLUCOSE_RECORD_TYPE = 'BloodGlucose';

// Health Connect read pagination — one page comfortably covers a multi-week 5-min series.
export const HEALTH_CONNECT_PAGE_SIZE = 5000;

// Distinguishes the derived export from a same-day real Lingo CSV (amendment §6d).
export const HEALTH_CONNECT_EXPORT_SUFFIX = '-healthconnect';

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
