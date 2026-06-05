import { MEALS_HEADING } from '@/features/dailyNote/constants';
import { entryDateTime } from '@/features/dailyNote/utils/dateFormat';
import { parseDailyEntries } from '@/features/dailyNote/utils/parseEntries';
import { sectionBlockTexts } from '@/features/dailyNote/utils/sections';

import { classifyMeal } from './classifyMeal';
import { computeSummary } from './computeSummary';
import { parseSummarySource } from './parseSummarySource';

import type { GlucosePreviewMeal, GlucoseSample, GlucoseSourceId } from '../glucose.types';

export interface NoteContent {
  readonly noteDate: string;
  readonly content: string;
}

export interface BuildPreviewInput {
  readonly notes: readonly NoteContent[];
  readonly samples: readonly GlucoseSample[];
  readonly sourceId: GlucoseSourceId;
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
}: BuildPreviewInput): readonly GlucosePreviewMeal[] => {
  const meals: GlucosePreviewMeal[] = [];

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
          isPending: false,
        }),
        summary,
      });
    }
  }

  return meals;
};
