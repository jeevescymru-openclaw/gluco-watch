import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { describe, expect, it } from 'vitest';

import { parseLingoTimestamp } from './parseLingoTimestamp';
import { parseLingoCsv } from './parseLingoCsv';

const SAMPLE_PATH = resolve(__dirname, '../../../../samples/lingo-glucose-data-2026-MAY-28.csv');

describe('parseLingoTimestamp', () => {
  it('parses a Lingo offset timestamp to the correct absolute instant', () => {
    // 19:56 at +01:00 is 18:56 UTC.
    expect(parseLingoTimestamp('2026-05-28T19:56+01:00')?.toISOString()).toBe(
      '2026-05-28T18:56:00.000Z',
    );
  });

  it('applies negative offsets and optional seconds', () => {
    expect(parseLingoTimestamp('2026-05-28T19:56:30-05:00')?.toISOString()).toBe(
      '2026-05-29T00:56:30.000Z',
    );
  });

  it('returns null for a non-timestamp (e.g. the header cell)', () => {
    expect(parseLingoTimestamp('Time of Glucose Reading')).toBeNull();
  });
});

describe('parseLingoCsv', () => {
  it('skips the header and malformed lines, keeping only valid samples', () => {
    const samples = parseLingoCsv(
      [
        'Time of Glucose Reading [...], Measurement(mmol/L)',
        '2026-05-28T19:56+01:00,4.8',
        'garbage row',
        '2026-05-28T19:51+01:00,4.9',
        '',
      ].join('\n'),
    );

    expect(samples).toHaveLength(2);
    expect(samples.every((sample) => Number.isFinite(sample.mmol))).toBe(true);
  });

  it('sorts newest-first export rows into chronological order', () => {
    const samples = parseLingoCsv(
      ['header', '2026-05-28T19:56+01:00,4.8', '2026-05-28T19:51+01:00,4.9'].join('\n'),
    );

    expect(samples[0].time.getTime()).toBeLessThan(samples[1].time.getTime());
    expect(samples[0].mmol).toBe(4.9);
  });

  it('parses the real Lingo export end to end', () => {
    const samples = parseLingoCsv(readFileSync(SAMPLE_PATH, 'utf8'));

    expect(samples).toHaveLength(599);
    expect(samples[0].time.getTime()).toBeLessThan(samples[samples.length - 1].time.getTime());
    const values = samples.map((sample) => sample.mmol);
    expect(Math.min(...values)).toBeGreaterThanOrEqual(4.3);
    expect(Math.max(...values)).toBeLessThanOrEqual(6.6);
  });
});
