// Lingo stamps each reading as `2026-05-28T19:56+01:00` — ISO-like local wall-clock
// with a timezone offset but no seconds. JS `Date` parsing of the seconds-less form is
// engine-dependent (differs between V8 and Hermes), so the components are parsed
// explicitly and converted to an absolute instant here.
const LINGO_TIMESTAMP_PATTERN =
  /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2}))?(?:(Z)|([+-])(\d{2}):(\d{2}))$/;

const MINUTES_PER_HOUR = 60;
const MS_PER_MINUTE = 60_000;

export const parseLingoTimestamp = (raw: string): Date | null => {
  const match = LINGO_TIMESTAMP_PATTERN.exec(raw.trim());
  if (!match) {
    return null;
  }

  const [, year, month, day, hour, minute, second, zulu, sign, offsetHour, offsetMinute] = match;
  const wallClockMs = Date.UTC(
    Number(year),
    Number(month) - 1,
    Number(day),
    Number(hour),
    Number(minute),
    second ? Number(second) : 0,
  );

  if (zulu) {
    return new Date(wallClockMs);
  }

  const offsetMinutes =
    (Number(offsetHour) * MINUTES_PER_HOUR + Number(offsetMinute)) * (sign === '-' ? -1 : 1);
  return new Date(wallClockMs - offsetMinutes * MS_PER_MINUTE);
};
