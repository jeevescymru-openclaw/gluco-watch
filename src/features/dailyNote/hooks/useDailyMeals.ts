import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';

import { dailyNoteService } from '../services/dailyNoteServiceInstance';

import type { ParsedMeal } from '../dailyNote.types';

interface UseDailyMealsResult {
  readonly meals: readonly ParsedMeal[];
  readonly isLoading: boolean;
  readonly hasError: boolean;
  readonly refresh: () => Promise<void>;
}

export const useDailyMeals = (
  experimentFolderUri: string,
  noteDate: string,
): UseDailyMealsResult => {
  const [meals, setMeals] = useState<readonly ParsedMeal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const refresh = useCallback(async (): Promise<void> => {
    setHasError(false);
    try {
      setMeals(await dailyNoteService.readMeals(experimentFolderUri, noteDate));
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

  return { meals, isLoading, hasError, refresh };
};
