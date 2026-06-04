import { useState } from 'react';

import { formatNoteDate } from '@/features/dailyNote/utils/dateFormat';

const PREVIOUS_DAY = -1;
const NEXT_DAY = 1;

const atMidnight = (date: Date): Date =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate());

interface UseSelectedDateResult {
  readonly selectedDate: string;
  readonly isToday: boolean;
  readonly canGoForward: boolean;
  readonly goToPreviousDay: () => void;
  readonly goToNextDay: () => void;
  readonly goToToday: () => void;
}

/**
 * Tracks the day the home screen is viewing. Defaults to today and never advances past
 * it — there are no notes for the future (plan §4 home screen).
 */
export const useSelectedDate = (): UseSelectedDateResult => {
  const [selected, setSelected] = useState(() => atMidnight(new Date()));

  const today = atMidnight(new Date());
  const isToday = selected.getTime() === today.getTime();
  const canGoForward = selected.getTime() < today.getTime();

  const shiftBy = (dayCount: number): void => {
    setSelected((previous) => {
      const next = new Date(previous);
      next.setDate(previous.getDate() + dayCount);
      return next;
    });
  };

  const goToPreviousDay = (): void => {
    shiftBy(PREVIOUS_DAY);
  };

  const goToNextDay = (): void => {
    if (canGoForward) {
      shiftBy(NEXT_DAY);
    }
  };

  const goToToday = (): void => {
    setSelected(atMidnight(new Date()));
  };

  return {
    selectedDate: formatNoteDate(selected),
    isToday,
    canGoForward,
    goToPreviousDay,
    goToNextDay,
    goToToday,
  };
};
