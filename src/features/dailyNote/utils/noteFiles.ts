import { TEMP_BASE_SUFFIX } from '../constants';

/** Base name passed to SAF `createFile` (no extension — the MIME type adds `.md`). */
export const dailyNoteBaseName = (noteDate: string): string => noteDate;

/** Display name of the daily note as it appears in the folder listing. */
export const dailyNoteFileName = (noteDate: string): string => `${noteDate}.md`;

export const dailyNoteTempBaseName = (noteDate: string): string => `${noteDate}${TEMP_BASE_SUFFIX}`;

export const dailyNoteTempFileName = (noteDate: string): string =>
  `${noteDate}${TEMP_BASE_SUFFIX}.md`;
