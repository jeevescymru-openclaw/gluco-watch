export const SETTINGS_LABELS = {
  title: 'Settings',
  reminderLabel: 'Morning reminder',
  reminderHint: 'A daily nudge to log your morning measurements.',
  folderLabel: 'Experiment folder',
  changeFolder: 'Change folder',
  glucoseLabel: 'Glucose backfill',
  glucoseHint: 'Import a Lingo CSV to re-derive history. Health Connect is the primary source.',
  importCsv: 'Import CSV backfill',
  done: 'Done',
} as const;

export const GLUCOSE_IMPORT_ROUTE = '/glucose-import' as const;
