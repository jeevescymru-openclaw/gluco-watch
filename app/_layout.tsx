import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import type { ReactElement } from 'react';

const RootLayout = (): ReactElement => (
  <SafeAreaProvider>
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="meal" options={{ presentation: 'modal' }} />
      <Stack.Screen name="morning" options={{ presentation: 'modal' }} />
    </Stack>
  </SafeAreaProvider>
);

export default RootLayout;
