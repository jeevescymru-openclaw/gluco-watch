export interface SafChild {
  readonly name: string;
  readonly uri: string;
  readonly isDirectory: boolean;
}

export interface DirectoryAccessResult {
  readonly granted: boolean;
  readonly uri?: string;
}

/**
 * Minimal abstraction over the Android Storage Access Framework. The real
 * implementation wraps `expo-file-system/legacy`; tests provide an in-memory
 * fake so the orchestration in `vaultService` can be exercised without native
 * code.
 */
export interface SafBackend {
  requestDirectoryAccess(): Promise<DirectoryAccessResult>;
  listChildren(directoryUri: string): Promise<readonly SafChild[]>;
  makeDirectory(parentUri: string, name: string): Promise<string>;
  createFile(parentUri: string, baseName: string, mimeType: string): Promise<string>;
  writeText(fileUri: string, contents: string): Promise<void>;
}
