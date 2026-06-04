const pad = (value: number): string => value.toString().padStart(2, '0');

/** `YYYY-MM-DD` in local time — the daily-note filename and frontmatter `date`. */
export const formatNoteDate = (date: Date): string =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

/** `HH:MM` in local time — the event time in an entry's H3 heading. */
export const formatEntryTime = (date: Date): string =>
  `${pad(date.getHours())}:${pad(date.getMinutes())}`;

/** The daily-note date `dayCount` days from `date`, in local time. Negative looks back. */
export const shiftNoteDate = (date: Date, dayCount: number): string => {
  const shifted = new Date(date);
  shifted.setDate(date.getDate() + dayCount);
  return formatNoteDate(shifted);
};
