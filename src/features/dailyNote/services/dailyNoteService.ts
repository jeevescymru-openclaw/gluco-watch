import { VaultPermissionError } from '@/features/vault/services/vaultService';

import {
  ATTACHMENTS_SUBFOLDER,
  DAILY_SUBFOLDER,
  EXERCISE_HEADING,
  MARKDOWN_MIME_TYPE,
  MEALS_HEADING,
  PHOTO_MIME_TYPE,
} from '../constants';
import { createDailyNote } from '../utils/createDailyNote';
import { insertExercise } from '../utils/insertExercise';
import { insertMeal } from '../utils/insertMeal';
import {
  dailyNoteBaseName,
  dailyNoteFileName,
  dailyNoteTempBaseName,
  dailyNoteTempFileName,
} from '../utils/noteFiles';
import { parseDailyEntries } from '../utils/parseEntries';
import { parseExerciseDetails, parseMealDetails } from '../utils/parseEntryDetails';
import { parseMeals } from '../utils/parseMeals';
import { parseMorning } from '../utils/parseMorning';
import { attachmentRelativePath, photoFileBaseName } from '../utils/photo';
import { removeSectionEntry } from '../utils/removeEntry';
import { setMorning } from '../utils/setMorning';

import type {
  DailyEntry,
  DailyEntryKind,
  ExerciseDetails,
  ExerciseEntry,
  MealDetails,
  MealEntry,
  MorningEntry,
  ParsedMeal,
} from '../dailyNote.types';
import type { SafBackend, SafChild } from '@/features/vault/services/safBackend.types';

export interface DailyNoteService {
  logMeal(experimentFolderUri: string, noteDate: string, meal: MealEntry): Promise<void>;
  logExercise(
    experimentFolderUri: string,
    noteDate: string,
    exercise: ExerciseEntry,
  ): Promise<void>;
  readMeals(experimentFolderUri: string, noteDate: string): Promise<readonly ParsedMeal[]>;
  readEntries(experimentFolderUri: string, noteDate: string): Promise<readonly DailyEntry[]>;
  readMealDetails(
    experimentFolderUri: string,
    noteDate: string,
    index: number,
  ): Promise<MealDetails | null>;
  readExerciseDetails(
    experimentFolderUri: string,
    noteDate: string,
    index: number,
  ): Promise<ExerciseDetails | null>;
  updateMeal(
    experimentFolderUri: string,
    originalDate: string,
    index: number,
    newDate: string,
    meal: MealEntry,
  ): Promise<void>;
  updateExercise(
    experimentFolderUri: string,
    originalDate: string,
    index: number,
    newDate: string,
    exercise: ExerciseEntry,
  ): Promise<void>;
  deleteEntry(
    experimentFolderUri: string,
    noteDate: string,
    kind: DailyEntryKind,
    index: number,
  ): Promise<void>;
  saveMorning(experimentFolderUri: string, noteDate: string, morning: MorningEntry): Promise<void>;
  readMorning(experimentFolderUri: string, noteDate: string): Promise<MorningEntry | null>;
  /** Copies a captured photo into `Attachments/` and returns its vault-relative embed path. */
  saveMealPhoto(
    experimentFolderUri: string,
    dateTime: Date,
    localPhotoUri: string,
  ): Promise<string>;
}

const SECTION_HEADINGS: Record<DailyEntryKind, string> = {
  meal: MEALS_HEADING,
  exercise: EXERCISE_HEADING,
};

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

  const resolveSubfolder = async (experimentFolderUri: string, name: string): Promise<string> => {
    const children = await backend.listChildren(experimentFolderUri);
    const existing = findChild(children, name);
    return existing ? existing.uri : backend.makeDirectory(experimentFolderUri, name);
  };

  const resolveDailyFolder = (experimentFolderUri: string): Promise<string> =>
    resolveSubfolder(experimentFolderUri, DAILY_SUBFOLDER);

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

  // SAF overwrites do not truncate — writing a shorter payload over an existing file
  // leaves the old tail bytes behind (so a deletion appears not to take). Every write
  // therefore goes to a freshly created (empty) file, deleting any prior one first, so
  // the file contents are exactly what we wrote.
  const writeFreshFile = async (
    dailyFolderUri: string,
    baseName: string,
    fileName: string,
    content: string,
  ): Promise<string> => {
    const existing = findChild(await backend.listChildren(dailyFolderUri), fileName);
    if (existing) {
      await backend.deleteFile(existing.uri);
    }
    const uri = await backend.createFile(dailyFolderUri, baseName, MARKDOWN_MIME_TYPE);
    await backend.writeText(uri, content);
    return uri;
  };

  const writeNoteAtomically = async (
    dailyFolderUri: string,
    noteDate: string,
    content: string,
  ): Promise<void> => {
    const tempUri = await writeFreshFile(
      dailyFolderUri,
      dailyNoteTempBaseName(noteDate),
      dailyNoteTempFileName(noteDate),
      content,
    );

    const verified = await backend.readText(tempUri);
    if (verified !== content) {
      throw new Error('Daily note temp file failed verification before commit.');
    }

    await writeFreshFile(
      dailyFolderUri,
      dailyNoteBaseName(noteDate),
      dailyNoteFileName(noteDate),
      content,
    );

    await backend.deleteFile(tempUri);
  };

  const logMeal = (experimentFolderUri: string, noteDate: string, meal: MealEntry): Promise<void> =>
    guard(async () => {
      const dailyFolderUri = await resolveDailyFolder(experimentFolderUri);
      const existing = await readOrRecoverNote(dailyFolderUri, noteDate);
      const updated = insertMeal(existing ?? createDailyNote(noteDate), meal);
      await writeNoteAtomically(dailyFolderUri, noteDate, updated);
    });

  const logExercise = (
    experimentFolderUri: string,
    noteDate: string,
    exercise: ExerciseEntry,
  ): Promise<void> =>
    guard(async () => {
      const dailyFolderUri = await resolveDailyFolder(experimentFolderUri);
      const existing = await readOrRecoverNote(dailyFolderUri, noteDate);
      const updated = insertExercise(existing ?? createDailyNote(noteDate), exercise);
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

  const readEntries = (
    experimentFolderUri: string,
    noteDate: string,
  ): Promise<readonly DailyEntry[]> =>
    guard(async () => {
      const dailyFolderUri = await resolveDailyFolder(experimentFolderUri);
      const content = await readOrRecoverNote(dailyFolderUri, noteDate);
      return content ? parseDailyEntries(content) : [];
    });

  const readMealDetails = (
    experimentFolderUri: string,
    noteDate: string,
    index: number,
  ): Promise<MealDetails | null> =>
    guard(async () => {
      const dailyFolderUri = await resolveDailyFolder(experimentFolderUri);
      const content = await readOrRecoverNote(dailyFolderUri, noteDate);
      return content ? parseMealDetails(content, index) : null;
    });

  const readExerciseDetails = (
    experimentFolderUri: string,
    noteDate: string,
    index: number,
  ): Promise<ExerciseDetails | null> =>
    guard(async () => {
      const dailyFolderUri = await resolveDailyFolder(experimentFolderUri);
      const content = await readOrRecoverNote(dailyFolderUri, noteDate);
      return content ? parseExerciseDetails(content, index) : null;
    });

  // Updating is remove-then-insert: dropping the old block and re-inserting the edited
  // one re-sorts it by its new time, and lets an edited date move the entry to another
  // day's note. Same-day edits stay a single atomic write.
  const moveEntry = async (
    dailyFolderUri: string,
    originalDate: string,
    heading: string,
    index: number,
    newDate: string,
    insertInto: (content: string) => string,
  ): Promise<void> => {
    const originalContent = await readOrRecoverNote(dailyFolderUri, originalDate);
    const withoutEntry =
      originalContent !== null ? removeSectionEntry(originalContent, heading, index) : null;

    if (originalDate === newDate) {
      await writeNoteAtomically(
        dailyFolderUri,
        newDate,
        insertInto(withoutEntry ?? createDailyNote(newDate)),
      );
      return;
    }

    if (withoutEntry !== null) {
      await writeNoteAtomically(dailyFolderUri, originalDate, withoutEntry);
    }
    const targetExisting = await readOrRecoverNote(dailyFolderUri, newDate);
    await writeNoteAtomically(
      dailyFolderUri,
      newDate,
      insertInto(targetExisting ?? createDailyNote(newDate)),
    );
  };

  const updateMeal = (
    experimentFolderUri: string,
    originalDate: string,
    index: number,
    newDate: string,
    meal: MealEntry,
  ): Promise<void> =>
    guard(async () => {
      const dailyFolderUri = await resolveDailyFolder(experimentFolderUri);
      await moveEntry(dailyFolderUri, originalDate, MEALS_HEADING, index, newDate, (content) =>
        insertMeal(content, meal),
      );
    });

  const updateExercise = (
    experimentFolderUri: string,
    originalDate: string,
    index: number,
    newDate: string,
    exercise: ExerciseEntry,
  ): Promise<void> =>
    guard(async () => {
      const dailyFolderUri = await resolveDailyFolder(experimentFolderUri);
      await moveEntry(dailyFolderUri, originalDate, EXERCISE_HEADING, index, newDate, (content) =>
        insertExercise(content, exercise),
      );
    });

  const deleteEntry = (
    experimentFolderUri: string,
    noteDate: string,
    kind: DailyEntryKind,
    index: number,
  ): Promise<void> =>
    guard(async () => {
      const dailyFolderUri = await resolveDailyFolder(experimentFolderUri);
      const content = await readOrRecoverNote(dailyFolderUri, noteDate);
      if (content === null) {
        return;
      }
      await writeNoteAtomically(
        dailyFolderUri,
        noteDate,
        removeSectionEntry(content, SECTION_HEADINGS[kind], index),
      );
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

  const saveMealPhoto = (
    experimentFolderUri: string,
    dateTime: Date,
    localPhotoUri: string,
  ): Promise<string> =>
    guard(async () => {
      const attachmentsUri = await resolveSubfolder(experimentFolderUri, ATTACHMENTS_SUBFOLDER);
      const child = await backend.copyLocalFile(
        attachmentsUri,
        photoFileBaseName(dateTime),
        PHOTO_MIME_TYPE,
        localPhotoUri,
      );
      return attachmentRelativePath(child.name);
    });

  return {
    logMeal,
    logExercise,
    readMeals,
    readEntries,
    readMealDetails,
    readExerciseDetails,
    updateMeal,
    updateExercise,
    deleteEntry,
    saveMorning,
    readMorning,
    saveMealPhoto,
  };
};
