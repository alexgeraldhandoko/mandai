import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { SettingsProvider } from '@/context/settings-context';
import { colors } from '@/theme';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <SettingsProvider>
        <StatusBar style="light" />
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: colors.ink },
            animation: 'fade',
          }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="camera" />
          <Stack.Screen name="settings" options={{ presentation: 'modal' }} />
        </Stack>
      </SettingsProvider>
    </SafeAreaProvider>
  );
}
