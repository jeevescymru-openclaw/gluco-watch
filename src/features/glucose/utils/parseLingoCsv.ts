import { parseLingoTimestamp } from './parseLingoTimestamp';

import type { GlucoseSample } from '../glucose.types';

const COLUMN_SEPARATOR = ',';

const parseRow = (row: string): GlucoseSample | null => {
  const separatorIndex = row.indexOf(COLUMN_SEPARATOR);
  if (separatorIndex === -1) {
    return null;
  }
  const time = parseLingoTimestamp(row.slice(0, separatorIndex));
  const mmol = Number(row.slice(separatorIndex + 1).trim());
  if (!time || !Number.isFinite(mmol)) {
    return null;
  }
  return { time, mmol };
};

/**
 * Parses a Lingo glucose export into samples sorted oldest-first. The header row and any
 * malformed lines (including a blank trailing line) are skipped; Lingo writes rows
 * newest-first, so this also reverses them into chronological order.
 */
export const parseLingoCsv = (csv: string): readonly GlucoseSample[] =>
  csv
    .split(/\r?\n/)
    .map(parseRow)
    .filter((sample): sample is GlucoseSample => sample !== null)
    .sort((first, second) => first.time.getTime() - second.time.getTime());
