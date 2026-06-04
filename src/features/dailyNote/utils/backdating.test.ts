import { describe, expect, it } from 'vitest';

import { createDailyNote } from './createDailyNote';
import { insertExercise } from './insertExercise';
import { insertMeal } from './insertMeal';

import type { ExerciseEntry, MealEntry } from '../dailyNote.types';

const NOTE_DATE = '2026-05-26';

describe('logged-late marker', () => {
  it('appends `(logged late)` to an existing notes line', () => {
    const meal: MealEntry = {
      time: '08:00',
      description: 'Eggs',
      notes: 'reconstructed from memory',
      loggedLate: true,
    };
    const result = insertMeal(createDailyNote(NOTE_DATE), meal);

    expect(result).toContain('Notes: reconstructed from memory (logged late)');
  });

  it('creates a notes line holding just the marker when there are no notes', () => {
    const meal: MealEntry = { time: '08:00', description: 'Eggs', loggedLate: true };
    const result = insertMeal(createDailyNote(NOTE_DATE), meal);

    expect(result).toContain('### 08:00 — Eggs\nNotes: (logged late)');
  });

  it('omits the marker when the entry was not backdated', () => {
    const meal: MealEntry = { time: '08:00', description: 'Eggs', notes: 'normal portion' };
    const result = insertMeal(createDailyNote(NOTE_DATE), meal);

    expect(result).toContain('Notes: normal portion');
    expect(result).not.toContain('logged late');
  });

  it('marks a backdated exercise entry', () => {
    const exercise: ExerciseEntry = {
      time: '07:30',
      type: 'strength',
      durationMin: 60,
      intensity: 4,
      loggedLate: true,
    };
    const result = insertExercise(createDailyNote(NOTE_DATE), exercise);

    expect(result).toContain('### 07:30 — Strength, 60 min, intensity 4\nNotes: (logged late)');
  });
});
