import type { GlucosePreviewMeal } from '../glucose.types';

export const mealKey = (meal: Pick<GlucosePreviewMeal, 'noteDate' | 'mealIndex'>): string =>
  `${meal.noteDate}#${meal.mealIndex}`;

/**
 * Whether a previewed meal will be written on Confirm: New and Replace always are,
 * Protected only when the user opted in, Pending never (amendment §6c).
 */
export const isMealIncluded = (
  meal: GlucosePreviewMeal,
  overrides: ReadonlySet<string>,
): boolean => {
  if (meal.classification === 'new' || meal.classification === 'replace') {
    return true;
  }
  if (meal.classification === 'protected') {
    return overrides.has(mealKey(meal));
  }
  return false;
};

export const includedMeals = (
  meals: readonly GlucosePreviewMeal[],
  overrides: ReadonlySet<string>,
): readonly GlucosePreviewMeal[] => meals.filter((meal) => isMealIncluded(meal, overrides));
