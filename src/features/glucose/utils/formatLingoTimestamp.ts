const pad = (value: number): string => String(value).padStart(2, '0');

/**
 * Formats a Date as a Lingo-style local timestamp with offset and minute precision,
 * e.g. `2026-06-03T21:11+01:00`. Inverse of parseLingoTimestamp; used for the Health
 * Connect derived export so its rows match the real CSV format.
 */
export const formatLingoTimestamp = (date: Date): string => {
  const offsetMinutes = -date.getTimezoneOffset();
  const sign = offsetMinutes >= 0 ? '+' : '-';
  const absolute = Math.abs(offsetMinutes);
  const offset = `${sign}${pad(Math.floor(absolute / 60))}:${pad(absolute % 60)}`;
  return (
    `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}` +
    `T${pad(date.getHours())}:${pad(date.getMinutes())}${offset}`
  );
};
