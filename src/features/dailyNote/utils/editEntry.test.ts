import { describe, expect, it } from 'vitest';

import { createDailyNote } from './createDailyNote';
import { insertExercise } from './insertExercise';
import { insertMeal } from './insertMeal';
import { parseDailyEntries } from './parseEntries';
import { parseExerciseDetails, parseMealDetails } from './parseEntryDetails';
import { removeSectionEntry } from './removeEntry';

import { EXERCISE_HEADING, MEALS_HEADING } from '../constants';

import type { ExerciseEntry, MealEntry } from '../dailyNote.types';

const NOTE_DATE = '2026-05-26';

const BREAKFAST: MealEntry = { time: '08:00', description: 'Eggs and avocado' };
const LUNCH: MealEntry = { time: '13:15', description: 'White rice, chicken', notes: 'ate slowly' };
const STRENGTH: ExerciseEntry = {
  time: '07:30',
  type: 'strength',
  durationMin: 60,
  intensity: 4,
  notes: 'upper body',
};

const noteWithEntries = (): string =>
  insertExercise(insertMeal(insertMeal(createDailyNote(NOTE_DATE), LUNCH), BREAKFAST), STRENGTH);

describe('removeSectionEntry', () => {
  it('removes the targeted meal and keeps the others and the exercise section', () => {
    const note = noteWithEntries();
    // Meals are sorted: index 0 = 08:00 breakfast, index 1 = 13:15 lunch.
    const result = removeSectionEntry(note, MEALS_HEADING, 0);

    expect(result).not.toContain('Eggs and avocado');
    expect(result).toContain('### 13:15 — White rice, chicken');
    expect(result).toContain('### 07:30 — Strength, 60 min, intensity 4');
    expect(result).toContain(MEALS_HEADING);
  });

  it('leaves an empty section heading when the last entry is removed', () => {
    const note = insertExercise(createDailyNote(NOTE_DATE), STRENGTH);
    const result = removeSectionEntry(note, EXERCISE_HEADING, 0);

    expect(result).toContain(EXERCISE_HEADING);
    expect(result).not.toContain('Strength');
  });

  it('returns the note unchanged for an out-of-range index', () => {
    const note = noteWithEntries();
    expect(removeSectionEntry(note, MEALS_HEADING, 9)).toBe(note);
  });
});

describe('parseMealDetails', () => {
  it('reads a meal back, stripping the logged-late marker from its notes', () => {
    const note = insertMeal(createDailyNote(NOTE_DATE), {
      time: '13:15',
      description: 'White rice, chicken',
      notes: 'ate slowly',
      loggedLate: true,
    });

    expect(parseMealDetails(note, 0)).toEqual({
      time: '13:15',
      description: 'White rice, chicken',
      notes: 'ate slowly',
      loggedLate: true,
    });
  });

  it('reads back a photo-only meal logged with no description', () => {
    const note = insertMeal(createDailyNote(NOTE_DATE), {
      time: '12:30',
      description: '',
      photoPath: 'Attachments/2026-05-26-1230-meal.jpg',
    });

    expect(parseMealDetails(note, 0)).toEqual({
      time: '12:30',
      description: '',
      loggedLate: false,
      photoPath: 'Attachments/2026-05-26-1230-meal.jpg',
    });
  });

  it('returns null for an out-of-range index', () => {
    expect(parseMealDetails(createDailyNote(NOTE_DATE), 0)).toBeNull();
  });
});

describe('parseExerciseDetails', () => {
  it('parses the heading text back into structured fields', () => {
    const note = insertExercise(createDailyNote(NOTE_DATE), STRENGTH);

    expect(parseExerciseDetails(note, 0)).toEqual({
      time: '07:30',
      type: 'strength',
      durationMin: 60,
      intensity: 4,
      notes: 'upper body',
      loggedLate: false,
    });
  });
});

describe('parseDailyEntries index', () => {
  it('tags each entry with its position within its own section', () => {
    const entries = parseDailyEntries(noteWithEntries());

    expect(entries).toEqual([
      { kind: 'exercise', time: '07:30', description: 'Strength, 60 min, intensity 4', index: 0 },
      { kind: 'meal', time: '08:00', description: 'Eggs and avocado', index: 0 },
      { kind: 'meal', time: '13:15', description: 'White rice, chicken', index: 1 },
    ]);
  });
});
