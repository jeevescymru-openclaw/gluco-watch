import { useState } from 'react';
import { Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppButton } from '@/components/AppButton/AppButton';

import { DEFAULT_EXPERIMENT_PATH } from '../../constants';
import { vaultService } from '../../services/vaultServiceInstance';
import { VaultPermissionError } from '../../services/vaultService';
import { getDisplayNameFromContentUri, splitExperimentPath } from '../../utils/safUri';
import { CONFIGURATION_LABELS } from './constants';
import { styles } from './styles';

import type { VaultConfig } from '../../vault.types';
import type { ReactElement } from 'react';

interface ConfigurationScreenProps {
  readonly onConfigured: (config: VaultConfig) => Promise<void>;
  readonly initialPath?: string;
}

export const ConfigurationScreen = ({
  onConfigured,
  initialPath = DEFAULT_EXPERIMENT_PATH,
}: ConfigurationScreenProps): ReactElement => {
  const [vaultUri, setVaultUri] = useState<string | null>(null);
  const [experimentPath, setExperimentPath] = useState(initialPath);
  const [isBusy, setIsBusy] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const vaultName = vaultUri ? getDisplayNameFromContentUri(vaultUri) : null;

  const pickVault = async (): Promise<void> => {
    const result = await vaultService.requestVaultAccess();
    if (result.granted && result.uri) {
      setVaultUri(result.uri);
      setErrorMessage(null);
    }
  };

  const finishSetup = async (): Promise<void> => {
    if (!vaultUri) {
      return;
    }

    setIsBusy(true);
    setErrorMessage(null);

    try {
      const segments = splitExperimentPath(experimentPath);
      const experimentFolderUri = await vaultService.ensureDirectoryPath(vaultUri, segments);
      await vaultService.configureExperimentFolder(experimentFolderUri);
      await onConfigured({
        vaultUri,
        experimentFolderUri,
        experimentFolderPath: segments.join('/'),
      });
    } catch (error) {
      if (error instanceof VaultPermissionError) {
        setVaultUri(null);
        setErrorMessage(CONFIGURATION_LABELS.permissionError);
      } else {
        setErrorMessage(CONFIGURATION_LABELS.genericError);
      }
    } finally {
      setIsBusy(false);
    }
  };

  const handlePickVault = (): void => {
    void pickVault();
  };

  const handleFinishSetup = (): void => {
    void finishSetup();
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>{CONFIGURATION_LABELS.title}</Text>
        <Text style={styles.intro}>{CONFIGURATION_LABELS.intro}</Text>

        <AppButton
          label={CONFIGURATION_LABELS.pickVault}
          onPress={handlePickVault}
          tone="secondary"
        />
        {vaultName ? (
          <Text style={styles.vaultName}>{`${CONFIGURATION_LABELS.vaultPrefix}${vaultName}`}</Text>
        ) : null}

        <Text style={styles.inputLabel}>{CONFIGURATION_LABELS.experimentPathLabel}</Text>
        <TextInput
          autoCapitalize="none"
          autoCorrect={false}
          onChangeText={setExperimentPath}
          placeholder={DEFAULT_EXPERIMENT_PATH}
          style={styles.input}
          value={experimentPath}
        />

        {errorMessage ? <Text style={styles.error}>{errorMessage}</Text> : null}

        <View style={styles.spacer} />
        <AppButton
          disabled={!vaultUri || isBusy}
          label={CONFIGURATION_LABELS.setUp}
          onPress={handleFinishSetup}
        />
      </View>
    </SafeAreaView>
  );
};
