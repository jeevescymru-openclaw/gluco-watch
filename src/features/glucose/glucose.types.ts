/** A single glucose reading at an absolute instant, in mmol/L. */
export interface GlucoseSample {
  readonly time: Date;
  readonly mmol: number;
}

export type GlucoseSourceId = 'lingo-csv' | 'health-connect';

/** A time-series provider of glucose samples. Both CSV and Health Connect implement this. */
export interface GlucoseSource {
  readonly id: GlucoseSourceId;
  readRange(from: Date, to: Date): Promise<readonly GlucoseSample[]>;
}

export type GlucoseQuality = 'clean' | 'overlapping' | 'missing_data';

/** The computed post-meal glucose response, rendered as the `#### Glucose summary` block. */
export interface GlucoseSummary {
  readonly baselineMmol: number;
  readonly peakMmol: number;
  readonly timeToPeakMin: number;
  /** Minutes until the curve returned within the baseline threshold, or null if not within 2h. */
  readonly returnedToBaselineMin: number | null;
  readonly aucMmolMin: number;
  readonly quality: GlucoseQuality;
  readonly source: GlucoseSourceId;
  /** True when the peak reached the Health Connect ceiling, so peak and AUC are under-reported. */
  readonly reachedCeiling: boolean;
}

/**
 * How an incoming summary relates to what is already under a meal, decided by source
 * precedence (amendment §6c). `pending` is a preview-only state, never written.
 */
export type MealClassification = 'new' | 'replace' | 'protected' | 'pending';

/** One meal in the import preview: its computed summary and how it would be applied. */
export interface GlucosePreviewMeal {
  readonly noteDate: string;
  readonly mealIndex: number;
  readonly mealTime: string;
  readonly description: string;
  readonly classification: MealClassification;
  readonly summary: GlucoseSummary;
}

/** The full result of reading a source and matching it to logged meals, shown for confirmation. */
export interface GlucoseImportPlan {
  readonly sourceId: GlucoseSourceId;
  readonly exportFileName: string;
  readonly rangeFrom: string;
  readonly rangeTo: string;
  readonly meals: readonly GlucosePreviewMeal[];
}
