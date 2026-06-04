import { describe, expect, it } from 'vitest';

import { createDailyNote } from './createDailyNote';
import { insertMeal } from './insertMeal';
import { parseMeals } from './parseMeals';
import { parseMorning } from './parseMorning';
import { setMorning } from './setMorning';

import type { MealEntry, MorningEntry } from '../dailyNote.types';

const NOTE_DATE = '2026-05-26';

const FULL: MorningEntry = { waistCm: 84.2, bloat: 2, sleep: 4, notes: 'slept poorly' };
const MINIMAL: MorningEntry = { waistCm: 83, bloat: 3 };
const RICE: MealEntry = { time: '13:15', description: 'White rice, chicken', notes: 'ate slowly.' };

describe('setMorning + parseMorning', () => {
  it('writes a full morning block into a fresh note and reads it back', () => {
    const result = setMorning(createDailyNote(NOTE_DATE), FULL);

    expect(result).toContain('morning:');
    expect(result).toContain('  waist_cm: 84.2');
    expect(result).toContain('  bloat: 2');
    expect(result).toContain('  sleep: 4');
    expect(parseMorning(result)).toEqual(FULL);
  });

  it('omits sleep and notes lines when they are absent', () => {
    const result = setMorning(createDailyNote(NOTE_DATE), MINIMAL);

    expect(result).not.toContain('sleep:');
    expect(result).not.toContain('notes:');
    expect(parseMorning(result)).toEqual(MINIMAL);
  });

  it('replaces the `morning: null` placeholder rather than duplicating the key', () => {
    const created = createDailyNote(NOTE_DATE);
    expect(created).toContain('morning: null');

    const result = setMorning(created, FULL);
    expect(result).not.toContain('morning: null');
    expect(result.match(/^morning:/gm)).toHaveLength(1);
  });

  it('overwrites an existing morning block in place', () => {
    const once = setMorning(createDailyNote(NOTE_DATE), FULL);
    const twice = setMorning(once, MINIMAL);

    expect(parseMorning(twice)).toEqual(MINIMAL);
    expect(twice.match(/^morning:/gm)).toHaveLength(1);
  });

  it('preserves the date line and the body, including logged meals', () => {
    const withMeal = insertMeal(createDailyNote(NOTE_DATE), RICE);
    const result = setMorning(withMeal, FULL);

    expect(result).toContain(`date: ${NOTE_DATE}`);
    expect(result).toContain(`# ${NOTE_DATE}`);
    expect(result).toContain('### 13:15 — White rice, chicken');
    expect(result).toContain('Notes: ate slowly.');
    expect(parseMeals(result)).toEqual([{ time: '13:15', description: 'White rice, chicken' }]);
  });

  it('does not disturb meals when saving morning after meals were logged', () => {
    const withMeal = insertMeal(createDailyNote(NOTE_DATE), RICE);
    const beforeBody = withMeal.slice(withMeal.indexOf('# '));

    const result = setMorning(withMeal, FULL);
    const afterBody = result.slice(result.indexOf('# '));

    expect(afterBody).toBe(beforeBody);
  });

  it('escapes free-text notes with awkward characters', () => {
    const tricky: MorningEntry = {
      waistCm: 80,
      bloat: 1,
      notes: 'had: coffee, "lots" — felt\noff',
    };
    const result = setMorning(createDailyNote(NOTE_DATE), tricky);

    expect(parseMorning(result)?.notes).toBe('had: coffee, "lots" — felt\noff');
  });
});

describe('parseMorning', () => {
  it('returns null for a not-yet-logged morning', () => {
    expect(parseMorning(createDailyNote(NOTE_DATE))).toBeNull();
  });

  it('returns null when the note has no frontmatter at all', () => {
    expect(parseMorning('# just a heading\n')).toBeNull();
  });

  it('returns null when required values are missing', () => {
    const partial = '---\ndate: 2026-05-26\nmorning:\n  sleep: 4\n---\n\n# 2026-05-26\n';
    expect(parseMorning(partial)).toBeNull();
  });
});
