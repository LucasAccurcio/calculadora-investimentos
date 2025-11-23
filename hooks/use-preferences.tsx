import * as FileSystem from 'expo-file-system/legacy';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

export type ThemePreference = 'light' | 'dark';
export type FontScaleOption = 'normal' | 'medium' | 'large';

type PreferencesState = {
  themePreference: ThemePreference;
  fontScale: FontScaleOption;
};

type PreferencesContextValue = PreferencesState & {
  hydrated: boolean;
  setThemePreference: (value: ThemePreference) => void;
  setFontScale: (value: FontScaleOption) => void;
};

const DEFAULT_STATE: PreferencesState = {
  themePreference: 'light',
  fontScale: 'normal',
};

const STORAGE_FILE_PATH =
  (FileSystem.documentDirectory ?? FileSystem.cacheDirectory)
    ? `${FileSystem.documentDirectory ?? FileSystem.cacheDirectory}user-preferences.json`
    : null;

export const PreferencesContext = createContext<PreferencesContextValue | undefined>(undefined);

async function readStoredPreferences(): Promise<PreferencesState | null> {
  try {
    if (!STORAGE_FILE_PATH) {
      return null;
    }

    const info = await FileSystem.getInfoAsync(STORAGE_FILE_PATH);
    if (!info.exists) {
      return null;
    }

    const raw = await FileSystem.readAsStringAsync(STORAGE_FILE_PATH);
    return raw ? (JSON.parse(raw) as PreferencesState) : null;
  } catch (error) {
    console.warn('[preferences] Failed to load', error);
    return null;
  }
}

async function persistPreferences(state: PreferencesState) {
  try {
    if (!STORAGE_FILE_PATH) {
      return;
    }

    await FileSystem.writeAsStringAsync(STORAGE_FILE_PATH, JSON.stringify(state));
  } catch (error) {
    console.warn('[preferences] Failed to persist', error);
  }
}

export function PreferencesProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<PreferencesState>(DEFAULT_STATE);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    let isMounted = true;
    (async () => {
      const stored = await readStoredPreferences();
      if (stored && isMounted) {
        setState({ ...DEFAULT_STATE, ...stored });
      }
      if (isMounted) {
        setHydrated(true);
      }
    })();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!hydrated) {
      return;
    }
    persistPreferences(state);
  }, [state, hydrated]);

  const setThemePreference = useCallback((value: ThemePreference) => {
    setState((prev) =>
      prev.themePreference === value ? prev : { ...prev, themePreference: value },
    );
  }, []);

  const setFontScale = useCallback((value: FontScaleOption) => {
    setState((prev) => (prev.fontScale === value ? prev : { ...prev, fontScale: value }));
  }, []);

  const value = useMemo<PreferencesContextValue>(
    () => ({ ...state, hydrated, setThemePreference, setFontScale }),
    [state, hydrated, setThemePreference, setFontScale],
  );

  return <PreferencesContext.Provider value={value}>{children}</PreferencesContext.Provider>;
}

export function usePreferences() {
  const context = useContext(PreferencesContext);
  if (!context) {
    throw new Error('usePreferences must be used within PreferencesProvider');
  }
  return context;
}

const FONT_SCALE_MAP: Record<FontScaleOption, number> = {
  normal: 1,
  medium: 1.1,
  large: 1.25,
};

export function useFontScaleMultiplier() {
  const { fontScale } = usePreferences();
  return FONT_SCALE_MAP[fontScale];
}
