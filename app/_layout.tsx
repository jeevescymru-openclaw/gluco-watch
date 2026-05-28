import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import type { ReactElement } from 'react';

const RootLayout = (): ReactElement => (
  <SafeAreaProvider>
    <Stack screenOptions={{ headerShown: false }} />
  </SafeAreaProvider>
);

export default RootLayout;
