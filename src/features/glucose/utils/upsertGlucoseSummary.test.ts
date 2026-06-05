import { describe, expect, it } from 'vitest';

import { createDailyNote } from '@/features/dailyNote/utils/createDailyNote';
import { insertExercise } from '@/features/dailyNote/utils/insertExercise';
import { insertMeal } from '@/features/dailyNote/utils/insertMeal';

import { parseSummarySource } from './parseSummarySource';
import { renderGlucoseSummary } from './renderGlucoseSummary';
import { upsertGlucoseSummary } from './upsertGlucoseSummary';

import type { GlucoseSummary } from '../glucose.types';

const NOTE_DATE = '2026-05-26';

const SUMMARY: GlucoseSummary = {
  baselineMmol: 5.1,
  peakMmol: 6.2,
  timeToPeakMin: 40,
  returnedToBaselineMin: 70,
  aucMmolMin: 55,
  quality: 'clean',
  source: 'lingo-csv',
  reachedCeiling: false,
};

const noteWithMealAndExercise = (): string =>
  insertExercise(
    insertMeal(createDailyNote(NOTE_DATE), { time: '13:15', description: 'Rice and chicken' }),
    { time: '07:30', type: 'strength', durationMin: 60, intensity: 4 },
  );

describe('upsertGlucoseSummary', () => {
  it('inserts the summary under the meal, above the Exercise section', () => {
    const result = upsertGlucoseSummary(
      noteWithMealAndExercise(),
      0,
      renderGlucoseSummary(SUMMARY),
    );

    expect(result).toContain('### 13:15 — Rice and chicken');
    expect(result.indexOf('#### Glucose summary')).toBeLessThan(result.indexOf('## Exercise'));
    expect(parseSummarySource(result)).toBe('lingo-csv');
  });

  it('replaces an existing summary instead of duplicating it', () => {
    const once = upsertGlucoseSummary(noteWithMealAndExercise(), 0, renderGlucoseSummary(SUMMARY));
    const twice = upsertGlucoseSummary(
      once,
      0,
      renderGlucoseSummary({ ...SUMMARY, source: 'health-connect' }),
    );

    expect(twice.match(/#### Glucose summary/g)).toHaveLength(1);
    expect(twice).toContain('- Source: health-connect');
  });

  it('returns the note unchanged for an out-of-range meal index', () => {
    const note = noteWithMealAndExercise();
    expect(upsertGlucoseSummary(note, 5, renderGlucoseSummary(SUMMARY))).toBe(note);
  });
});

describe('parseSummarySource', () => {
  it('returns null for a meal block with no summary', () => {
    expect(parseSummarySource('### 13:15 — Rice and chicken\nNotes: ate slowly')).toBeNull();
  });

  it('treats a summary without a Source line as the lowest precedence', () => {
    const legacy =
      '### 13:15 — Rice\n\n#### Glucose summary\n- Baseline: 5.1 mmol/L\n- Quality: clean';
    expect(parseSummarySource(legacy)).toBe('health-connect');
  });
});
