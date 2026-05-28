const DOCUMENT_MARKER = '/document/';
const TREE_MARKER = '/tree/';
const PATH_SEPARATOR = '/';
const VOLUME_SEPARATOR = ':';

const decodeStorageId = (contentUri: string): string => {
  const marker = contentUri.includes(DOCUMENT_MARKER) ? DOCUMENT_MARKER : TREE_MARKER;
  const markerIndex = contentUri.lastIndexOf(marker);

  if (markerIndex === -1) {
    return contentUri;
  }

  const encodedId = contentUri.slice(markerIndex + marker.length);
  return decodeURIComponent(encodedId);
};

/**
 * Extracts the human-readable name of the last path component from a Storage
 * Access Framework `content://` URI (tree or document). For a tree root this is
 * the volume label (e.g. `Obsidian`); for a document it is the final folder or
 * file name (e.g. `Daily`, `Analysis Prompt.md`).
 */
export const getDisplayNameFromContentUri = (contentUri: string): string => {
  const storageId = decodeStorageId(contentUri);
  const lastPathSegment = storageId.split(PATH_SEPARATOR).filter(Boolean).at(-1) ?? '';
  return lastPathSegment.split(VOLUME_SEPARATOR).at(-1) ?? '';
};

/**
 * Splits a user-entered relative folder path (e.g. `Projects/GlucoWatch`) into
 * cleaned segments, dropping blanks from leading/trailing/duplicate slashes.
 */
export const splitExperimentPath = (relativePath: string): readonly string[] =>
  relativePath
    .split(PATH_SEPARATOR)
    .map((segment) => segment.trim())
    .filter((segment) => segment.length > 0);
