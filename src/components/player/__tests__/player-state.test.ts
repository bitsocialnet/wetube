import { describe, expect, it } from 'vitest';
import { parseVideoSource, type VideoSource } from '../../../lib/video-sources';
import { initialPlayerState, playerReducer } from '../player-state';

const sources = [
  'https://www.youtube.com/watch?v=SintelBlock',
  'https://video.blender.org/w/2PcJe5aZqozRvH7MJ8BTmC',
  'https://archive.org/download/Sintel/sintel.mp4',
].map((url) => parseVideoSource(url) as VideoSource);

describe('playerReducer', () => {
  it('moves to the next source that has not failed when the one on screen fails', () => {
    const state = playerReducer(initialPlayerState, { type: 'fail', playUrl: sources[0].playUrl, sources });
    expect(state).toEqual({ selectedIndex: 1, failedUrls: [sources[0].playUrl] });
    expect(playerReducer(state, { type: 'fail', playUrl: sources[1].playUrl, sources })).toEqual({
      selectedIndex: 2,
      failedUrls: [sources[0].playUrl, sources[1].playUrl],
    });
  });

  it('records a late failure of another source without switching away from the one on screen', () => {
    const state = playerReducer(initialPlayerState, { type: 'fail', playUrl: sources[2].playUrl, sources });
    expect(state).toEqual({ selectedIndex: 0, failedUrls: [sources[2].playUrl] });
  });

  it('stays put when every source failed, and retries a failed source the viewer picks', () => {
    let state = initialPlayerState;
    for (const source of sources) state = playerReducer(state, { type: 'fail', playUrl: source.playUrl, sources });
    expect(state).toEqual({ selectedIndex: 2, failedUrls: sources.map((source) => source.playUrl) });
    const retried = playerReducer(state, { type: 'select', index: 0, playUrl: sources[0].playUrl });
    expect(retried).toEqual({ selectedIndex: 0, failedUrls: [sources[1].playUrl, sources[2].playUrl] });
  });

  it('ignores a repeated failure report', () => {
    const state = playerReducer(initialPlayerState, { type: 'fail', playUrl: sources[0].playUrl, sources });
    expect(playerReducer(state, { type: 'fail', playUrl: sources[0].playUrl, sources })).toBe(state);
  });
});
