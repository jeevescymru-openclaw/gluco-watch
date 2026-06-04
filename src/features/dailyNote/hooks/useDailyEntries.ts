import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';

import { dailyNoteService } from '../services/dailyNoteServiceInstance';

import type { DailyEntry } from '../dailyNote.types';

interface UseDailyEntriesResult {
  readonly entries: readonly DailyEntry[];
  readonly isLoading: boolean;
  readonly hasError: boolean;
  readonly refresh: () => Promise<void>;
}

/** Reads the merged meal-and-exercise feed for a day, refreshing whenever home regains focus. */
export const useDailyEntries = (
  experimentFolderUri: string,
  noteDate: string,
): UseDailyEntriesResult => {
  const [entries, setEntries] = useState<readonly DailyEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const refresh = useCallback(async (): Promise<void> => {
    setHasError(false);
    try {
      setEntries(await dailyNoteService.readEntries(experimentFolderUri, noteDate));
    } catch {
      setHasError(true);
    } finally {
      setIsLoading(false);
    }
  }, [experimentFolderUri, noteDate]);

  useFocusEffect(
    useCallback(() => {
      void refresh();
    }, [refresh]),
  );

  return { entries, isLoading, hasError, refresh };
};
