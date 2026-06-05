import { describe, expect, it } from 'vitest';

import { createDailyNote } from '@/features/dailyNote/utils/createDailyNote';
import { entryDateTime } from '@/features/dailyNote/utils/dateFormat';
import { insertMeal } from '@/features/dailyNote/utils/insertMeal';

import { buildImportPreview } from './buildImportPreview';
import { renderGlucoseSummary } from './renderGlucoseSummary';
import { upsertGlucoseSummary } from './upsertGlucoseSummary';

import type { GlucoseSample, GlucoseSourceId, GlucoseSummary } from '../glucose.types';

const NOTE_DATE = '2026-05-26';

const curveAround = (mealAt: Date): GlucoseSample[] => {
  const samples: GlucoseSample[] = [];
  for (let minute = -15; minute <= 120; minute += 5) {
    const excess = minute < 0 ? 0 : Math.max(0, 2 - Math.abs(minute - 45) / 22.5);
    samples.push({
      time: new Date(mealAt.getTime() + minute * 60_000),
      mmol: Number((5.0 + excess).toFixed(1)),
    });
  }
  return samples;
};

const summaryOf = (source: GlucoseSourceId): GlucoseSummary => ({
  baselineMmol: 5.0,
  peakMmol: 6.0,
  timeToPeakMin: 40,
  returnedToBaselineMin: 70,
  aucMmolMin: 40,
  quality: 'clean',
  source,
  reachedCeiling: false,
});

const noteWithMeal = (existingSource?: GlucoseSourceId): string => {
  const note = insertMeal(createDailyNote(NOTE_DATE), { time: '13:15', description: 'Rice' });
  return existingSource
    ? upsertGlucoseSummary(note, 0, renderGlucoseSummary(summaryOf(existingSource)))
    : note;
};

const samples = curveAround(entryDateTime(NOTE_DATE, '13:15'));

describe('buildImportPreview', () => {
  it('classifies a meal with no existing summary as new and computes its curve', () => {
    const meals = buildImportPreview({
      notes: [{ noteDate: NOTE_DATE, content: noteWithMeal() }],
      samples,
      sourceId: 'lingo-csv',
    });

    expect(meals).toHaveLength(1);
    expect(meals[0].classification).toBe('new');
    expect(meals[0].mealIndex).toBe(0);
    expect(meals[0].summary.quality).toBe('clean');
    expect(meals[0].summary.peakMmol).toBeCloseTo(7.0, 1);
  });

  it('protects a Health Connect summary from a CSV backfill', () => {
    const meals = buildImportPreview({
      notes: [{ noteDate: NOTE_DATE, content: noteWithMeal('health-connect') }],
      samples,
      sourceId: 'lingo-csv',
    });

    expect(meals[0].classification).toBe('protected');
  });

  it('replaces a CSV summary on a Health Connect import', () => {
    const meals = buildImportPreview({
      notes: [{ noteDate: NOTE_DATE, content: noteWithMeal('lingo-csv') }],
      samples,
      sourceId: 'health-connect',
    });

    expect(meals[0].classification).toBe('replace');
  });

  it('marks a meal pending when its window extends past the available data', () => {
    const mealAt = entryDateTime(NOTE_DATE, '13:15');
    const meals = buildImportPreview({
      notes: [{ noteDate: NOTE_DATE, content: noteWithMeal() }],
      samples,
      sourceId: 'health-connect',
      pendingAfter: new Date(mealAt.getTime() + 60 * 60_000),
    });

    expect(meals[0].classification).toBe('pending');
  });

  it('drops a meal that has no readings in its post-meal window', () => {
    const note = insertMeal(createDailyNote(NOTE_DATE), {
      time: '08:00',
      description: 'Breakfast',
    });
    const meals = buildImportPreview({
      notes: [{ noteDate: NOTE_DATE, content: note }],
      samples,
      sourceId: 'lingo-csv',
    });

    expect(meals).toHaveLength(0);
  });
});
