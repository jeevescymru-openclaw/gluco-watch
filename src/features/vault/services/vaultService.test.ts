import { beforeEach, describe, expect, it } from 'vitest';

import {
  ANALYSIS_PROMPT_FILENAME,
  EXPERIMENT_SUBFOLDERS,
  HELLO_FILENAME,
  MARKDOWN_MIME_TYPE,
} from '../constants';
import { ANALYSIS_PROMPT_MARKDOWN } from '../content/analysisPrompt';

import { createVaultService, VaultPermissionError } from './vaultService';

import type { SafBackend, SafChild } from './safBackend.types';

const ROOT_URI = 'saf://root';
const MIME_EXTENSIONS: Record<string, string> = { [MARKDOWN_MIME_TYPE]: 'md' };

interface FakeNode {
  uri: string;
  name: string;
  isDirectory: boolean;
  parentUri: string | null;
  contents: string | null;
}

interface FakeBackend {
  backend: SafBackend;
  rootUri: string;
  calls: { makeDirectory: number; createFile: number; writeText: number };
  seedDirectory: (parentUri: string, name: string) => string;
  findByName: (parentUri: string, name: string) => FakeNode | undefined;
  contentsOf: (uri: string) => string | null;
}

const createFakeBackend = (): FakeBackend => {
  const nodes = new Map<string, FakeNode>();
  nodes.set(ROOT_URI, {
    uri: ROOT_URI,
    name: 'root',
    isDirectory: true,
    parentUri: null,
    contents: null,
  });
  const calls = { makeDirectory: 0, createFile: 0, writeText: 0 };

  const childrenOf = (parentUri: string): FakeNode[] =>
    [...nodes.values()].filter((node) => node.parentUri === parentUri);

  const addNode = (parentUri: string, name: string, isDirectory: boolean): FakeNode => {
    const node: FakeNode = {
      uri: `${parentUri}/${name}`,
      name,
      isDirectory,
      parentUri,
      contents: isDirectory ? null : '',
    };
    nodes.set(node.uri, node);
    return node;
  };

  const backend: SafBackend = {
    requestDirectoryAccess: async () => ({ granted: true, uri: ROOT_URI }),
    listChildren: async (directoryUri): Promise<readonly SafChild[]> =>
      childrenOf(directoryUri).map((node) => ({
        uri: node.uri,
        name: node.name,
        isDirectory: node.isDirectory,
      })),
    makeDirectory: async (parentUri, name) => {
      calls.makeDirectory += 1;
      return addNode(parentUri, name, true).uri;
    },
    createFile: async (parentUri, baseName, mimeType) => {
      calls.createFile += 1;
      const extension = MIME_EXTENSIONS[mimeType];
      const name = extension ? `${baseName}.${extension}` : baseName;
      return addNode(parentUri, name, false).uri;
    },
    writeText: async (fileUri, contents) => {
      calls.writeText += 1;
      const node = nodes.get(fileUri);
      if (!node) {
        throw new Error(`No such file: ${fileUri}`);
      }
      node.contents = contents;
    },
  };

  return {
    backend,
    rootUri: ROOT_URI,
    calls,
    seedDirectory: (parentUri, name) => addNode(parentUri, name, true).uri,
    findByName: (parentUri, name) => childrenOf(parentUri).find((node) => node.name === name),
    contentsOf: (uri) => nodes.get(uri)?.contents ?? null,
  };
};

const requireNode = (node: FakeNode | undefined): FakeNode => {
  if (!node) {
    throw new Error('expected node to exist');
  }
  return node;
};

describe('createVaultService', () => {
  let fake: FakeBackend;

  beforeEach(() => {
    fake = createFakeBackend();
  });

  describe('ensureDirectoryPath', () => {
    it('reuses an existing folder and creates only the missing segment', async () => {
      const projectsUri = fake.seedDirectory(fake.rootUri, 'Projects');
      const service = createVaultService(fake.backend);

      const experimentUri = await service.ensureDirectoryPath(fake.rootUri, [
        'Projects',
        'GlucoWatch',
      ]);

      expect(fake.calls.makeDirectory).toBe(1);
      expect(experimentUri).toBe(requireNode(fake.findByName(projectsUri, 'GlucoWatch')).uri);
    });

    it('creates every segment when none exist', async () => {
      const service = createVaultService(fake.backend);

      await service.ensureDirectoryPath(fake.rootUri, ['Projects', 'GlucoWatch']);

      expect(fake.calls.makeDirectory).toBe(2);
    });
  });

  describe('configureExperimentFolder', () => {
    it('creates every fixed subfolder and writes the analysis prompt on first run', async () => {
      const service = createVaultService(fake.backend);
      const experimentUri = await service.ensureDirectoryPath(fake.rootUri, ['GlucoWatch']);

      const result = await service.configureExperimentFolder(experimentUri);

      expect(result.analysisPromptWritten).toBe(true);
      for (const name of EXPERIMENT_SUBFOLDERS) {
        expect(requireNode(fake.findByName(experimentUri, name)).isDirectory).toBe(true);
      }
      const promptNode = requireNode(fake.findByName(experimentUri, ANALYSIS_PROMPT_FILENAME));
      expect(fake.contentsOf(promptNode.uri)).toBe(ANALYSIS_PROMPT_MARKDOWN);
    });

    it('is idempotent and never overwrites an existing analysis prompt', async () => {
      const service = createVaultService(fake.backend);
      const experimentUri = await service.ensureDirectoryPath(fake.rootUri, ['GlucoWatch']);
      await service.configureExperimentFolder(experimentUri);

      const promptNode = requireNode(fake.findByName(experimentUri, ANALYSIS_PROMPT_FILENAME));
      await fake.backend.writeText(promptNode.uri, '# Edited by the user in Obsidian');
      fake.calls.makeDirectory = 0;
      fake.calls.writeText = 0;

      const result = await service.configureExperimentFolder(experimentUri);

      expect(result.analysisPromptWritten).toBe(false);
      expect(fake.calls.makeDirectory).toBe(0);
      expect(fake.calls.writeText).toBe(0);
      expect(fake.contentsOf(promptNode.uri)).toBe('# Edited by the user in Obsidian');
    });
  });

  describe('writeHelloFile', () => {
    it('creates hello.md and returns its uri', async () => {
      const service = createVaultService(fake.backend);
      const experimentUri = await service.ensureDirectoryPath(fake.rootUri, ['GlucoWatch']);

      const uri = await service.writeHelloFile(experimentUri);

      const helloNode = requireNode(fake.findByName(experimentUri, HELLO_FILENAME));
      expect(uri).toBe(helloNode.uri);
      expect(helloNode.isDirectory).toBe(false);
      expect(fake.contentsOf(uri)).toContain('Hello from GlucoWatch');
    });

    it('overwrites an existing hello.md without creating a duplicate', async () => {
      const service = createVaultService(fake.backend);
      const experimentUri = await service.ensureDirectoryPath(fake.rootUri, ['GlucoWatch']);
      await service.writeHelloFile(experimentUri);
      fake.calls.createFile = 0;

      await service.writeHelloFile(experimentUri);

      expect(fake.calls.createFile).toBe(0);
    });
  });

  describe('permission failures', () => {
    it('wraps a revoked-access backend error in VaultPermissionError', async () => {
      const failingBackend: SafBackend = {
        ...fake.backend,
        listChildren: async () => {
          throw new Error('permission revoked');
        },
      };
      const service = createVaultService(failingBackend);

      await expect(service.writeHelloFile('saf://root/GlucoWatch')).rejects.toBeInstanceOf(
        VaultPermissionError,
      );
    });
  });
});
