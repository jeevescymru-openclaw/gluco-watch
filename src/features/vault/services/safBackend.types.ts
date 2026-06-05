export interface SafChild {
  readonly name: string;
  readonly uri: string;
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
  readText(fileUri: string): Promise<string>;
  writeText(fileUri: string, contents: string): Promise<void>;
  deleteFile(fileUri: string): Promise<void>;
  /**
   * Copies a local file (e.g. a camera capture `file://` URI) into the SAF folder,
   * returning the created child. The actual stored name may differ from `baseName`
   * (SAF appends the extension and de-duplicates), so callers use the returned name.
   */
  copyLocalFile(
    parentUri: string,
    baseName: string,
    mimeType: string,
    localUri: string,
  ): Promise<SafChild>;
}
