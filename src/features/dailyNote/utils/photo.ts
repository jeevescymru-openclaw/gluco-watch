import { ATTACHMENTS_SUBFOLDER, PHOTO_FILE_MARKER } from '../constants';
import { formatNoteDate } from './dateFormat';

const pad = (value: number): string => value.toString().padStart(2, '0');

/**
 * `YYYY-MM-DD-HHMM-meal` — the photo file base name (the extension is appended by SAF
 * from the MIME type). Timestamp is the event time, per the plan §3 naming convention.
 */
export const photoFileBaseName = (dateTime: Date): string =>
  `${formatNoteDate(dateTime)}-${pad(dateTime.getHours())}${pad(dateTime.getMinutes())}-${PHOTO_FILE_MARKER}`;

/** `Attachments/<fileName>` — the vault-relative path embedded in the daily note. */
export const attachmentRelativePath = (fileName: string): string =>
  `${ATTACHMENTS_SUBFOLDER}/${fileName}`;
