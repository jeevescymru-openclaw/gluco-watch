import { describe, expect, it } from 'vitest';

import { createDailyNote } from './createDailyNote';
import { insertExercise } from './insertExercise';
import { insertMeal } from './insertMeal';
import { parseDailyEntries } from './parseEntries';
import { parseMeals } from './parseMeals';

import type { ExerciseEntry, MealEntry } from '../dailyNote.types';

const NOTE_DATE = '2026-05-26';

const STRENGTH: ExerciseEntry = {
  time: '07:30',
  type: 'strength',
  durationMin: 60,
  intensity: 4,
  notes: 'full upper body',
};
const CARDIO: ExerciseEntry = { time: '18:00', type: 'cardio', durationMin: 30, intensity: 3 };
const RICE: MealEntry = { time: '13:15', description: 'White rice, chicken' };

describe('insertExercise', () => {
  it('renders the fixed `Type, N min, intensity N` heading with a notes line', () => {
    const result = insertExercise(createDailyNote(NOTE_DATE), STRENGTH);

    expect(result).toContain('## Exercise');
    expect(result).toContain('### 07:30 — Strength, 60 min, intensity 4');
    expect(result).toContain('Notes: full upper body');
  });

  it('omits the notes line when there are no notes', () => {
    const result = insertExercise(createDailyNote(NOTE_DATE), CARDIO);

    expect(result).toContain('### 18:00 — Cardio, 30 min, intensity 3');
    expect(result).not.toContain('Notes:');
  });

  it('inserts exercise in chronological order within the Exercise section', () => {
    const result = insertExercise(insertExercise(createDailyNote(NOTE_DATE), CARDIO), STRENGTH);

    const strengthAt = result.indexOf('07:30');
    const cardioAt = result.indexOf('18:00');
    expect(strengthAt).toBeLessThan(cardioAt);
  });

  it('keeps the Meals section intact when exercise is added afterwards', () => {
    const withMeal = insertMeal(createDailyNote(NOTE_DATE), RICE);
    const result = insertExercise(withMeal, STRENGTH);

    expect(parseMeals(result)).toEqual([{ time: '13:15', description: 'White rice, chicken' }]);
    expect(result).toContain('## Meals');
    expect(result).toContain('## Exercise');
    expect(result.indexOf('## Meals')).toBeLessThan(result.indexOf('## Exercise'));
  });
});

describe('parseDailyEntries', () => {
  it('merges meals and exercise into one chronological feed tagged by kind', () => {
    const note = insertExercise(
      insertExercise(insertMeal(createDailyNote(NOTE_DATE), RICE), STRENGTH),
      CARDIO,
    );

    expect(parseDailyEntries(note)).toEqual([
      { kind: 'exercise', time: '07:30', description: 'Strength, 60 min, intensity 4', index: 0 },
      { kind: 'meal', time: '13:15', description: 'White rice, chicken', index: 0 },
      { kind: 'exercise', time: '18:00', description: 'Cardio, 30 min, intensity 3', index: 1 },
    ]);
  });

  it('returns an empty feed for a note with no entries', () => {
    expect(parseDailyEntries(createDailyNote(NOTE_DATE))).toEqual([]);
  });
});
