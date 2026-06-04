import { describe, expect, it } from 'vitest';

import { createDailyNote } from './createDailyNote';
import { insertMeal } from './insertMeal';
import { parseMeals } from './parseMeals';

import type { MealEntry } from '../dailyNote.types';

const NOTE_DATE = '2026-05-26';

const RICE: MealEntry = { time: '13:15', description: 'White rice ~80g, chicken, broccoli' };
const SALMON: MealEntry = { time: '19:30', description: 'Salmon, butter, green beans' };
const BREAKFAST: MealEntry = { time: '08:00', description: 'Eggs and avocado' };

const NOTE_WITHOUT_MEALS = `---
date: ${NOTE_DATE}
morning:
  waist_cm: 84.2
  bloat: 2
  sleep: 4
---

# ${NOTE_DATE}
`;

describe('insertMeal — the four cases', () => {
  it('case 1: no daily note yet — creates one with frontmatter, then inserts the meal', () => {
    const created = createDailyNote(NOTE_DATE);
    const result = insertMeal(created, RICE);

    expect(result).toContain(`date: ${NOTE_DATE}`);
    expect(result).toContain('morning: null');
    expect(result).toContain(`# ${NOTE_DATE}`);
    expect(result).toContain('## Meals');
    expect(result).toContain('### 13:15 — White rice ~80g, chicken, broccoli');
    expect(parseMeals(result)).toEqual([{ time: '13:15', description: RICE.description }]);
  });

  it('case 2: note exists without a Meals section — appends the section and the meal', () => {
    const result = insertMeal(NOTE_WITHOUT_MEALS, RICE);

    expect(result).toContain('waist_cm: 84.2');
    expect(result).toContain('## Meals');
    expect(result).toMatch(/## Meals\n\n### 13:15 —/);
    expect(parseMeals(result)).toEqual([{ time: '13:15', description: RICE.description }]);
  });

  it('case 3: note has an empty Meals section — inserts the first meal', () => {
    const empty = createDailyNote(NOTE_DATE);
    expect(parseMeals(empty)).toEqual([]);

    const result = insertMeal(empty, SALMON);
    expect(result).toMatch(/## Meals\n\n### 19:30 —/);
    expect(parseMeals(result)).toEqual([{ time: '19:30', description: SALMON.description }]);
  });

  it('case 4: note has meals — inserts the new one in chronological order', () => {
    const withRice = insertMeal(insertMeal(createDailyNote(NOTE_DATE), RICE), SALMON);

    const result = insertMeal(withRice, BREAKFAST);

    expect(parseMeals(result)).toEqual([
      { time: '08:00', description: BREAKFAST.description },
      { time: '13:15', description: RICE.description },
      { time: '19:30', description: SALMON.description },
    ]);
  });
});

describe('insertMeal — details', () => {
  it('uses the U+2014 em dash separator the Step 6 parser expects', () => {
    const result = insertMeal(createDailyNote(NOTE_DATE), RICE);
    expect(result).toContain('### 13:15 — White rice ~80g, chicken, broccoli');
  });

  it('collapses a multiline description so the heading stays on one line', () => {
    const result = insertMeal(createDailyNote(NOTE_DATE), {
      time: '22:51',
      description: 'Dark chocolate \n1 square',
    });
    expect(result).toContain('### 22:51 — Dark chocolate 1 square\n');
    expect(parseMeals(result)).toEqual([{ time: '22:51', description: 'Dark chocolate 1 square' }]);
  });

  it('renders an optional Notes line directly under the heading', () => {
    const result = insertMeal(createDailyNote(NOTE_DATE), {
      ...RICE,
      notes: 'ate slowly, normal portion.',
    });
    expect(result).toContain(
      '### 13:15 — White rice ~80g, chicken, broccoli\nNotes: ate slowly, normal portion.',
    );
  });

  it('preserves an existing entry verbatim, including its notes', () => {
    const withNoted = insertMeal(createDailyNote(NOTE_DATE), {
      ...SALMON,
      notes: 'standard keto dinner.',
    });
    const result = insertMeal(withNoted, BREAKFAST);
    expect(result).toContain(
      '### 19:30 — Salmon, butter, green beans\nNotes: standard keto dinner.',
    );
  });

  it('ends the file with exactly one trailing newline', () => {
    const result = insertMeal(createDailyNote(NOTE_DATE), RICE);
    expect(result.endsWith('\n')).toBe(true);
    expect(result.endsWith('\n\n')).toBe(false);
  });
});

describe('rendered output (visual check)', () => {
  it('prints the full markdown for each of the four cases', () => {
    const created = createDailyNote(NOTE_DATE);
    const cases: readonly (readonly [string, string])[] = [
      ['CASE 1 — no note yet (created + first meal)', insertMeal(created, RICE)],
      ['CASE 2 — note without ## Meals', insertMeal(NOTE_WITHOUT_MEALS, RICE)],
      ['CASE 3 — empty ## Meals', insertMeal(created, SALMON)],
      [
        'CASE 4 — chronological insert among existing meals',
        insertMeal(insertMeal(insertMeal(created, RICE), SALMON), BREAKFAST),
      ],
    ];

    for (const [label, markdown] of cases) {
      console.log(`\n===== ${label} =====\n${markdown}`);
    }
    expect(cases).toHaveLength(4);
  });
});
