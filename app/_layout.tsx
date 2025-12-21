import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

import { GluestackUIProvider } from '@/components/ui/gluestack-ui-provider';
import { Colors } from '@/constants/theme';
import { SubscriptionProvider } from '@/features/subscription';
import '@/global.css';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { PreferencesProvider } from '@/hooks/use-preferences';

function RootLayoutContent() {
  const colorScheme = useColorScheme() ?? 'light';
  const navigationTheme = colorScheme === 'dark' ? DarkTheme : DefaultTheme;

  return (
    <SafeAreaProvider>
      <GluestackUIProvider mode={colorScheme}>
        <ThemeProvider value={navigationTheme}>
          <SafeAreaView style={{ flex: 1, backgroundColor: Colors[colorScheme].background }}>
            <Stack>
              <Stack.Screen name="index" options={{ headerShown: false }} />
              <Stack.Screen name="calculators/cdb/index" options={{ title: 'Calculadora CDB' }} />
              <Stack.Screen
                name="calculators/lci-lca/index"
                options={{ title: 'Calculadora LCI / LCA' }}
              />
              <Stack.Screen
                name="calculators/tesouro-direto/index"
                options={{ title: 'Calculadora Tesouro Direto' }}
              />
            </Stack>
            <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
          </SafeAreaView>
        </ThemeProvider>
      </GluestackUIProvider>
    </SafeAreaProvider>
  );
}

export default function RootLayout() {
  return (
    <PreferencesProvider>
      <SubscriptionProvider>
        <RootLayoutContent />
      </SubscriptionProvider>
    </PreferencesProvider>
  );
}
