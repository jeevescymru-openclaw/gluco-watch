import type { ParsedMeal } from '../../dailyNote.types';

export interface MealListProps {
  readonly meals: readonly ParsedMeal[];
}
