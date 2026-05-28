import { getInfoAsync, StorageAccessFramework, writeAsStringAsync } from 'expo-file-system/legacy';

import { getDisplayNameFromContentUri } from '../utils/safUri';

import type { DirectoryAccessResult, SafBackend, SafChild } from './safBackend.types';

const requestDirectoryAccess = async (): Promise<DirectoryAccessResult> => {
  const permission = await StorageAccessFramework.requestDirectoryPermissionsAsync();
  return permission.granted ? { granted: true, uri: permission.directoryUri } : { granted: false };
};

const listChildren = async (directoryUri: string): Promise<readonly SafChild[]> => {
  const childUris = await StorageAccessFramework.readDirectoryAsync(directoryUri);
  return Promise.all(
    childUris.map(async (uri): Promise<SafChild> => {
      const info = await getInfoAsync(uri);
      return {
        uri,
        name: getDisplayNameFromContentUri(uri),
        isDirectory: info.exists && info.isDirectory,
      };
    }),
  );
};

const makeDirectory = (parentUri: string, name: string): Promise<string> =>
  StorageAccessFramework.makeDirectoryAsync(parentUri, name);

const createFile = (parentUri: string, baseName: string, mimeType: string): Promise<string> =>
  StorageAccessFramework.createFileAsync(parentUri, baseName, mimeType);

const writeText = (fileUri: string, contents: string): Promise<void> =>
  writeAsStringAsync(fileUri, contents);

export const safBackend: SafBackend = {
  requestDirectoryAccess,
  listChildren,
  makeDirectory,
  createFile,
  writeText,
};
