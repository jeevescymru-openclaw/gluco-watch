import type { DailyEntryKind } from '@/features/dailyNote/dailyNote.types';

export const HOME_LABELS = {
  settings: 'Settings',
  folderPrefix: 'Folder: ',
  readError: 'Could not read today’s note. Check the folder is still accessible.',
  addEntry: 'Log an entry',
} as const;

export const MORNING_ROUTE = '/morning' as const;

export const SETTINGS_ROUTE = '/settings' as const;

export const ENTRY_ROUTES: Record<DailyEntryKind, '/meal' | '/exercise'> = {
  meal: '/meal',
  exercise: '/exercise',
};
