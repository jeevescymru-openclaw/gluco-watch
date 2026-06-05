import { formatNoteDate, parseNoteDate } from '@/features/dailyNote/utils/dateFormat';
import { VaultPermissionError } from '@/features/vault/services/vaultService';

import {
  CSV_FILE_EXTENSION,
  CSV_MIME_TYPE,
  HEALTH_CONNECT_EXPORT_SUFFIX,
  LINGO_EXPORTS_SUBFOLDER,
  SOURCE_IDS,
} from '../constants';
import {
  getHealthConnectStatus,
  readGlucoseSamples,
  requestGlucoseReadPermission,
} from './healthConnectClient';
import { buildImportPreview } from '../utils/buildImportPreview';
import { hcSamplesToCsv } from '../utils/hcSamplesToCsv';
import { parseLingoCsv } from '../utils/parseLingoCsv';
import { pickCsvFile } from '../utils/pickCsvFile';
import { renderGlucoseSummary } from '../utils/renderGlucoseSummary';
import { upsertGlucoseSummary } from '../utils/upsertGlucoseSummary';

import type { NoteContent } from '../utils/buildImportPreview';
import type {
  GlucoseImportOutcome,
  GlucoseImportPlan,
  GlucosePreviewMeal,
  GlucoseSourceId,
} from '../glucose.types';
import type { DailyNoteService } from '@/features/dailyNote/services/dailyNoteService';
import type { SafBackend } from '@/features/vault/services/safBackend.types';

export interface GlucoseImportService {
  /** Starts an import from the given source: previews the per-meal summaries or reports a blocker. */
  previewImport(
    experimentFolderUri: string,
    source: GlucoseSourceId,
  ): Promise<GlucoseImportOutcome>;
  /** Writes the chosen summaries into their daily notes. */
  applyImport(experimentFolderUri: string, meals: readonly GlucosePreviewMeal[]): Promise<void>;
}

const csvExportName = (importDate: string): string => `${importDate}.${CSV_FILE_EXTENSION}`;

const hcExportBase = (importDate: string): string => `${importDate}${HEALTH_CONNECT_EXPORT_SUFFIX}`;

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

  // Writes a CSV into `Lingo Exports/` so the vault stays self-contained. A fresh file is
  // created each time because SAF overwrites do not truncate.
  const saveExport = async (
    experimentFolderUri: string,
    baseName: string,
    content: string,
  ): Promise<void> => {
    const exportsUri = await resolveSubfolder(experimentFolderUri, LINGO_EXPORTS_SUBFOLDER);
    const fileName = `${baseName}.${CSV_FILE_EXTENSION}`;
    const existing = (await backend.listChildren(exportsUri)).find(
      (child) => child.name === fileName,
    );
    if (existing) {
      await backend.deleteFile(existing.uri);
    }
    const uri = await backend.createFile(exportsUri, baseName, CSV_MIME_TYPE);
    await backend.writeText(uri, content);
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

  const emptyPlan = (sourceId: GlucoseSourceId, exportFileName: string): GlucoseImportPlan => ({
    sourceId,
    exportFileName,
    rangeFrom: '',
    rangeTo: '',
    meals: [],
  });

  const previewCsv = async (experimentFolderUri: string): Promise<GlucoseImportOutcome> => {
    const picked = await pickCsvFile();
    if (!picked) {
      return { kind: 'cancelled' };
    }
    return guard<GlucoseImportOutcome>(async () => {
      const csvText = await backend.readText(picked.uri);
      const samples = parseLingoCsv(csvText);
      const importDate = formatNoteDate(new Date());
      await saveExport(experimentFolderUri, importDate, csvText);

      if (samples.length === 0) {
        return { kind: 'plan', plan: emptyPlan(SOURCE_IDS.lingoCsv, csvExportName(importDate)) };
      }

      const rangeFrom = formatNoteDate(samples[0].time);
      const rangeTo = formatNoteDate(samples[samples.length - 1].time);
      const notesInRange = await readNotesInRange(experimentFolderUri, rangeFrom, rangeTo);

      return {
        kind: 'plan',
        plan: {
          sourceId: SOURCE_IDS.lingoCsv,
          exportFileName: csvExportName(importDate),
          rangeFrom,
          rangeTo,
          // The settled CSV never marks meals pending; a short window is missing_data.
          meals: buildImportPreview({
            notes: notesInRange,
            samples,
            sourceId: SOURCE_IDS.lingoCsv,
          }),
        },
      };
    });
  };

  const previewHealthConnect = async (
    experimentFolderUri: string,
  ): Promise<GlucoseImportOutcome> => {
    const status = await getHealthConnectStatus();
    if (status !== 'ready') {
      return { kind: status === 'update-required' ? 'update-required' : 'unavailable' };
    }
    if (!(await requestGlucoseReadPermission())) {
      return { kind: 'permission-denied' };
    }

    return guard<GlucoseImportOutcome>(async () => {
      const importDate = formatNoteDate(new Date());
      const exportName = `${hcExportBase(importDate)}.${CSV_FILE_EXTENSION}`;
      const noteDates = await notes.listNoteDates(experimentFolderUri);
      if (noteDates.length === 0) {
        return { kind: 'plan', plan: emptyPlan(SOURCE_IDS.healthConnect, exportName) };
      }

      const rangeFrom = noteDates[0];
      const rangeTo = importDate;
      const samples = await readGlucoseSamples(parseNoteDate(rangeFrom), new Date());
      if (samples.length === 0) {
        return { kind: 'plan', plan: emptyPlan(SOURCE_IDS.healthConnect, exportName) };
      }

      await saveExport(experimentFolderUri, hcExportBase(importDate), hcSamplesToCsv(samples));
      const notesInRange = await readNotesInRange(experimentFolderUri, rangeFrom, rangeTo);
      const pendingAfter = samples[samples.length - 1].time;

      return {
        kind: 'plan',
        plan: {
          sourceId: SOURCE_IDS.healthConnect,
          exportFileName: exportName,
          rangeFrom,
          rangeTo,
          meals: buildImportPreview({
            notes: notesInRange,
            samples,
            sourceId: SOURCE_IDS.healthConnect,
            pendingAfter,
          }),
        },
      };
    });
  };

  const previewImport = (
    experimentFolderUri: string,
    source: GlucoseSourceId,
  ): Promise<GlucoseImportOutcome> =>
    source === SOURCE_IDS.healthConnect
      ? previewHealthConnect(experimentFolderUri)
      : previewCsv(experimentFolderUri);

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
          (note: string, meal) =>
            upsertGlucoseSummary(note, meal.mealIndex, renderGlucoseSummary(meal.summary)),
          content,
        );
        await notes.writeNote(experimentFolderUri, noteDate, updated);
      }
    });

  return { previewImport, applyImport };
};
