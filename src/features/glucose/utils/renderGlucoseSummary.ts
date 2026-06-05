import {
  AUC_UNIT,
  CEILING_NOTE,
  GLUCOSE_SUMMARY_HEADING,
  GLUCOSE_UNIT,
  SOURCE_IDS,
  SUMMARY_LABELS,
  SUMMARY_NOT_RETURNED,
} from '../constants';

import type { GlucoseSummary } from '../glucose.types';

const bullet = (label: string, value: string): string => `- ${label}: ${value}`;

const returnedValue = (minutes: number | null): string =>
  minutes === null ? SUMMARY_NOT_RETURNED : `+${minutes} min`;

/** Renders a computed summary as the `#### Glucose summary` markdown block (plan §3). */
export const renderGlucoseSummary = (summary: GlucoseSummary): string => {
  const lines = [
    GLUCOSE_SUMMARY_HEADING,
    bullet(SUMMARY_LABELS.baseline, `${summary.baselineMmol.toFixed(1)} ${GLUCOSE_UNIT}`),
    bullet(
      SUMMARY_LABELS.peak,
      `${summary.peakMmol.toFixed(1)} ${GLUCOSE_UNIT} at +${summary.timeToPeakMin} min`,
    ),
    bullet(SUMMARY_LABELS.returnedToBaseline, returnedValue(summary.returnedToBaselineMin)),
    bullet(SUMMARY_LABELS.auc, `${summary.aucMmolMin} ${AUC_UNIT}`),
    bullet(SUMMARY_LABELS.quality, summary.quality),
    bullet(SUMMARY_LABELS.source, summary.source),
  ];

  // Only the clamped Health Connect path under-reports at the ceiling; the CSV truth
  // path carries real values, so it is never flagged (amendment §3 ripple).
  if (summary.source === SOURCE_IDS.healthConnect && summary.reachedCeiling) {
    lines.push(bullet(SUMMARY_LABELS.note, CEILING_NOTE));
  }

  return lines.join('\n');
};
