import { MEALS_HEADING } from '@/features/dailyNote/constants';
import { entryDateTime } from '@/features/dailyNote/utils/dateFormat';
import { parseDailyEntries } from '@/features/dailyNote/utils/parseEntries';
import { sectionBlockTexts } from '@/features/dailyNote/utils/sections';

import { POST_MEAL_WINDOW_MIN } from '../constants';
import { classifyMeal } from './classifyMeal';
import { computeSummary } from './computeSummary';
import { parseSummarySource } from './parseSummarySource';

import type { GlucosePreviewMeal, GlucoseSample, GlucoseSourceId } from '../glucose.types';

const MS_PER_MINUTE = 60_000;

export interface NoteContent {
  readonly noteDate: string;
  readonly content: string;
}

export interface BuildPreviewInput {
  readonly notes: readonly NoteContent[];
  readonly samples: readonly GlucoseSample[];
  readonly sourceId: GlucoseSourceId;
  /**
   * The latest instant glucose data is known to cover. A meal whose 2h window extends past
   * it is **pending** — too recent to summarise (Health Connect's ~3h delay). Null disables
   * pending (the CSV is a settled historical dump, so a short window is missing_data instead).
   */
  readonly pendingAfter?: Date | null;
}

/**
 * Matches glucose samples to every logged meal across the given notes, computing a summary
 * and an apply classification for each. Meals with no readings in their post-meal window
 * are dropped (they simply have no curve). Pure: the service supplies the note contents.
 */
export const buildImportPreview = ({
  notes,
  samples,
  sourceId,
  pendingAfter = null,
}: BuildPreviewInput): readonly GlucosePreviewMeal[] => {
  const meals: GlucosePreviewMeal[] = [];

  const isPendingAt = (mealAt: Date): boolean =>
    pendingAfter !== null &&
    mealAt.getTime() + POST_MEAL_WINDOW_MIN * MS_PER_MINUTE > pendingAfter.getTime();

  for (const note of notes) {
    const mealEntries = parseDailyEntries(note.content).filter((entry) => entry.kind === 'meal');
    const blocks = sectionBlockTexts(note.content, MEALS_HEADING);
    let priorMealAt: Date | null = null;

    for (const entry of mealEntries) {
      const mealAt = entryDateTime(note.noteDate, entry.time);
      const summary = computeSummary({ samples, mealAt, source: sourceId, priorMealAt });
      priorMealAt = mealAt;

      if (!summary) {
        continue;
      }
      meals.push({
        noteDate: note.noteDate,
        mealIndex: entry.index,
        mealTime: entry.time,
        description: entry.description,
        classification: classifyMeal({
          existingSource: parseSummarySource(blocks[entry.index] ?? ''),
          incomingSource: sourceId,
          isPending: isPendingAt(mealAt),
        }),
        summary,
      });
    }
  }

  return meals;
};
