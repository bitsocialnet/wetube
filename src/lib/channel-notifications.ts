// The bell next to Subscribed: whether the viewer wants notifications of a subscribed channel's new
// posts. Kept in this browser until the account stores it next to its subscriptions; nothing sends
// notifications yet (open-questions.md). The bell is on unless the viewer turned it off.

const STORAGE_KEY = 'wetube:channel-notifications';
const listeners = new Set<() => void>();
let cache: Record<string, boolean> | undefined;

const read = (): Record<string, boolean> => {
  try {
    const parsed: unknown = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? '{}');
    if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) return {};
    return Object.fromEntries(Object.entries(parsed).filter((entry): entry is [string, boolean] => typeof entry[1] === 'boolean'));
  } catch {
    return {};
  }
};

/** Every channel's bell choice; the same object until it changes, as useSyncExternalStore requires. */
export const getChannelNotifications = (): Record<string, boolean> => (cache ??= read());

export const isChannelBellOn = (choices: Record<string, boolean>, channelAddress: string) => choices[channelAddress] ?? true;

export const setChannelBell = (channelAddress: string, on: boolean) => {
  cache = { ...getChannelNotifications(), [channelAddress]: on };
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(cache));
  } catch {
    // Not persisted; the bell still changes for this page.
  }
  for (const listener of listeners) listener();
};

export const subscribeChannelNotifications = (listener: () => void) => {
  listeners.add(listener);
  // Another tab changing a bell updates this one too.
  const onStorage = (event: StorageEvent) => {
    if (event.key !== STORAGE_KEY) return;
    cache = read();
    listener();
  };
  window.addEventListener('storage', onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener('storage', onStorage);
  };
};
