import { useSyncExternalStore } from 'react';
import { getWatchLater, subscribeWatchLater, type SavedVideo } from '../lib/watch-later';

/** The videos saved to watch later in this browser, newest first. */
export const useWatchLater = (): SavedVideo[] => useSyncExternalStore(subscribeWatchLater, getWatchLater);
