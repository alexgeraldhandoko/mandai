import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

export type ResponseLength = 'brief' | 'standard' | 'detailed';
export type Language = 'en-US' | 'id-ID';

export type AppSettings = {
  responseLength: ResponseLength;
  speechRate: 0.8 | 1 | 1.2;
  language: Language;
};

const defaultSettings: AppSettings = {
  responseLength: 'standard',
  speechRate: 1,
  language: 'en-US',
};

export const responseLengthOptions: {
  value: ResponseLength;
  label: string;
  description: string;
}[] = [
  { value: 'brief', label: 'Brief', description: 'About 35 words' },
  { value: 'standard', label: 'Standard', description: 'About 60 words' },
  { value: 'detailed', label: 'Detailed', description: 'Up to 70 words' },
];

export const speechRateOptions: {
  value: AppSettings['speechRate'];
  label: string;
}[] = [
  { value: 0.8, label: 'Relaxed' },
  { value: 1, label: 'Normal' },
  { value: 1.2, label: 'Quick' },
];

type SettingsContextValue = {
  settings: AppSettings;
  updateSettings: (changes: Partial<AppSettings>) => void;
};

const SettingsContext = createContext<SettingsContextValue | null>(null);
const storageKey = 'wildsight.settings.v1';

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState(defaultSettings);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(storageKey)
      .then((saved) => {
        if (saved) setSettings({ ...defaultSettings, ...JSON.parse(saved) });
      })
      .catch(() => {
        // The defaults remain usable if local storage is unavailable.
      })
      .finally(() => setLoaded(true));
  }, []);

  useEffect(() => {
    if (!loaded) return;
    AsyncStorage.setItem(storageKey, JSON.stringify(settings)).catch(() => {
      // Settings remain active for this session even if persistence fails.
    });
  }, [loaded, settings]);

  const value = useMemo<SettingsContextValue>(
    () => ({
      settings,
      updateSettings: (changes) =>
        setSettings((current) => ({ ...current, ...changes })),
    }),
    [settings],
  );

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSettings(): SettingsContextValue {
  const value = useContext(SettingsContext);
  if (!value) throw new Error('useSettings must be used inside SettingsProvider.');
  return value;
}

