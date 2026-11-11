import { useSyncExternalStore } from 'react';
import { getResolvedTheme, getThemePreference, subscribeTheme, type ResolvedTheme, type ThemePreference } from '../lib/theme';

const getSnapshot = () => `${getThemePreference()}:${getResolvedTheme()}`;

/** The stored theme choice and the theme it resolves to, updated when either changes. */
export const useTheme = (): { preference: ThemePreference; resolved: ResolvedTheme } => {
  const [preference, resolved] = useSyncExternalStore(subscribeTheme, getSnapshot).split(':') as [ThemePreference, ResolvedTheme];
  return { preference, resolved };
};
