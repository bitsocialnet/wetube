import type { VideoSource } from '../../lib/video-sources';

export interface PlayerState {
  selectedIndex: number;
  /** playUrl of every source that failed, so it is skipped and marked in the switcher. */
  failedUrls: string[];
  /** playUrl of every source its host confirmed is still there. */
  availableUrls: string[];
}

export type PlayerAction =
  | { type: 'select'; index: number; playUrl: string }
  | { type: 'fail'; playUrl: string; sources: VideoSource[] }
  | { type: 'available'; playUrl: string };

export type SourceStatus = 'playing' | 'online' | 'offline' | 'unchecked';

export const initialPlayerState: PlayerState = { selectedIndex: 0, failedUrls: [], availableUrls: [] };

export const playerReducer = (state: PlayerState, action: PlayerAction): PlayerState => {
  if (action.type === 'select') {
    // Choosing a source, failed or not, plays it again.
    return { ...state, selectedIndex: action.index, failedUrls: state.failedUrls.filter((url) => url !== action.playUrl) };
  }
  if (action.type === 'available') {
    if (state.availableUrls.includes(action.playUrl) || state.failedUrls.includes(action.playUrl)) return state;
    return { ...state, availableUrls: [...state.availableUrls, action.playUrl] };
  }
  if (state.failedUrls.includes(action.playUrl)) return state;
  const failedUrls = [...state.failedUrls, action.playUrl];
  // A host can confirm a video that then fails to play; the failure wins.
  const availableUrls = state.availableUrls.filter((url) => url !== action.playUrl);
  // Only a failure of the source on screen moves the player; a late report about another source does not.
  if (action.sources[state.selectedIndex]?.playUrl !== action.playUrl) return { ...state, failedUrls, availableUrls };
  const nextIndex = action.sources.findIndex((source) => !failedUrls.includes(source.playUrl));
  return { selectedIndex: nextIndex === -1 ? state.selectedIndex : nextIndex, failedUrls, availableUrls };
};

export const getSourceStatus = (state: PlayerState, sources: VideoSource[], index: number): SourceStatus => {
  const playUrl = sources[index]?.playUrl;
  if (!playUrl || state.failedUrls.includes(playUrl)) return 'offline';
  if (index === state.selectedIndex) return 'playing';
  return state.availableUrls.includes(playUrl) ? 'online' : 'unchecked';
};
