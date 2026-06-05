import { describe, expect, it } from 'vitest';

import { hcSamplesToCsv } from './hcSamplesToCsv';
import { parseLingoCsv } from './parseLingoCsv';

import type { GlucoseSample } from '../glucose.types';

const SAMPLES: GlucoseSample[] = [
  { time: new Date('2026-06-03T19:00:00.000Z'), mmol: 5.2 },
  { time: new Date('2026-06-03T19:05:00.000Z'), mmol: 5.4 },
  { time: new Date('2026-06-03T19:10:00.000Z'), mmol: 5.1 },
];

describe('hcSamplesToCsv', () => {
  it('writes the Lingo header and newest-first rows', () => {
    const lines = hcSamplesToCsv(SAMPLES).split('\n');

    expect(lines[0]).toContain('Measurement(mmol/L)');
    expect(lines).toHaveLength(4);
    // Newest sample (19:10Z, 5.1) leads; oldest (19:00Z, 5.2) is last.
    expect(lines[1].endsWith(',5.1')).toBe(true);
    expect(lines[3].endsWith(',5.2')).toBe(true);
  });

  it('round-trips back through the parser to the same instants and values', () => {
    const parsed = parseLingoCsv(hcSamplesToCsv(SAMPLES));

    expect(parsed.map((sample) => sample.time.getTime())).toEqual(
      SAMPLES.map((sample) => sample.time.getTime()),
    );
    expect(parsed.map((sample) => sample.mmol)).toEqual([5.2, 5.4, 5.1]);
  });
});
