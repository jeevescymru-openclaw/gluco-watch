import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useState } from 'react';

import { STORAGE_KEYS } from '../constants';

import type { VaultConfig, VaultConfigStatus } from '../vault.types';

interface UseVaultConfigResult {
  readonly status: VaultConfigStatus;
  readonly config: VaultConfig | null;
  readonly saveConfig: (config: VaultConfig) => Promise<void>;
  readonly clearConfig: () => Promise<void>;
}

export const useVaultConfig = (): UseVaultConfigResult => {
  const [status, setStatus] = useState<VaultConfigStatus>('loading');
  const [config, setConfig] = useState<VaultConfig | null>(null);

  useEffect(() => {
    let isActive = true;

    const loadConfig = async (): Promise<void> => {
      const [[, vaultUri], [, experimentFolderUri], [, experimentFolderPath]] =
        await AsyncStorage.multiGet([
          STORAGE_KEYS.VAULT_URI,
          STORAGE_KEYS.EXPERIMENT_FOLDER_URI,
          STORAGE_KEYS.EXPERIMENT_FOLDER_PATH,
        ]);

      if (!isActive) {
        return;
      }

      if (vaultUri && experimentFolderUri && experimentFolderPath) {
        setConfig({ vaultUri, experimentFolderUri, experimentFolderPath });
        setStatus('configured');
      } else {
        setStatus('unconfigured');
      }
    };

    void loadConfig();

    return () => {
      isActive = false;
    };
  }, []);

  const saveConfig = useCallback(async (nextConfig: VaultConfig): Promise<void> => {
    await AsyncStorage.multiSet([
      [STORAGE_KEYS.VAULT_URI, nextConfig.vaultUri],
      [STORAGE_KEYS.EXPERIMENT_FOLDER_URI, nextConfig.experimentFolderUri],
      [STORAGE_KEYS.EXPERIMENT_FOLDER_PATH, nextConfig.experimentFolderPath],
    ]);
    setConfig(nextConfig);
    setStatus('configured');
  }, []);

  const clearConfig = useCallback(async (): Promise<void> => {
    await AsyncStorage.multiRemove([
      STORAGE_KEYS.VAULT_URI,
      STORAGE_KEYS.EXPERIMENT_FOLDER_URI,
      STORAGE_KEYS.EXPERIMENT_FOLDER_PATH,
    ]);
    setConfig(null);
    setStatus('unconfigured');
  }, []);

  return { status, config, saveConfig, clearConfig };
};
