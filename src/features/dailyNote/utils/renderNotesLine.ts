import { LOGGED_LATE_MARKER, NOTES_PREFIX } from '../constants';

/**
 * Builds an entry's optional `Notes:` line, appending the `(logged late)` marker for
 * backdated entries. Returns null when there is nothing to write.
 */
export const renderNotesLine = (
  notes: string | undefined,
  loggedLate: boolean | undefined,
): string | null => {
  const parts = [notes?.trim(), loggedLate ? LOGGED_LATE_MARKER : null].filter(Boolean);
  return parts.length > 0 ? `${NOTES_PREFIX}${parts.join(' ')}` : null;
};
