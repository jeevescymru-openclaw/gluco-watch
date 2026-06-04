import { beforeEach, describe, expect, it } from 'vitest';

import { MARKDOWN_MIME_TYPE } from '../constants';
import { parseMeals } from '../utils/parseMeals';

import { createDailyNoteService } from './dailyNoteService';

import type { ExerciseEntry, MealEntry, MorningEntry } from '../dailyNote.types';
import type { SafBackend, SafChild } from '@/features/vault/services/safBackend.types';

const EXPERIMENT_URI = 'saf://exp';
const NOTE_DATE = '2026-05-26';
const NOTE_NAME = `${NOTE_DATE}.md`;
const TEMP_NAME = `${NOTE_DATE}.tmp.md`;
const MIME_EXTENSIONS: Record<string, string> = { [MARKDOWN_MIME_TYPE]: 'md' };

const RICE: MealEntry = { time: '13:15', description: 'White rice, chicken, broccoli' };
const BREAKFAST: MealEntry = { time: '08:00', description: 'Eggs and avocado' };
const MORNING: MorningEntry = { waistCm: 84.2, bloat: 2, sleep: 4 };
const STRENGTH: ExerciseEntry = { time: '07:30', type: 'strength', durationMin: 60, intensity: 4 };

interface FakeNode {
  uri: string;
  name: string;
  isDirectory: boolean;
  parentUri: string | null;
  contents: string | null;
}

interface FakeBackend {
  backend: SafBackend;
  childNamesOf: (parentUri: string) => string[];
  fileNamed: (parentUri: string, name: string) => FakeNode | undefined;
}

const createFakeBackend = (): FakeBackend => {
  const nodes = new Map<string, FakeNode>();
  nodes.set(EXPERIMENT_URI, {
    uri: EXPERIMENT_URI,
    name: 'exp',
    isDirectory: true,
    parentUri: null,
    contents: null,
  });

  const childrenOf = (parentUri: string): FakeNode[] =>
    [...nodes.values()].filter((node) => node.parentUri === parentUri);

  const uniqueName = (parentUri: string, desired: string): string => {
    const existingNames = new Set(childrenOf(parentUri).map((node) => node.name));
    if (!existingNames.has(desired)) {
      return desired;
    }
    const dot = desired.lastIndexOf('.');
    const stem = dot === -1 ? desired : desired.slice(0, dot);
    const extension = dot === -1 ? '' : desired.slice(dot);
    let counter = 1;
    while (existingNames.has(`${stem} (${counter})${extension}`)) {
      counter += 1;
    }
    return `${stem} (${counter})${extension}`;
  };

  const addNode = (parentUri: string, name: string, isDirectory: boolean): FakeNode => {
    const node: FakeNode = {
      uri: `${parentUri}/${name}`,
      name,
      isDirectory,
      parentUri,
      contents: isDirectory ? null : '',
    };
    nodes.set(node.uri, node);
    return node;
  };

  const requireFile = (fileUri: string): FakeNode => {
    const node = nodes.get(fileUri);
    if (!node) {
      throw new Error(`No such file: ${fileUri}`);
    }
    return node;
  };

  const backend: SafBackend = {
    requestDirectoryAccess: async () => ({ granted: true, uri: EXPERIMENT_URI }),
    listChildren: async (directoryUri): Promise<readonly SafChild[]> =>
      childrenOf(directoryUri).map((node) => ({ uri: node.uri, name: node.name })),
    makeDirectory: async (parentUri, name) =>
      addNode(parentUri, uniqueName(parentUri, name), true).uri,
    createFile: async (parentUri, baseName, mimeType) => {
      const extension = MIME_EXTENSIONS[mimeType];
      const desired = extension ? `${baseName}.${extension}` : baseName;
      return addNode(parentUri, uniqueName(parentUri, desired), false).uri;
    },
    readText: async (fileUri) => requireFile(fileUri).contents ?? '',
    writeText: async (fileUri, contents) => {
      requireFile(fileUri).contents = contents;
    },
    deleteFile: async (fileUri) => {
      nodes.delete(fileUri);
    },
  };

  return {
    backend,
    childNamesOf: (parentUri) => childrenOf(parentUri).map((node) => node.name),
    fileNamed: (parentUri, name) => childrenOf(parentUri).find((node) => node.name === name),
  };
};

describe('createDailyNoteService', () => {
  let fake: FakeBackend;
  let dailyFolderUri: string;

  beforeEach(async () => {
    fake = createFakeBackend();
    dailyFolderUri = await fake.backend.makeDirectory(EXPERIMENT_URI, 'Daily');
  });

  it('creates the daily note on the first meal and leaves no temp behind', async () => {
    const service = createDailyNoteService(fake.backend);

    await service.logMeal(EXPERIMENT_URI, NOTE_DATE, RICE);

    const note = fake.fileNamed(dailyFolderUri, NOTE_NAME);
    expect(note?.contents).toContain('### 13:15 — White rice, chicken, broccoli');
    expect(fake.childNamesOf(dailyFolderUri)).not.toContain(TEMP_NAME);
  });

  it('reuses the existing Daily folder rather than creating a duplicate', async () => {
    const service = createDailyNoteService(fake.backend);

    await service.logMeal(EXPERIMENT_URI, NOTE_DATE, RICE);

    const dailyFolders = fake.childNamesOf(EXPERIMENT_URI).filter((name) => name === 'Daily');
    expect(dailyFolders).toHaveLength(1);
  });

  it('logging the same day twice appends to one note without duplicating folders or files', async () => {
    const service = createDailyNoteService(fake.backend);

    await service.logMeal(EXPERIMENT_URI, NOTE_DATE, RICE);
    await service.logMeal(EXPERIMENT_URI, NOTE_DATE, BREAKFAST);
    await service.readMeals(EXPERIMENT_URI, NOTE_DATE);

    expect(fake.childNamesOf(EXPERIMENT_URI).filter((name) => name.startsWith('Daily'))).toEqual([
      'Daily',
    ]);
    expect(fake.childNamesOf(dailyFolderUri)).toEqual([NOTE_NAME]);

    const note = fake.fileNamed(dailyFolderUri, NOTE_NAME);
    expect(parseMeals(note?.contents ?? '')).toEqual([
      { time: '08:00', description: BREAKFAST.description },
      { time: '13:15', description: RICE.description },
    ]);
  });

  it('reads back the logged meals', async () => {
    const service = createDailyNoteService(fake.backend);
    await service.logMeal(EXPERIMENT_URI, NOTE_DATE, RICE);

    const meals = await service.readMeals(EXPERIMENT_URI, NOTE_DATE);

    expect(meals).toEqual([{ time: '13:15', description: RICE.description }]);
  });

  it('returns no meals when the note does not exist yet', async () => {
    const service = createDailyNoteService(fake.backend);

    const meals = await service.readMeals(EXPERIMENT_URI, NOTE_DATE);

    expect(meals).toEqual([]);
  });

  describe('exercise and the merged feed', () => {
    it('logs an exercise session into one note alongside a meal', async () => {
      const service = createDailyNoteService(fake.backend);

      await service.logMeal(EXPERIMENT_URI, NOTE_DATE, RICE);
      await service.logExercise(EXPERIMENT_URI, NOTE_DATE, STRENGTH);

      expect(fake.childNamesOf(dailyFolderUri)).toEqual([NOTE_NAME]);
      const note = fake.fileNamed(dailyFolderUri, NOTE_NAME)?.contents ?? '';
      expect(note).toContain('### 07:30 — Strength, 60 min, intensity 4');
      expect(note).toContain('### 13:15 — White rice, chicken, broccoli');
    });

    it('reads meals and exercise back as one chronological feed', async () => {
      const service = createDailyNoteService(fake.backend);

      await service.logMeal(EXPERIMENT_URI, NOTE_DATE, RICE);
      await service.logExercise(EXPERIMENT_URI, NOTE_DATE, STRENGTH);

      expect(await service.readEntries(EXPERIMENT_URI, NOTE_DATE)).toEqual([
        { kind: 'exercise', time: '07:30', description: 'Strength, 60 min, intensity 4' },
        { kind: 'meal', time: '13:15', description: RICE.description },
      ]);
    });

    it('returns an empty feed when the note does not exist yet', async () => {
      const service = createDailyNoteService(fake.backend);

      expect(await service.readEntries(EXPERIMENT_URI, NOTE_DATE)).toEqual([]);
    });
  });

  describe('morning entry', () => {
    it('saves a morning entry, creating the note, and reads it back', async () => {
      const service = createDailyNoteService(fake.backend);

      await service.saveMorning(EXPERIMENT_URI, NOTE_DATE, MORNING);

      expect(await service.readMorning(EXPERIMENT_URI, NOTE_DATE)).toEqual(MORNING);
      expect(fake.childNamesOf(dailyFolderUri)).not.toContain(TEMP_NAME);
    });

    it('returns null when no morning has been logged yet', async () => {
      const service = createDailyNoteService(fake.backend);
      await service.logMeal(EXPERIMENT_URI, NOTE_DATE, RICE);

      expect(await service.readMorning(EXPERIMENT_URI, NOTE_DATE)).toBeNull();
    });

    it('keeps logged meals intact when the morning entry is saved afterwards', async () => {
      const service = createDailyNoteService(fake.backend);

      await service.logMeal(EXPERIMENT_URI, NOTE_DATE, RICE);
      await service.saveMorning(EXPERIMENT_URI, NOTE_DATE, MORNING);

      expect(await service.readMorning(EXPERIMENT_URI, NOTE_DATE)).toEqual(MORNING);
      expect(await service.readMeals(EXPERIMENT_URI, NOTE_DATE)).toEqual([
        { time: '13:15', description: RICE.description },
      ]);
    });
  });

  describe('crash recovery', () => {
    it('restores the note from a leftover temp when the note is missing', async () => {
      const recoveredMarkdown =
        '---\ndate: 2026-05-26\nmorning: null\n---\n\n# 2026-05-26\n\n## Meals\n\n### 09:00 — Recovered meal\n';
      await fake.backend.createFile(dailyFolderUri, `${NOTE_DATE}.tmp`, MARKDOWN_MIME_TYPE);
      await fake.backend.writeText(`${dailyFolderUri}/${TEMP_NAME}`, recoveredMarkdown);
      const service = createDailyNoteService(fake.backend);

      const meals = await service.readMeals(EXPERIMENT_URI, NOTE_DATE);

      expect(meals).toEqual([{ time: '09:00', description: 'Recovered meal' }]);
      expect(fake.fileNamed(dailyFolderUri, NOTE_NAME)?.contents).toBe(recoveredMarkdown);
      expect(fake.childNamesOf(dailyFolderUri)).not.toContain(TEMP_NAME);
    });

    it('keeps an intact note and discards a stale temp', async () => {
      const service = createDailyNoteService(fake.backend);
      await service.logMeal(EXPERIMENT_URI, NOTE_DATE, RICE);
      const goodNote = fake.fileNamed(dailyFolderUri, NOTE_NAME)?.contents ?? '';
      await fake.backend.createFile(dailyFolderUri, `${NOTE_DATE}.tmp`, MARKDOWN_MIME_TYPE);
      await fake.backend.writeText(`${dailyFolderUri}/${TEMP_NAME}`, 'partial gar');

      const meals = await service.readMeals(EXPERIMENT_URI, NOTE_DATE);

      expect(meals).toEqual([{ time: '13:15', description: RICE.description }]);
      expect(fake.fileNamed(dailyFolderUri, NOTE_NAME)?.contents).toBe(goodNote);
      expect(fake.childNamesOf(dailyFolderUri)).not.toContain(TEMP_NAME);
    });
  });
});
