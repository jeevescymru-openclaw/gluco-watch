export interface VaultConfig {
  readonly vaultUri: string;
  readonly experimentFolderUri: string;
  readonly experimentFolderPath: string;
}

export type VaultConfigStatus = 'loading' | 'unconfigured' | 'configured';
