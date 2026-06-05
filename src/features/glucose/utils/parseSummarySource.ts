import { GLUCOSE_SUMMARY_HEADING, SOURCE_IDS, SUMMARY_LABELS } from '../constants';

import type { GlucoseSourceId } from '../glucose.types';

const SOURCE_LINE_PATTERN = new RegExp(`^-\\s*${SUMMARY_LABELS.source}:\\s*(\\S+)`);

const KNOWN_SOURCES: readonly GlucoseSourceId[] = [SOURCE_IDS.lingoCsv, SOURCE_IDS.healthConnect];

const isKnownSource = (value: string): value is GlucoseSourceId =>
  (KNOWN_SOURCES as readonly string[]).includes(value);

/**
 * Reads the `Source:` of an existing glucose summary inside a meal block, used to decide
 * import precedence. Returns null when the meal has no summary yet. A summary that predates
 * source stamping (no `Source:` line) is treated as the lowest precedence: `health-connect`.
 */
export const parseSummarySource = (mealBlockText: string): GlucoseSourceId | null => {
  const lines = mealBlockText.split('\n');
  const headingIndex = lines.findIndex((line) => line.trim() === GLUCOSE_SUMMARY_HEADING);
  if (headingIndex === -1) {
    return null;
  }
  for (let index = headingIndex + 1; index < lines.length; index += 1) {
    const match = SOURCE_LINE_PATTERN.exec(lines[index].trim());
    if (match) {
      return isKnownSource(match[1]) ? match[1] : SOURCE_IDS.healthConnect;
    }
  }
  return SOURCE_IDS.healthConnect;
};
