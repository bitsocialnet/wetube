import { describe, expect, it } from 'vitest';
import { formatCount, timeAgo } from '../format';
import { channelPath, getChannelAddressFromHandle, getChannelIdentifier, looksLikeChannelAddress, shortAddress, videoPath } from '../channels';

describe('timeAgo', () => {
  const now = 1_800_000_000_000;
  const en = { language: 'en', justNow: 'just now' };
  it('formats the largest whole unit', () => {
    expect(timeAgo(now / 1000 - 30, en, now)).toBe('just now');
    expect(timeAgo(now / 1000 - 3 * 3600, en, now)).toBe('3 hours ago');
    expect(timeAgo(now / 1000 - 24 * 3600, en, now)).toBe('yesterday');
    expect(timeAgo(now / 1000 - 15 * 24 * 3600, en, now)).toBe('2 weeks ago');
  });
  it('formats in the interface language', () => {
    expect(timeAgo(now / 1000 - 3 * 3600, { language: 'es', justNow: 'ahora' }, now)).toBe('hace 3 horas');
    expect(timeAgo(now / 1000 - 30, { language: 'es', justNow: 'ahora' }, now)).toBe('ahora');
  });
  it('returns nothing without a timestamp', () => {
    expect(timeAgo(undefined, en, now)).toBe('');
  });
});

describe('formatCount', () => {
  it('abbreviates large counts in the interface language', () => {
    expect(formatCount(12400, 'en')).toBe('12.4K');
    expect(formatCount(undefined, 'en')).toBe('0');
    expect(formatCount(12400, 'de')).toBe('12.400');
  });
});

describe('channel addresses', () => {
  it('uses a name for .bso addresses and a public key otherwise', () => {
    expect(getChannelIdentifier('alice.bso')).toEqual({ name: 'alice.bso' });
    expect(getChannelIdentifier('12D3KooWQt3UJ6A3AeZxJSFJnspVmYQK1Epj8VeSzrFG1tHiZC9o')).toEqual({
      name: 'videos-posting.bso',
      publicKey: '12D3KooWQt3UJ6A3AeZxJSFJnspVmYQK1Epj8VeSzrFG1tHiZC9o',
    });
    expect(getChannelIdentifier('12D3KooWAGHV9th2FN48KPvHMJwxen8h5mSM39pkaZWvvzcWMPr9')).toEqual({ publicKey: '12D3KooWAGHV9th2FN48KPvHMJwxen8h5mSM39pkaZWvvzcWMPr9' });
  });
  it('shortens public keys but not names', () => {
    expect(shortAddress('12D3KooWAGHV9th2FN48KPvHMJwxen8h5mSM39pkaZWvvzcWMPr9')).toBe('12D3KooW…MPr9');
    expect(shortAddress('alice.bso')).toBe('alice.bso');
  });
  it('routes channels as /@address and videos under them', () => {
    expect(channelPath('alice.bso')).toBe('/@alice.bso');
    expect(videoPath('alice.bso', 'QmCid')).toBe('/@alice.bso/v/QmCid');
    expect(getChannelAddressFromHandle('@alice.bso')).toBe('alice.bso');
    expect(getChannelAddressFromHandle('alice.bso')).toBeUndefined();
    expect(getChannelAddressFromHandle('@')).toBeUndefined();
  });
  it('tells channel addresses from search text', () => {
    expect(looksLikeChannelAddress('alice.bso')).toBe(true);
    expect(looksLikeChannelAddress('12D3KooWGrpURz4BR1EWChGnwmAavSLkW2ie6YWoj2dZE3XLU7bw')).toBe(true);
    expect(looksLikeChannelAddress('big buck bunny')).toBe(false);
    expect(looksLikeChannelAddress('sintel')).toBe(false);
    expect(looksLikeChannelAddress('v1.2 release')).toBe(false);
  });
});
