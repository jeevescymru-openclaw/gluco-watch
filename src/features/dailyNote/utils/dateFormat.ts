import {
  DEFAULT_BACKDATE_HOUR,
  MONTH_LABELS,
  RELATIVE_DAY_LABELS,
  WEEKDAY_LABELS,
} from '../constants';

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

/** Parses a `YYYY-MM-DD` note date into a local-midnight Date. */
export const parseNoteDate = (noteDate: string): Date => {
  const [year, month, day] = noteDate.split('-').map(Number);
  return new Date(year, month - 1, day);
};

export const isNoteDateToday = (noteDate: string): boolean =>
  noteDate === formatNoteDate(new Date());

/** A short human label for a day: `Today`, `Yesterday`, or `Tue 3 Jun`. */
export const formatRelativeDay = (noteDate: string): string => {
  const now = new Date();
  if (noteDate === formatNoteDate(now)) {
    return RELATIVE_DAY_LABELS.today;
  }
  if (noteDate === shiftNoteDate(now, -1)) {
    return RELATIVE_DAY_LABELS.yesterday;
  }
  const date = parseNoteDate(noteDate);
  return `${WEEKDAY_LABELS[date.getDay()]} ${date.getDate()} ${MONTH_LABELS[date.getMonth()]}`;
};

/** The pill label on the entry forms, e.g. `Today, 14:30` or `Tue 3 Jun, 08:00`. */
export const formatPillDateTime = (date: Date): string =>
  `${formatRelativeDay(formatNoteDate(date))}, ${formatEntryTime(date)}`;

/**
 * The datetime an entry form opens with: the current moment when logging on today,
 * or midday on a browsed past day (which has no obvious event time).
 */
export const initialEntryDateTime = (noteDate: string): Date => {
  if (isNoteDateToday(noteDate)) {
    return new Date();
  }
  const day = parseNoteDate(noteDate);
  day.setHours(DEFAULT_BACKDATE_HOUR, 0, 0, 0);
  return day;
};

/** The datetime an existing entry occupies: its note's date at its `HH:MM` event time. */
export const entryDateTime = (noteDate: string, time: string): Date => {
  const [hours, minutes] = time.split(':').map(Number);
  const date = parseNoteDate(noteDate);
  date.setHours(hours, minutes, 0, 0);
  return date;
};
