import { describe, expect, it } from 'vitest';

import { computeSummary } from './computeSummary';

import type { GlucoseSample } from '../glucose.types';

const MEAL_AT = new Date('2026-05-28T12:00:00.000Z');

const sampleAt = (offsetMin: number, mmol: number): GlucoseSample => ({
  time: new Date(MEAL_AT.getTime() + offsetMin * 60_000),
  mmol,
});

const BASELINE = [sampleAt(-15, 5.0), sampleAt(-10, 5.0), sampleAt(-5, 5.0)];

// A clean rise to 7.0 at +45 min, back within baseline+0.3 by +80 min.
const CURVE_POST: readonly [number, number][] = [
  [0, 5.0],
  [5, 5.0],
  [10, 5.2],
  [15, 5.5],
  [20, 5.8],
  [25, 6.1],
  [30, 6.4],
  [35, 6.6],
  [40, 6.8],
  [45, 7.0],
  [50, 6.8],
  [55, 6.6],
  [60, 6.3],
  [65, 6.0],
  [70, 5.7],
  [75, 5.4],
  [80, 5.2],
  [85, 5.1],
  [90, 5.0],
  [95, 5.0],
  [100, 5.0],
  [105, 5.0],
  [110, 5.0],
  [115, 5.0],
  [120, 5.0],
];

const cleanCurve = (): GlucoseSample[] => [
  ...BASELINE,
  ...CURVE_POST.map(([offset, mmol]) => sampleAt(offset, mmol)),
];

describe('computeSummary', () => {
  it('computes baseline, peak, time-to-peak, return and quality for a clean curve', () => {
    const summary = computeSummary({
      samples: cleanCurve(),
      mealAt: MEAL_AT,
      source: 'lingo-csv',
      priorMealAt: null,
    });

    expect(summary).not.toBeNull();
    expect(summary?.baselineMmol).toBe(5.0);
    expect(summary?.peakMmol).toBe(7.0);
    expect(summary?.timeToPeakMin).toBe(45);
    expect(summary?.returnedToBaselineMin).toBe(80);
    expect(summary?.quality).toBe('clean');
    expect(summary?.source).toBe('lingo-csv');
    expect(summary?.reachedCeiling).toBe(false);
    expect(summary?.aucMmolMin).toBeGreaterThan(75);
    expect(summary?.aucMmolMin).toBeLessThan(90);
  });

  it('integrates AUC trapezoidally above baseline', () => {
    // Triangle peaking at +60 (excess 2.0): two 60-min trapezoids of area 60 each.
    const summary = computeSummary({
      samples: [...BASELINE, sampleAt(0, 5.0), sampleAt(60, 7.0), sampleAt(120, 5.0)],
      mealAt: MEAL_AT,
      source: 'lingo-csv',
      priorMealAt: null,
    });

    expect(summary?.aucMmolMin).toBe(120);
  });

  it('flags missing_data when there is no baseline window', () => {
    const summary = computeSummary({
      samples: CURVE_POST.map(([offset, mmol]) => sampleAt(offset, mmol)),
      mealAt: MEAL_AT,
      source: 'lingo-csv',
      priorMealAt: null,
    });

    expect(summary?.quality).toBe('missing_data');
  });

  it('flags missing_data when the post-meal window is truncated', () => {
    const summary = computeSummary({
      samples: [...BASELINE, sampleAt(0, 5.0), sampleAt(30, 6.0), sampleAt(60, 5.5)],
      mealAt: MEAL_AT,
      source: 'lingo-csv',
      priorMealAt: null,
    });

    expect(summary?.quality).toBe('missing_data');
  });

  it('flags overlapping when a prior meal falls inside the 2h window', () => {
    const summary = computeSummary({
      samples: cleanCurve(),
      mealAt: MEAL_AT,
      source: 'lingo-csv',
      priorMealAt: new Date(MEAL_AT.getTime() - 60 * 60_000),
    });

    expect(summary?.quality).toBe('overlapping');
  });

  it('flags a curve that reaches the Health Connect ceiling', () => {
    const spiked = [
      ...BASELINE,
      sampleAt(0, 5.0),
      sampleAt(45, 11.5),
      sampleAt(90, 6.0),
      sampleAt(120, 5.2),
    ];
    const summary = computeSummary({
      samples: spiked,
      mealAt: MEAL_AT,
      source: 'health-connect',
      priorMealAt: null,
    });

    expect(summary?.reachedCeiling).toBe(true);
  });

  it('returns null when no readings fall in the post-meal window', () => {
    expect(
      computeSummary({
        samples: BASELINE,
        mealAt: MEAL_AT,
        source: 'lingo-csv',
        priorMealAt: null,
      }),
    ).toBeNull();
  });
});
