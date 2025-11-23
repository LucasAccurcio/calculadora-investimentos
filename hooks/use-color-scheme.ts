import { useContext } from 'react';
import { useColorScheme as useNativeColorScheme } from 'react-native';

import { PreferencesContext } from '@/hooks/use-preferences';

export function useColorScheme() {
  const systemColorScheme = useNativeColorScheme();
  const preferences = useContext(PreferencesContext);

  if (preferences?.themePreference) {
    return preferences.themePreference;
  }

  return systemColorScheme ?? 'light';
}
