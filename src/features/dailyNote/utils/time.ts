import { CLOCK_PATTERN, ENTRY_TIME_PATTERN } from './patterns';

/** Sorts entries with an unparseable time to the end rather than dropping them. */
export const UNKNOWN_TIME_MINUTES = Number.MAX_SAFE_INTEGER;

export const timeToMinutes = (time: string): number => {
  const match = CLOCK_PATTERN.exec(time);
  if (!match) {
    return UNKNOWN_TIME_MINUTES;
  }
  return Number(match[1]) * 60 + Number(match[2]);
};

export const headingTimeToMinutes = (headingLine: string): number => {
  const match = ENTRY_TIME_PATTERN.exec(headingLine);
  return match ? timeToMinutes(match[1]) : UNKNOWN_TIME_MINUTES;
};
