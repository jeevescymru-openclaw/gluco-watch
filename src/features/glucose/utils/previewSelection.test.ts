import { describe, expect, it } from 'vitest';

import { includedMeals, isMealIncluded, mealKey } from './previewSelection';

import type { GlucosePreviewMeal, MealClassification } from '../glucose.types';

const meal = (classification: MealClassification, mealIndex = 0): GlucosePreviewMeal => ({
  noteDate: '2026-05-26',
  mealIndex,
  mealTime: '13:15',
  description: 'Rice',
  classification,
  summary: {
    baselineMmol: 5,
    peakMmol: 6,
    timeToPeakMin: 40,
    returnedToBaselineMin: 70,
    aucMmolMin: 40,
    quality: 'clean',
    source: 'lingo-csv',
    reachedCeiling: false,
  },
});

describe('previewSelection', () => {
  it('always includes new and replace, never pending', () => {
    expect(isMealIncluded(meal('new'), new Set())).toBe(true);
    expect(isMealIncluded(meal('replace'), new Set())).toBe(true);
    expect(isMealIncluded(meal('pending'), new Set())).toBe(false);
  });

  it('includes a protected meal only when its key is overridden', () => {
    const protectedMeal = meal('protected');
    expect(isMealIncluded(protectedMeal, new Set())).toBe(false);
    expect(isMealIncluded(protectedMeal, new Set([mealKey(protectedMeal)]))).toBe(true);
  });

  it('filters the write set by inclusion', () => {
    const meals = [meal('new', 0), meal('protected', 1), meal('pending', 2)];
    expect(includedMeals(meals, new Set())).toHaveLength(1);
    expect(includedMeals(meals, new Set([mealKey(meal('protected', 1))]))).toHaveLength(2);
  });
});
