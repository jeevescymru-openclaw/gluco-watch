import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { VaultConfigProvider } from '@/features/vault/context/VaultConfigContext';

import type { ReactElement } from 'react';

const RootLayout = (): ReactElement => (
  <SafeAreaProvider>
    <VaultConfigProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="meal" options={{ presentation: 'modal' }} />
        <Stack.Screen name="exercise" options={{ presentation: 'modal' }} />
        <Stack.Screen name="morning" options={{ presentation: 'modal' }} />
        <Stack.Screen name="settings" options={{ presentation: 'modal' }} />
      </Stack>
    </VaultConfigProvider>
  </SafeAreaProvider>
);

export default RootLayout;
