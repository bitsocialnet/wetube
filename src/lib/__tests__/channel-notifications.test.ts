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

describe('channel notifications', () => {
  beforeEach(() => {
    store.clear();
    vi.resetModules();
  });

  it('keeps the bell on until the viewer turns it off, per channel', async () => {
    const { getChannelNotifications, isChannelBellOn, setChannelBell } = await import('../channel-notifications');
    expect(isChannelBellOn(getChannelNotifications(), 'alice.bso')).toBe(true);
    setChannelBell('alice.bso', false);
    expect(isChannelBellOn(getChannelNotifications(), 'alice.bso')).toBe(false);
    expect(isChannelBellOn(getChannelNotifications(), 'bob.bso')).toBe(true);
    expect(getChannelNotifications()).toBe(getChannelNotifications());
    expect(JSON.parse(store.get('wetube:channel-notifications') ?? '{}')).toEqual({ 'alice.bso': false });
  });

  it('ignores stored values that are not booleans', async () => {
    store.set('wetube:channel-notifications', JSON.stringify({ 'alice.bso': false, 'bob.bso': 'off' }));
    const { getChannelNotifications } = await import('../channel-notifications');
    expect(getChannelNotifications()).toEqual({ 'alice.bso': false });
  });
});
