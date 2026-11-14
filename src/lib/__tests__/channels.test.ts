import { describe, expect, it } from 'vitest';
import { channelSearchPath, channelSectionPath, getChannelSection, getScrollPage, postPath } from '../channels';

describe('channel sections', () => {
  it('maps route segments to sections and rejects others', () => {
    expect(getChannelSection(undefined)).toBe('home');
    expect(getChannelSection('videos')).toBe('videos');
    expect(getChannelSection('search')).toBe('search');
    expect(getChannelSection('shorts')).toBeUndefined();
  });

  it('builds tab, search and post paths from the exact address', () => {
    expect(channelSectionPath('alice.bso', 'home')).toBe('/@alice.bso');
    expect(channelSectionPath('alice.bso', 'posts')).toBe('/@alice.bso/posts');
    expect(channelSearchPath('alice.bso', 'big buck')).toBe('/@alice.bso/search?query=big+buck');
    expect(postPath('alice.bso', 'QmPost')).toBe('/@alice.bso/post/QmPost');
  });
});

describe('getScrollPage', () => {
  it("treats a channel's tabs as one page and everything else by its path", () => {
    expect(getScrollPage('/@alice.bso')).toBe('/@alice.bso');
    expect(getScrollPage('/@alice.bso/videos')).toBe('/@alice.bso');
    expect(getScrollPage('/@alice.bso/search')).toBe('/@alice.bso');
    expect(getScrollPage('/@alice.bso/v/QmVideo')).toBe('/@alice.bso/v/QmVideo');
    expect(getScrollPage('/@alice.bso/post/QmPost')).toBe('/@alice.bso/post/QmPost');
    expect(getScrollPage('/feed/watch-later')).toBe('/feed/watch-later');
  });
});
