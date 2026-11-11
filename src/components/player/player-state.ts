import type { VideoSource } from '../../lib/video-sources';

export interface PlayerState {
  selectedIndex: number;
  /** playUrl of every source that failed, so it is skipped and marked in the switcher. */
  failedUrls: string[];
}

export type PlayerAction = { type: 'select'; index: number; playUrl: string } | { type: 'fail'; playUrl: string; sources: VideoSource[] };

export const initialPlayerState: PlayerState = { selectedIndex: 0, failedUrls: [] };

export const playerReducer = (state: PlayerState, action: PlayerAction): PlayerState => {
  if (action.type === 'select') {
    // Choosing a source, failed or not, plays it again.
    return { selectedIndex: action.index, failedUrls: state.failedUrls.filter((url) => url !== action.playUrl) };
  }
  if (state.failedUrls.includes(action.playUrl)) return state;
  const failedUrls = [...state.failedUrls, action.playUrl];
  // Only a failure of the source on screen moves the player; a late report about another source does not.
  if (action.sources[state.selectedIndex]?.playUrl !== action.playUrl) return { ...state, failedUrls };
  const nextIndex = action.sources.findIndex((source) => !failedUrls.includes(source.playUrl));
  return { selectedIndex: nextIndex === -1 ? state.selectedIndex : nextIndex, failedUrls };
};
