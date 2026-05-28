import { ActivityIndicator, View } from 'react-native';

import { COLORS } from '@/theme/colors';

import { useVaultConfig } from '../../hooks/useVaultConfig';
import { ConfigurationScreen } from '../ConfigurationScreen/ConfigurationScreen';
import { VaultHomeScreen } from '../VaultHomeScreen/VaultHomeScreen';
import { styles } from './styles';

import type { ReactElement } from 'react';

export const VaultEntry = (): ReactElement => {
  const { status, config, saveConfig, clearConfig } = useVaultConfig();

  const handleReconfigure = (): void => {
    void clearConfig();
  };

  if (status === 'loading') {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color={COLORS.primary} size="large" />
      </View>
    );
  }

  if (status === 'configured' && config) {
    return <VaultHomeScreen config={config} onReconfigure={handleReconfigure} />;
  }

  return <ConfigurationScreen onConfigured={saveConfig} />;
};
