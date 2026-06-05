import { COLORS } from '@/theme/colors';

import type { GlucoseSummary, MealClassification } from '../../../glucose.types';

export const BADGE_COLORS: Record<MealClassification, string> = {
  new: COLORS.success,
  replace: COLORS.primary,
  protected: COLORS.error,
  pending: COLORS.textMuted,
};

export const summaryLine = (summary: GlucoseSummary): string => {
  const line = `Peak ${summary.peakMmol.toFixed(1)} · AUC ${summary.aucMmolMin} · ${summary.quality}`;
  return summary.reachedCeiling ? `${line} · ceiling` : line;
};
