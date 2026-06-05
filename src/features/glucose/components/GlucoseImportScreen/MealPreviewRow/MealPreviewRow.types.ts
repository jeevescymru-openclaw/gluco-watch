import type { GlucosePreviewMeal } from '../../../glucose.types';

export interface MealPreviewRowProps {
  readonly meal: GlucosePreviewMeal;
  readonly isOverridden: boolean;
  readonly onToggleOverride: () => void;
}
