import { beforeEach, describe, expect, it, vi } from 'vitest';

// A minimal localStorage and window for the Node test environment.
const store = new Map<string, string>();
vi.stubGlobal('window', {
  localStorage: {
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, value: string) => void store.set(key, value),
  },
  addEventListener: () => undefined,
  removeEventListener: () => undefined,
});

describe('watch later', () => {
  beforeEach(() => {
    store.clear();
    vi.resetModules();
  });

  it('saves newest first, removes on a second toggle and keeps the same array between changes', async () => {
    const { getWatchLater, toggleWatchLater } = await import('../watch-later');
    toggleWatchLater({ cid: 'QmA', channelAddress: 'alice.bso' }, 1);
    toggleWatchLater({ cid: 'QmB', channelAddress: 'bob.bso' }, 2);
    expect(getWatchLater().map((video) => video.cid)).toEqual(['QmB', 'QmA']);
    expect(getWatchLater()).toBe(getWatchLater());
    toggleWatchLater({ cid: 'QmA', channelAddress: 'alice.bso' }, 3);
    expect(getWatchLater()).toEqual([{ cid: 'QmB', channelAddress: 'bob.bso', savedAt: 2 }]);
    expect(JSON.parse(store.get('wetube:watch-later') ?? '[]')).toHaveLength(1);
  });

  it('ignores malformed stored data', async () => {
    store.set('wetube:watch-later', JSON.stringify([{ cid: 'QmA' }, 'junk', { cid: 'QmB', channelAddress: 'x', savedAt: 1 }]));
    const { getWatchLater } = await import('../watch-later');
    expect(getWatchLater()).toEqual([{ cid: 'QmB', channelAddress: 'x', savedAt: 1 }]);
  });

  it('notifies subscribers on change', async () => {
    const { subscribeWatchLater, toggleWatchLater } = await import('../watch-later');
    const listener = vi.fn();
    const unsubscribe = subscribeWatchLater(listener);
    toggleWatchLater({ cid: 'QmA', channelAddress: 'alice.bso' });
    expect(listener).toHaveBeenCalledTimes(1);
    unsubscribe();
    toggleWatchLater({ cid: 'QmA', channelAddress: 'alice.bso' });
    expect(listener).toHaveBeenCalledTimes(1);
  });
});
