import { VaultPermissionError } from '@/features/vault/services/vaultService';
import { formatNoteDate } from '@/features/dailyNote/utils/dateFormat';

import {
  CSV_FILE_EXTENSION,
  CSV_MIME_TYPE,
  LINGO_EXPORTS_SUBFOLDER,
  SOURCE_IDS,
} from '../constants';
import { buildImportPreview } from '../utils/buildImportPreview';
import { parseLingoCsv } from '../utils/parseLingoCsv';
import { pickCsvFile } from '../utils/pickCsvFile';
import { renderGlucoseSummary } from '../utils/renderGlucoseSummary';
import { upsertGlucoseSummary } from '../utils/upsertGlucoseSummary';

import type { NoteContent } from '../utils/buildImportPreview';
import type { GlucoseImportPlan, GlucosePreviewMeal } from '../glucose.types';
import type { DailyNoteService } from '@/features/dailyNote/services/dailyNoteService';
import type { SafBackend } from '@/features/vault/services/safBackend.types';

export interface GlucoseImportService {
  /** Picks a Lingo CSV, copies it into the vault, and previews the per-meal summaries. */
  previewCsvImport(experimentFolderUri: string): Promise<GlucoseImportPlan | null>;
  /** Writes the chosen summaries into their daily notes. */
  applyImport(experimentFolderUri: string, meals: readonly GlucosePreviewMeal[]): Promise<void>;
}

const exportFileName = (importDate: string): string => `${importDate}.${CSV_FILE_EXTENSION}`;

export const createGlucoseImportService = (
  backend: SafBackend,
  notes: DailyNoteService,
): GlucoseImportService => {
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
    const existing = children.find((child) => child.name === name);
    return existing ? existing.uri : backend.makeDirectory(experimentFolderUri, name);
  };

  // Copies the raw CSV into `Lingo Exports/` so the vault stays self-contained. A fresh
  // file is created each time because SAF overwrites do not truncate.
  const saveExport = async (
    experimentFolderUri: string,
    importDate: string,
    csvText: string,
  ): Promise<void> => {
    const exportsUri = await resolveSubfolder(experimentFolderUri, LINGO_EXPORTS_SUBFOLDER);
    const fileName = exportFileName(importDate);
    const existing = (await backend.listChildren(exportsUri)).find(
      (child) => child.name === fileName,
    );
    if (existing) {
      await backend.deleteFile(existing.uri);
    }
    const uri = await backend.createFile(exportsUri, importDate, CSV_MIME_TYPE);
    await backend.writeText(uri, csvText);
  };

  const readNotesInRange = async (
    experimentFolderUri: string,
    rangeFrom: string,
    rangeTo: string,
  ): Promise<readonly NoteContent[]> => {
    const noteDates = (await notes.listNoteDates(experimentFolderUri)).filter(
      (date) => date >= rangeFrom && date <= rangeTo,
    );
    const loaded = await Promise.all(
      noteDates.map(async (noteDate) => ({
        noteDate,
        content: await notes.readNote(experimentFolderUri, noteDate),
      })),
    );
    return loaded.filter((note): note is NoteContent => note.content !== null);
  };

  const previewCsvImport = async (
    experimentFolderUri: string,
  ): Promise<GlucoseImportPlan | null> => {
    const picked = await pickCsvFile();
    if (!picked) {
      return null;
    }

    return guard(async () => {
      const csvText = await backend.readText(picked.uri);
      const samples = parseLingoCsv(csvText);
      const importDate = formatNoteDate(new Date());
      await saveExport(experimentFolderUri, importDate, csvText);

      if (samples.length === 0) {
        return {
          sourceId: SOURCE_IDS.lingoCsv,
          exportFileName: exportFileName(importDate),
          rangeFrom: '',
          rangeTo: '',
          meals: [],
        };
      }

      const rangeFrom = formatNoteDate(samples[0].time);
      const rangeTo = formatNoteDate(samples[samples.length - 1].time);
      const notesInRange = await readNotesInRange(experimentFolderUri, rangeFrom, rangeTo);

      return {
        sourceId: SOURCE_IDS.lingoCsv,
        exportFileName: exportFileName(importDate),
        rangeFrom,
        rangeTo,
        meals: buildImportPreview({ notes: notesInRange, samples, sourceId: SOURCE_IDS.lingoCsv }),
      };
    });
  };

  const applyImport = (
    experimentFolderUri: string,
    meals: readonly GlucosePreviewMeal[],
  ): Promise<void> =>
    guard(async () => {
      const byDate = new Map<string, GlucosePreviewMeal[]>();
      for (const meal of meals) {
        const group = byDate.get(meal.noteDate) ?? [];
        group.push(meal);
        byDate.set(meal.noteDate, group);
      }

      for (const [noteDate, group] of byDate) {
        const content = await notes.readNote(experimentFolderUri, noteDate);
        if (content === null) {
          continue;
        }
        const updated = group.reduce(
          (note, meal) =>
            upsertGlucoseSummary(note, meal.mealIndex, renderGlucoseSummary(meal.summary)),
          content,
        );
        await notes.writeNote(experimentFolderUri, noteDate, updated);
      }
    });

  return { previewCsvImport, applyImport };
};
