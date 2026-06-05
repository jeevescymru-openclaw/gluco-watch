import type { GlucoseSourceId, MealClassification } from '../../glucose.types';

export const GLUCOSE_IMPORT_LABELS = {
  loading: 'Reading glucose data…',
  applying: 'Saving summaries…',
  emptyTitle: 'No meals matched',
  emptyBody: 'No logged meals fall within this data’s date range.',
  errorTitle: 'Import failed',
  permissionError: 'Lost access to the vault folder. Please pick it again.',
  genericError: 'Something went wrong reading the glucose data.',
  unavailableTitle: 'Health Connect not available',
  unavailableBody:
    'Health Connect isn’t installed or set up on this device. Install it, then import again.',
  updateTitle: 'Update Health Connect',
  updateBody: 'Your Health Connect app needs updating before glucose can be read.',
  permissionTitle: 'Glucose access needed',
  permissionBody:
    'GlucoWatch needs permission to read blood glucose from Health Connect. Grant it, then import again.',
  installAction: 'Open Play Store',
  settingsAction: 'Open Health Connect',
  cancel: 'Cancel',
  close: 'Close',
  protectedHint:
    'A fresher Health Connect summary is already here — keep it, or import this one anyway.',
  resummarise: 'Import anyway',
  pending: 'Pending — 2h window not complete yet',
} as const;

export const SOURCE_TITLES: Record<GlucoseSourceId, string> = {
  'health-connect': 'Import from Health Connect',
  'lingo-csv': 'Import CSV backfill',
};

export const CLASSIFICATION_LABELS: Record<MealClassification, string> = {
  new: 'New',
  replace: 'Replace',
  protected: 'Protected',
  pending: 'Pending',
};

export const confirmLabel = (count: number): string =>
  count === 1 ? 'Write 1 summary' : `Write ${count} summaries`;

export const rangeLabel = (from: string, to: string): string =>
  from === to ? from : `${from} → ${to}`;

export const GLUCOSE_IMPORT_ROUTE = '/glucose-import';
