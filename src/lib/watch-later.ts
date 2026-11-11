// Videos saved to watch later, kept in this browser until accounts can sync them. Newest first.
export interface SavedVideo {
  cid: string;
  channelAddress: string;
  savedAt: number;
}

const STORAGE_KEY = 'wetube:watch-later';
const listeners = new Set<() => void>();
let cache: SavedVideo[] | undefined;

const isSavedVideo = (value: unknown): value is SavedVideo =>
  typeof value === 'object' &&
  value !== null &&
  typeof (value as SavedVideo).cid === 'string' &&
  typeof (value as SavedVideo).channelAddress === 'string' &&
  typeof (value as SavedVideo).savedAt === 'number';

const read = (): SavedVideo[] => {
  try {
    const parsed: unknown = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? '[]');
    return Array.isArray(parsed) ? parsed.filter(isSavedVideo) : [];
  } catch {
    return [];
  }
};

/** The saved list; the same array until it changes, as useSyncExternalStore requires. */
export const getWatchLater = (): SavedVideo[] => (cache ??= read());

const write = (videos: SavedVideo[]) => {
  cache = videos;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(videos));
  } catch {
    // Not persisted; the list still updates for this page.
  }
  for (const listener of listeners) listener();
};

export const toggleWatchLater = (video: Omit<SavedVideo, 'savedAt'>, now = Date.now()) => {
  const videos = getWatchLater();
  write(videos.some((saved) => saved.cid === video.cid) ? videos.filter((saved) => saved.cid !== video.cid) : [{ ...video, savedAt: now }, ...videos]);
};

export const subscribeWatchLater = (listener: () => void) => {
  listeners.add(listener);
  // Another tab saving a video updates this one too.
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
