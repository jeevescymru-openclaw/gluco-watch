import { VaultPermissionError } from '@/features/vault/services/vaultService';

import { DAILY_SUBFOLDER, MARKDOWN_MIME_TYPE } from '../constants';
import { createDailyNote } from '../utils/createDailyNote';
import { insertMeal } from '../utils/insertMeal';
import {
  dailyNoteBaseName,
  dailyNoteFileName,
  dailyNoteTempBaseName,
  dailyNoteTempFileName,
} from '../utils/noteFiles';
import { parseMeals } from '../utils/parseMeals';
import { parseMorning } from '../utils/parseMorning';
import { setMorning } from '../utils/setMorning';

import type { MealEntry, MorningEntry, ParsedMeal } from '../dailyNote.types';
import type { SafBackend, SafChild } from '@/features/vault/services/safBackend.types';

export interface DailyNoteService {
  logMeal(experimentFolderUri: string, noteDate: string, meal: MealEntry): Promise<void>;
  readMeals(experimentFolderUri: string, noteDate: string): Promise<readonly ParsedMeal[]>;
  saveMorning(experimentFolderUri: string, noteDate: string, morning: MorningEntry): Promise<void>;
  readMorning(experimentFolderUri: string, noteDate: string): Promise<MorningEntry | null>;
}

const findChild = (children: readonly SafChild[], name: string): SafChild | undefined =>
  children.find((child) => child.name === name);

export const createDailyNoteService = (backend: SafBackend): DailyNoteService => {
  const guard = async <TResult>(operation: () => Promise<TResult>): Promise<TResult> => {
    try {
      return await operation();
    } catch (error) {
      throw new VaultPermissionError('Lost access to the vault folder. Please pick it again.', {
        cause: error,
      });
    }
  };

  const resolveDailyFolder = async (experimentFolderUri: string): Promise<string> => {
    const children = await backend.listChildren(experimentFolderUri);
    const daily = findChild(children, DAILY_SUBFOLDER);
    return daily ? daily.uri : backend.makeDirectory(experimentFolderUri, DAILY_SUBFOLDER);
  };

  const restoreFromTemp = async (
    dailyFolderUri: string,
    noteDate: string,
    temp: SafChild,
    note: SafChild | undefined,
  ): Promise<string> => {
    const noteContent = note ? await backend.readText(note.uri) : null;

    // The note was never touched (crash before the overwrite) — keep it and drop
    // the stale temp. Only restore from temp when the note is missing or empty,
    // so a partial temp can never clobber an intact note.
    if (noteContent !== null && noteContent.trim().length > 0) {
      await backend.deleteFile(temp.uri);
      return noteContent;
    }

    const recovered = await backend.readText(temp.uri);
    const noteUri =
      note?.uri ??
      (await backend.createFile(dailyFolderUri, dailyNoteBaseName(noteDate), MARKDOWN_MIME_TYPE));
    await backend.writeText(noteUri, recovered);
    await backend.deleteFile(temp.uri);
    return recovered;
  };

  const readOrRecoverNote = async (
    dailyFolderUri: string,
    noteDate: string,
  ): Promise<string | null> => {
    const children = await backend.listChildren(dailyFolderUri);
    const note = findChild(children, dailyNoteFileName(noteDate));
    const temp = findChild(children, dailyNoteTempFileName(noteDate));

    if (temp) {
      return restoreFromTemp(dailyFolderUri, noteDate, temp, note);
    }
    return note ? backend.readText(note.uri) : null;
  };

  const writeNoteAtomically = async (
    dailyFolderUri: string,
    noteDate: string,
    content: string,
  ): Promise<void> => {
    const children = await backend.listChildren(dailyFolderUri);

    const existingTemp = findChild(children, dailyNoteTempFileName(noteDate));
    const tempUri =
      existingTemp?.uri ??
      (await backend.createFile(
        dailyFolderUri,
        dailyNoteTempBaseName(noteDate),
        MARKDOWN_MIME_TYPE,
      ));
    await backend.writeText(tempUri, content);

    const verified = await backend.readText(tempUri);
    if (verified !== content) {
      throw new Error('Daily note temp file failed verification before commit.');
    }

    const existingNote = findChild(children, dailyNoteFileName(noteDate));
    const noteUri =
      existingNote?.uri ??
      (await backend.createFile(dailyFolderUri, dailyNoteBaseName(noteDate), MARKDOWN_MIME_TYPE));
    await backend.writeText(noteUri, content);

    await backend.deleteFile(tempUri);
  };

  const logMeal = (experimentFolderUri: string, noteDate: string, meal: MealEntry): Promise<void> =>
    guard(async () => {
      const dailyFolderUri = await resolveDailyFolder(experimentFolderUri);
      const existing = await readOrRecoverNote(dailyFolderUri, noteDate);
      const updated = insertMeal(existing ?? createDailyNote(noteDate), meal);
      await writeNoteAtomically(dailyFolderUri, noteDate, updated);
    });

  const readMeals = (
    experimentFolderUri: string,
    noteDate: string,
  ): Promise<readonly ParsedMeal[]> =>
    guard(async () => {
      const dailyFolderUri = await resolveDailyFolder(experimentFolderUri);
      const content = await readOrRecoverNote(dailyFolderUri, noteDate);
      return content ? parseMeals(content) : [];
    });

  const saveMorning = (
    experimentFolderUri: string,
    noteDate: string,
    morning: MorningEntry,
  ): Promise<void> =>
    guard(async () => {
      const dailyFolderUri = await resolveDailyFolder(experimentFolderUri);
      const existing = await readOrRecoverNote(dailyFolderUri, noteDate);
      const updated = setMorning(existing ?? createDailyNote(noteDate), morning);
      await writeNoteAtomically(dailyFolderUri, noteDate, updated);
    });

  const readMorning = (
    experimentFolderUri: string,
    noteDate: string,
  ): Promise<MorningEntry | null> =>
    guard(async () => {
      const dailyFolderUri = await resolveDailyFolder(experimentFolderUri);
      const content = await readOrRecoverNote(dailyFolderUri, noteDate);
      return content ? parseMorning(content) : null;
    });

  return { logMeal, readMeals, saveMorning, readMorning };
};
