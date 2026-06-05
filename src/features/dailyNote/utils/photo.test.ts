import { describe, expect, it } from 'vitest';

import { createDailyNote } from './createDailyNote';
import { insertMeal } from './insertMeal';
import { parseMeals } from './parseMeals';
import { parseMealDetails } from './parseEntryDetails';
import { photoFileBaseName } from './photo';

import type { MealEntry } from '../dailyNote.types';

const NOTE_DATE = '2026-05-26';
const PHOTO = 'Attachments/2026-05-26-1315-meal.jpg';

describe('photoFileBaseName', () => {
  it('builds `YYYY-MM-DD-HHMM-meal` from the event datetime', () => {
    const dateTime = new Date(2026, 4, 26, 13, 5);
    expect(photoFileBaseName(dateTime)).toBe('2026-05-26-1305-meal');
  });
});

describe('meal photo embed', () => {
  it('renders the `![[...]]` embed under the heading', () => {
    const meal: MealEntry = { time: '13:15', description: 'White rice', photoPath: PHOTO };
    const result = insertMeal(createDailyNote(NOTE_DATE), meal);

    expect(result).toContain(`### 13:15 — White rice\n![[${PHOTO}]]`);
  });

  it('separates a photo and notes with a blank line, matching the plan format', () => {
    const meal: MealEntry = {
      time: '13:15',
      description: 'White rice',
      notes: 'ate slowly',
      photoPath: PHOTO,
    };
    const result = insertMeal(createDailyNote(NOTE_DATE), meal);

    expect(result).toContain(`### 13:15 — White rice\n![[${PHOTO}]]\n\nNotes: ate slowly`);
  });

  it('still parses the meal heading for the feed when a photo is present', () => {
    const meal: MealEntry = { time: '13:15', description: 'White rice', photoPath: PHOTO };
    const result = insertMeal(createDailyNote(NOTE_DATE), meal);

    expect(parseMeals(result)).toEqual([{ time: '13:15', description: 'White rice' }]);
  });

  it('recovers the photo path when reading a meal back for editing', () => {
    const meal: MealEntry = {
      time: '13:15',
      description: 'White rice',
      notes: 'ate slowly',
      photoPath: PHOTO,
    };
    const result = insertMeal(createDailyNote(NOTE_DATE), meal);

    expect(parseMealDetails(result, 0)).toEqual({
      time: '13:15',
      description: 'White rice',
      notes: 'ate slowly',
      loggedLate: false,
      photoPath: PHOTO,
    });
  });
});
