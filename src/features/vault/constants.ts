export const EXPERIMENT_SUBFOLDERS = ['Daily', 'Sessions', 'Attachments', 'Lingo Exports'] as const;

export const ANALYSIS_PROMPT_FILENAME = 'Analysis Prompt.md';
export const HELLO_FILENAME = 'hello.md';

export const DEFAULT_EXPERIMENT_PATH = 'Projects/GlucoWatch';

export const MARKDOWN_MIME_TYPE = 'text/markdown';

export const STORAGE_KEYS = {
  VAULT_URI: 'glucowatch.vaultUri',
  EXPERIMENT_FOLDER_URI: 'glucowatch.experimentFolderUri',
  EXPERIMENT_FOLDER_PATH: 'glucowatch.experimentFolderPath',
} as const;
