import { describe, expect, it } from 'vitest';

import { classifyMeal } from './classifyMeal';

describe('classifyMeal', () => {
  it('marks a meal with no existing summary as new', () => {
    expect(
      classifyMeal({ existingSource: null, incomingSource: 'lingo-csv', isPending: false }),
    ).toBe('new');
  });

  it('replaces an equal- or lower-precedence existing summary', () => {
    // Health Connect is primary (v2): it replaces a CSV summary and another HC summary.
    expect(
      classifyMeal({
        existingSource: 'lingo-csv',
        incomingSource: 'health-connect',
        isPending: false,
      }),
    ).toBe('replace');
    expect(
      classifyMeal({
        existingSource: 'health-connect',
        incomingSource: 'health-connect',
        isPending: false,
      }),
    ).toBe('replace');
    expect(
      classifyMeal({ existingSource: 'lingo-csv', incomingSource: 'lingo-csv', isPending: false }),
    ).toBe('replace');
  });

  it('protects a higher-precedence Health Connect summary from a CSV backfill', () => {
    expect(
      classifyMeal({
        existingSource: 'health-connect',
        incomingSource: 'lingo-csv',
        isPending: false,
      }),
    ).toBe('protected');
  });

  it('marks a meal whose window has not fully landed as pending', () => {
    expect(
      classifyMeal({
        existingSource: 'lingo-csv',
        incomingSource: 'health-connect',
        isPending: true,
      }),
    ).toBe('pending');
  });
});
