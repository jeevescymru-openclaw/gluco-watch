import { SOURCE_PRECEDENCE } from '../constants';

import type { GlucoseSourceId, MealClassification } from '../glucose.types';

export interface ClassifyInput {
  /** The source of the summary already under the meal, or null if it has none. */
  readonly existingSource: GlucoseSourceId | null;
  readonly incomingSource: GlucoseSourceId;
  /** True when the meal's 2h window has not fully landed yet, so no block is written. */
  readonly isPending: boolean;
}

/**
 * Decides how an incoming summary relates to what is already under a meal (amendment §6c):
 * a higher- or equal-precedence source replaces; a lower-precedence one is protected
 * (skipped by default). Pending always wins, since a truncated curve is never written.
 */
export const classifyMeal = ({
  existingSource,
  incomingSource,
  isPending,
}: ClassifyInput): MealClassification => {
  if (isPending) {
    return 'pending';
  }
  if (existingSource === null) {
    return 'new';
  }
  return SOURCE_PRECEDENCE[incomingSource] >= SOURCE_PRECEDENCE[existingSource]
    ? 'replace'
    : 'protected';
};
