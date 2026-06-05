import { LINGO_CSV_HEADER } from '../constants';
import { formatLingoTimestamp } from './formatLingoTimestamp';

import type { GlucoseSample } from '../glucose.types';

/**
 * Serialises Health Connect samples into a Lingo-format CSV (newest-first, like a real
 * export) for the derived `Lingo Exports/YYYY-MM-DD-healthconnect.csv` file (amendment §6d),
 * keeping the vault self-contained and re-derivable.
 */
export const hcSamplesToCsv = (samples: readonly GlucoseSample[]): string => {
  const rows = [...samples]
    .sort((first, second) => second.time.getTime() - first.time.getTime())
    .map((sample) => `${formatLingoTimestamp(sample.time)},${sample.mmol.toFixed(1)}`);
  return [LINGO_CSV_HEADER, ...rows].join('\n');
};
