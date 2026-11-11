// The viewer's theme choice. "system" follows the device; the resolved theme is written to
// <html data-theme>, which src/index.css reads. Stored per browser only.
export type ThemePreference = 'system' | 'dark' | 'light';
export type ResolvedTheme = 'dark' | 'light';

const STORAGE_KEY = 'wetube:theme';
const listeners = new Set<() => void>();
const lightQuery = () => window.matchMedia('(prefers-color-scheme: light)');

export const getThemePreference = (): ThemePreference => {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored === 'dark' || stored === 'light' || stored === 'system') return stored;
  } catch {
    // Storage can be unavailable (private windows, blocked site data); fall back to the device theme.
  }
  return 'system';
};

export const getResolvedTheme = (): ResolvedTheme => (document.documentElement.dataset.theme === 'light' ? 'light' : 'dark');

const applyTheme = () => {
  const preference = getThemePreference();
  document.documentElement.dataset.theme = preference === 'system' ? (lightQuery().matches ? 'light' : 'dark') : preference;
  for (const listener of listeners) listener();
};

export const setThemePreference = (preference: ThemePreference) => {
  try {
    window.localStorage.setItem(STORAGE_KEY, preference);
  } catch {
    // Not persisted; the choice still applies to this page.
  }
  applyTheme();
};

/** Applies the stored theme before the first render and follows device changes. Call once at startup. */
export const initTheme = () => {
  applyTheme();
  lightQuery().addEventListener('change', applyTheme);
};

export const subscribeTheme = (listener: () => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};
