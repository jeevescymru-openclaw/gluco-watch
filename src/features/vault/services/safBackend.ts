import {
  deleteAsync,
  EncodingType,
  readAsStringAsync,
  StorageAccessFramework,
  writeAsStringAsync,
} from 'expo-file-system/legacy';

import { getDisplayNameFromContentUri } from '../utils/safUri';

import type { DirectoryAccessResult, SafBackend, SafChild } from './safBackend.types';

const requestDirectoryAccess = async (): Promise<DirectoryAccessResult> => {
  const permission = await StorageAccessFramework.requestDirectoryPermissionsAsync();
  return permission.granted ? { granted: true, uri: permission.directoryUri } : { granted: false };
};

// SAF identifies children by name only. `getInfoAsync` is unreliable for
// `content://` directory URIs (it reports `isDirectory: false`), so callers must
// never branch on a directory flag — they match by name and find-first-then-create.
const listChildren = async (directoryUri: string): Promise<readonly SafChild[]> => {
  const childUris = await StorageAccessFramework.readDirectoryAsync(directoryUri);
  return childUris.map((uri) => ({ uri, name: getDisplayNameFromContentUri(uri) }));
};

const makeDirectory = (parentUri: string, name: string): Promise<string> =>
  StorageAccessFramework.makeDirectoryAsync(parentUri, name);

const createFile = (parentUri: string, baseName: string, mimeType: string): Promise<string> =>
  StorageAccessFramework.createFileAsync(parentUri, baseName, mimeType);

const readText = (fileUri: string): Promise<string> => readAsStringAsync(fileUri);

const writeText = (fileUri: string, contents: string): Promise<void> =>
  writeAsStringAsync(fileUri, contents);

const deleteFile = (fileUri: string): Promise<void> => deleteAsync(fileUri);

const copyLocalFile = async (
  parentUri: string,
  baseName: string,
  mimeType: string,
  localUri: string,
): Promise<SafChild> => {
  const uri = await StorageAccessFramework.createFileAsync(parentUri, baseName, mimeType);
  const data = await readAsStringAsync(localUri, { encoding: EncodingType.Base64 });
  await writeAsStringAsync(uri, data, { encoding: EncodingType.Base64 });
  return { uri, name: getDisplayNameFromContentUri(uri) };
};

export const safBackend: SafBackend = {
  requestDirectoryAccess,
  listChildren,
  makeDirectory,
  createFile,
  readText,
  writeText,
  deleteFile,
  copyLocalFile,
};
