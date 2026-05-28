import { useState } from 'react';
import { Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppButton } from '@/components/AppButton/AppButton';

import { vaultService } from '../../services/vaultServiceInstance';
import { VaultPermissionError } from '../../services/vaultService';
import { VAULT_HOME_LABELS } from './constants';
import { styles } from './styles';

import type { VaultConfig } from '../../vault.types';
import type { ReactElement } from 'react';

interface VaultHomeScreenProps {
  readonly config: VaultConfig;
  readonly onReconfigure: () => void;
}

interface StatusMessage {
  readonly tone: 'success' | 'error';
  readonly text: string;
}

export const VaultHomeScreen = ({ config, onReconfigure }: VaultHomeScreenProps): ReactElement => {
  const [isWriting, setIsWriting] = useState(false);
  const [message, setMessage] = useState<StatusMessage | null>(null);

  const writeHello = async (): Promise<void> => {
    setIsWriting(true);
    setMessage(null);

    try {
      await vaultService.writeHelloFile(config.experimentFolderUri);
      setMessage({ tone: 'success', text: VAULT_HOME_LABELS.successMessage });
    } catch (error) {
      const text =
        error instanceof VaultPermissionError
          ? VAULT_HOME_LABELS.permissionError
          : VAULT_HOME_LABELS.genericError;
      setMessage({ tone: 'error', text });
    } finally {
      setIsWriting(false);
    }
  };

  const handleWriteHello = (): void => {
    void writeHello();
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>{VAULT_HOME_LABELS.title}</Text>
        <Text style={styles.ready}>{VAULT_HOME_LABELS.ready}</Text>

        <AppButton
          disabled={isWriting}
          label={VAULT_HOME_LABELS.writeHello}
          onPress={handleWriteHello}
        />

        {message ? (
          <Text style={message.tone === 'success' ? styles.successMessage : styles.errorMessage}>
            {message.text}
          </Text>
        ) : null}

        <View style={styles.spacer} />
        <AppButton
          label={VAULT_HOME_LABELS.changeFolder}
          onPress={onReconfigure}
          tone="secondary"
        />
        <Text numberOfLines={1} style={styles.footer}>
          {`${VAULT_HOME_LABELS.folderPrefix}${config.experimentFolderPath}`}
        </Text>
      </View>
    </SafeAreaView>
  );
};
