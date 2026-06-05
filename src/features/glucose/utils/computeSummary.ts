import {
  BASELINE_WINDOW_MIN,
  HEALTH_CONNECT_CEILING_MMOL,
  MAX_READING_GAP_MIN,
  MIN_POST_WINDOW_COVERAGE_MIN,
  POST_MEAL_WINDOW_MIN,
  RETURN_TO_BASELINE_THRESHOLD_MMOL,
} from '../constants';

import type {
  GlucoseQuality,
  GlucoseSample,
  GlucoseSourceId,
  GlucoseSummary,
} from '../glucose.types';

export interface SummaryInput {
  readonly samples: readonly GlucoseSample[];
  readonly mealAt: Date;
  readonly source: GlucoseSourceId;
  /** The previous meal's time, used to flag an overlapping (uncleared) prior curve. */
  readonly priorMealAt: Date | null;
}

const MS_PER_MINUTE = 60_000;

const round1 = (value: number): number => Math.round(value * 10) / 10;

const mean = (values: readonly number[]): number =>
  values.reduce((sum, value) => sum + value, 0) / values.length;

const maxGapMinutes = (offsets: readonly number[]): number => {
  const boundaries = [0, ...offsets];
  let widest = 0;
  for (let index = 1; index < boundaries.length; index += 1) {
    widest = Math.max(widest, boundaries[index] - boundaries[index - 1]);
  }
  return widest;
};

const trapezoidalArea = (offsets: readonly number[], excesses: readonly number[]): number => {
  let area = 0;
  for (let index = 1; index < offsets.length; index += 1) {
    const width = offsets[index] - offsets[index - 1];
    area += ((excesses[index] + excesses[index - 1]) / 2) * width;
  }
  return area;
};

const classifyQuality = (
  hasBaselineSamples: boolean,
  postOffsets: readonly number[],
  mealAt: Date,
  priorMealAt: Date | null,
): GlucoseQuality => {
  const lastOffset = postOffsets[postOffsets.length - 1];
  if (
    !hasBaselineSamples ||
    maxGapMinutes(postOffsets) > MAX_READING_GAP_MIN ||
    lastOffset < MIN_POST_WINDOW_COVERAGE_MIN
  ) {
    return 'missing_data';
  }
  if (
    priorMealAt !== null &&
    (mealAt.getTime() - priorMealAt.getTime()) / MS_PER_MINUTE < POST_MEAL_WINDOW_MIN
  ) {
    return 'overlapping';
  }
  return 'clean';
};

/**
 * Computes the post-meal glucose response from samples around a meal, or null when no
 * readings fall in the 2h post-meal window (the meal simply has no glucose data to show).
 */
export const computeSummary = ({
  samples,
  mealAt,
  source,
  priorMealAt,
}: SummaryInput): GlucoseSummary | null => {
  const mealMs = mealAt.getTime();
  const offsetOf = (sample: GlucoseSample): number =>
    (sample.time.getTime() - mealMs) / MS_PER_MINUTE;

  const pre = samples.filter((sample) => {
    const offset = offsetOf(sample);
    return offset >= -BASELINE_WINDOW_MIN && offset < 0;
  });
  const post = samples.filter((sample) => {
    const offset = offsetOf(sample);
    return offset >= 0 && offset <= POST_MEAL_WINDOW_MIN;
  });

  if (post.length === 0) {
    return null;
  }

  const baseline = pre.length > 0 ? mean(pre.map((sample) => sample.mmol)) : post[0].mmol;
  const postOffsets = post.map(offsetOf);

  let peakIndex = 0;
  for (let index = 1; index < post.length; index += 1) {
    if (post[index].mmol > post[peakIndex].mmol) {
      peakIndex = index;
    }
  }
  const peakMmol = post[peakIndex].mmol;

  let returnedToBaselineMin: number | null = null;
  for (let index = peakIndex; index < post.length; index += 1) {
    if (post[index].mmol <= baseline + RETURN_TO_BASELINE_THRESHOLD_MMOL) {
      returnedToBaselineMin = Math.round(postOffsets[index]);
      break;
    }
  }

  const excesses = post.map((sample) => Math.max(sample.mmol - baseline, 0));

  return {
    baselineMmol: round1(baseline),
    peakMmol: round1(peakMmol),
    timeToPeakMin: Math.round(postOffsets[peakIndex]),
    returnedToBaselineMin,
    aucMmolMin: Math.round(trapezoidalArea(postOffsets, excesses)),
    quality: classifyQuality(pre.length > 0, postOffsets, mealAt, priorMealAt),
    source,
    reachedCeiling: peakMmol >= HEALTH_CONNECT_CEILING_MMOL,
  };
};
