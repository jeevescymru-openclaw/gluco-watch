import { describe, expect, it } from 'vitest';

import {
  formatNoteDate,
  formatPillDateTime,
  formatRelativeDay,
  initialEntryDateTime,
  isNoteDateToday,
  parseNoteDate,
  shiftNoteDate,
} from './dateFormat';

const today = (): string => formatNoteDate(new Date());

describe('parseNoteDate', () => {
  it('round-trips with formatNoteDate', () => {
    expect(formatNoteDate(parseNoteDate('2026-05-26'))).toBe('2026-05-26');
  });

  it('parses to a local-midnight date', () => {
    const date = parseNoteDate('2026-05-26');
    expect([date.getFullYear(), date.getMonth(), date.getDate()]).toEqual([2026, 4, 26]);
    expect([date.getHours(), date.getMinutes()]).toEqual([0, 0]);
  });
});

describe('isNoteDateToday', () => {
  it('is true for today and false for a past day', () => {
    expect(isNoteDateToday(today())).toBe(true);
    expect(isNoteDateToday(shiftNoteDate(new Date(), -3))).toBe(false);
  });
});

describe('formatRelativeDay', () => {
  it('labels today and yesterday by name', () => {
    expect(formatRelativeDay(today())).toBe('Today');
    expect(formatRelativeDay(shiftNoteDate(new Date(), -1))).toBe('Yesterday');
  });

  it('labels older days as `Weekday D Mon`', () => {
    expect(formatRelativeDay('2026-05-26')).toBe('Tue 26 May');
  });
});

describe('initialEntryDateTime', () => {
  it('uses the current moment for today', () => {
    const result = initialEntryDateTime(today());
    expect(formatNoteDate(result)).toBe(today());
  });

  it('defaults a past day to midday', () => {
    const result = initialEntryDateTime('2026-05-26');
    expect(formatNoteDate(result)).toBe('2026-05-26');
    expect([result.getHours(), result.getMinutes()]).toEqual([12, 0]);
  });
});

describe('formatPillDateTime', () => {
  it('reads as `RelativeDay, HH:MM`', () => {
    const date = parseNoteDate('2026-05-26');
    date.setHours(8, 5, 0, 0);
    expect(formatPillDateTime(date)).toBe('Tue 26 May, 08:05');
  });
});
