import type { MealClassification } from '../../glucose.types';

export const GLUCOSE_IMPORT_LABELS = {
  title: 'Import glucose',
  loading: 'Reading glucose data…',
  applying: 'Saving summaries…',
  emptyTitle: 'No meals matched',
  emptyBody: 'No logged meals fall within this export’s date range.',
  errorTitle: 'Import failed',
  permissionError: 'Lost access to the vault folder. Please pick it again.',
  genericError: 'Something went wrong reading the glucose data.',
  cancel: 'Cancel',
  close: 'Close',
  protectedHint:
    'A fresher Health Connect summary is already here — keep it, or import this one anyway.',
  resummarise: 'Import anyway',
} as const;

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
