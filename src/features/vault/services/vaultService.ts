import {
  ANALYSIS_PROMPT_FILENAME,
  EXPERIMENT_SUBFOLDERS,
  HELLO_FILENAME,
  MARKDOWN_MIME_TYPE,
} from '../constants';
import { ANALYSIS_PROMPT_MARKDOWN } from '../content/analysisPrompt';
import { HELLO_MARKDOWN } from '../content/helloFile';

import type { DirectoryAccessResult, SafBackend } from './safBackend.types';

export class VaultPermissionError extends Error {
  constructor(message: string, options?: { cause?: unknown }) {
    super(message, options);
    this.name = 'VaultPermissionError';
  }
}

export interface ConfigureExperimentFolderResult {
  readonly analysisPromptWritten: boolean;
}

export interface VaultService {
  requestVaultAccess(): Promise<DirectoryAccessResult>;
  ensureChildDirectory(parentUri: string, name: string): Promise<string>;
  ensureDirectoryPath(rootUri: string, segments: readonly string[]): Promise<string>;
  configureExperimentFolder(experimentUri: string): Promise<ConfigureExperimentFolderResult>;
  writeTextFile(
    parentUri: string,
    fileName: string,
    mimeType: string,
    contents: string,
  ): Promise<string>;
  writeHelloFile(experimentUri: string): Promise<string>;
}

const stripExtension = (fileName: string): string => fileName.replace(/\.[^./]+$/, '');

export const createVaultService = (backend: SafBackend): VaultService => {
  const guard = async <TResult>(operation: () => Promise<TResult>): Promise<TResult> => {
    try {
      return await operation();
    } catch (error) {
      throw new VaultPermissionError('Lost access to the vault folder. Please pick it again.', {
        cause: error,
      });
    }
  };

  const ensureChildDirectory = async (parentUri: string, name: string): Promise<string> => {
    const children = await backend.listChildren(parentUri);
    const existing = children.find((child) => child.name === name);
    return existing ? existing.uri : backend.makeDirectory(parentUri, name);
  };

  const ensureDirectoryPath = async (
    rootUri: string,
    segments: readonly string[],
  ): Promise<string> => {
    let currentUri = rootUri;
    for (const segment of segments) {
      currentUri = await ensureChildDirectory(currentUri, segment);
    }
    return currentUri;
  };

  const writeTextFile = async (
    parentUri: string,
    fileName: string,
    mimeType: string,
    contents: string,
  ): Promise<string> => {
    const children = await backend.listChildren(parentUri);
    const existing = children.find((child) => child.name === fileName);

    if (existing) {
      await backend.writeText(existing.uri, contents);
      return existing.uri;
    }

    const fileUri = await backend.createFile(parentUri, stripExtension(fileName), mimeType);
    await backend.writeText(fileUri, contents);
    return fileUri;
  };

  const hasFileNamed = async (parentUri: string, fileName: string): Promise<boolean> => {
    const children = await backend.listChildren(parentUri);
    return children.some((child) => child.name === fileName);
  };

  const configureExperimentFolder = async (
    experimentUri: string,
  ): Promise<ConfigureExperimentFolderResult> => {
    for (const subfolder of EXPERIMENT_SUBFOLDERS) {
      await ensureChildDirectory(experimentUri, subfolder);
    }

    const analysisPromptExists = await hasFileNamed(experimentUri, ANALYSIS_PROMPT_FILENAME);
    if (!analysisPromptExists) {
      await writeTextFile(
        experimentUri,
        ANALYSIS_PROMPT_FILENAME,
        MARKDOWN_MIME_TYPE,
        ANALYSIS_PROMPT_MARKDOWN,
      );
    }

    return { analysisPromptWritten: !analysisPromptExists };
  };

  const writeHelloFile = (experimentUri: string): Promise<string> =>
    writeTextFile(experimentUri, HELLO_FILENAME, MARKDOWN_MIME_TYPE, HELLO_MARKDOWN);

  return {
    requestVaultAccess: () => backend.requestDirectoryAccess(),
    ensureChildDirectory: (parentUri, name) => guard(() => ensureChildDirectory(parentUri, name)),
    ensureDirectoryPath: (rootUri, segments) => guard(() => ensureDirectoryPath(rootUri, segments)),
    configureExperimentFolder: (experimentUri) =>
      guard(() => configureExperimentFolder(experimentUri)),
    writeTextFile: (parentUri, fileName, mimeType, contents) =>
      guard(() => writeTextFile(parentUri, fileName, mimeType, contents)),
    writeHelloFile: (experimentUri) => guard(() => writeHelloFile(experimentUri)),
  };
};
