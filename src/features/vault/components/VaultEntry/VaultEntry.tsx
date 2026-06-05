import { ActivityIndicator, View } from 'react-native';

import { HomeScreen } from '@/features/home/components/HomeScreen/HomeScreen';
import { COLORS } from '@/theme/colors';

import { useVaultConfig } from '../../hooks/useVaultConfig';
import { ConfigurationScreen } from '../ConfigurationScreen/ConfigurationScreen';
import { styles } from './styles';

import type { ReactElement } from 'react';

export const VaultEntry = (): ReactElement => {
  const { status, config, saveConfig } = useVaultConfig();

  if (status === 'loading') {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color={COLORS.primary} size="large" />
      </View>
    );
  }

  if (status === 'configured' && config) {
    return <HomeScreen config={config} />;
  }

  return <ConfigurationScreen onConfigured={saveConfig} />;
};
