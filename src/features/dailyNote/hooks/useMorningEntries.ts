import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';

import { dailyNoteService } from '../services/dailyNoteServiceInstance';

import type { MorningEntry } from '../dailyNote.types';

interface UseMorningEntriesResult {
  readonly today: MorningEntry | null;
  readonly yesterday: MorningEntry | null;
  readonly isLoading: boolean;
  readonly hasError: boolean;
  readonly refresh: () => Promise<void>;
}

/**
 * Reads the morning entry for `noteDate`, plus `previousDate`'s when supplied (the
 * morning form needs yesterday's values as an anchor; the home screen does not).
 */
export const useMorningEntries = (
  experimentFolderUri: string,
  noteDate: string,
  previousDate?: string,
): UseMorningEntriesResult => {
  const [today, setToday] = useState<MorningEntry | null>(null);
  const [yesterday, setYesterday] = useState<MorningEntry | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const refresh = useCallback(async (): Promise<void> => {
    // Config loads asynchronously on the modal, so the URI is briefly empty. Stay in the
    // loading state rather than fetching with an empty URI — a failed fetch there would
    // clear isLoading and mount the form with blank values before the real read runs.
    if (!experimentFolderUri) {
      return;
    }
    setHasError(false);
    try {
      const [todayEntry, previousEntry] = await Promise.all([
        dailyNoteService.readMorning(experimentFolderUri, noteDate),
        previousDate ? dailyNoteService.readMorning(experimentFolderUri, previousDate) : null,
      ]);
      setToday(todayEntry);
      setYesterday(previousEntry);
    } catch {
      setHasError(true);
    } finally {
      setIsLoading(false);
    }
  }, [experimentFolderUri, noteDate, previousDate]);

  useFocusEffect(
    useCallback(() => {
      void refresh();
    }, [refresh]),
  );

  return { today, yesterday, isLoading, hasError, refresh };
};
