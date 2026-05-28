import { describe, expect, it } from 'vitest';

import { getDisplayNameFromContentUri, splitExperimentPath } from './safUri';

const AUTHORITY = 'content://com.android.externalstorage.documents';

describe('getDisplayNameFromContentUri', () => {
  it('returns the volume label for a granted tree root URI', () => {
    const treeUri = `${AUTHORITY}/tree/primary%3AObsidian`;
    expect(getDisplayNameFromContentUri(treeUri)).toBe('Obsidian');
  });

  it('returns the final folder name for a nested document URI', () => {
    const documentUri = `${AUTHORITY}/tree/primary%3AObsidian/document/primary%3AObsidian%2FProjects%2FGlucoWatch`;
    expect(getDisplayNameFromContentUri(documentUri)).toBe('GlucoWatch');
  });

  it('decodes a subfolder name', () => {
    const dailyUri = `${AUTHORITY}/tree/primary%3AObsidian/document/primary%3AObsidian%2FProjects%2FGlucoWatch%2FDaily`;
    expect(getDisplayNameFromContentUri(dailyUri)).toBe('Daily');
  });

  it('decodes a file name including spaces and extension', () => {
    const fileUri = `${AUTHORITY}/tree/primary%3AObsidian/document/primary%3AObsidian%2FProjects%2FGlucoWatch%2FAnalysis%20Prompt.md`;
    expect(getDisplayNameFromContentUri(fileUri)).toBe('Analysis Prompt.md');
  });

  it('handles a folder name that contains spaces', () => {
    const lingoUri = `${AUTHORITY}/tree/primary%3AObsidian/document/primary%3AObsidian%2FProjects%2FGlucoWatch%2FLingo%20Exports`;
    expect(getDisplayNameFromContentUri(lingoUri)).toBe('Lingo Exports');
  });
});

describe('splitExperimentPath', () => {
  it('splits a simple two-segment path', () => {
    expect(splitExperimentPath('Projects/GlucoWatch')).toEqual(['Projects', 'GlucoWatch']);
  });

  it('drops blank segments from leading, trailing, and duplicate slashes', () => {
    expect(splitExperimentPath(' /Projects//GlucoWatch/ ')).toEqual(['Projects', 'GlucoWatch']);
  });

  it('returns an empty array for an empty or slash-only path', () => {
    expect(splitExperimentPath('')).toEqual([]);
    expect(splitExperimentPath('///')).toEqual([]);
  });

  it('supports a single-segment path', () => {
    expect(splitExperimentPath('GlucoWatch')).toEqual(['GlucoWatch']);
  });
});
