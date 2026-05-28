export const CONFIGURATION_LABELS = {
  title: 'Set up your vault',
  intro:
    'GlucoWatch writes daily notes and photos into a folder inside your Obsidian vault. Pick the vault, then choose where the experiment folder lives.',
  pickVault: 'Pick Obsidian vault folder',
  vaultPrefix: 'Vault: ',
  experimentPathLabel: 'Experiment folder (relative to the vault)',
  setUp: 'Create folder & finish setup',
  permissionError: 'Could not access that folder. Please pick your vault again.',
  genericError: 'Something went wrong setting up the folder. Please try again.',
} as const;
