import { describe, expect, it } from 'vitest';

import { renderGlucoseSummary } from './renderGlucoseSummary';

import type { GlucoseSummary } from '../glucose.types';

const BASE: GlucoseSummary = {
  baselineMmol: 5.2,
  peakMmol: 7.1,
  timeToPeakMin: 45,
  returnedToBaselineMin: 105,
  aucMmolMin: 142,
  quality: 'clean',
  source: 'lingo-csv',
  reachedCeiling: false,
};

describe('renderGlucoseSummary', () => {
  it('renders the block in the storage-model format', () => {
    expect(renderGlucoseSummary(BASE)).toBe(
      [
        '#### Glucose summary',
        '- Baseline: 5.2 mmol/L',
        '- Peak: 7.1 mmol/L at +45 min',
        '- Returned to baseline: +105 min',
        '- AUC (2h above baseline): 142 mmol/L·min',
        '- Quality: clean',
        '- Source: lingo-csv',
      ].join('\n'),
    );
  });

  it('shows "not within 2h" when the curve never returned to baseline', () => {
    expect(renderGlucoseSummary({ ...BASE, returnedToBaselineMin: null })).toContain(
      '- Returned to baseline: not within 2h',
    );
  });

  it('adds the ceiling note for a clamped Health Connect curve', () => {
    const block = renderGlucoseSummary({
      ...BASE,
      source: 'health-connect',
      peakMmol: 11.1,
      reachedCeiling: true,
    });

    expect(block).toContain('- Source: health-connect');
    expect(block).toContain('Health Connect ceiling');
  });

  it('never flags the CSV truth path even if it reached the ceiling value', () => {
    expect(renderGlucoseSummary({ ...BASE, peakMmol: 11.1, reachedCeiling: true })).not.toContain(
      'ceiling',
    );
  });
});
