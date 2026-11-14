import { describe, expect, it } from 'vitest';
import { getFeedPostMedia, getKnownVideoCount, isFeedPost, matchesChannelSearch } from '../channel-posts';

const video = {
  cid: 'QmVideo',
  title: 'Big Buck Bunny',
  link: 'https://www.youtube.com/watch?v=aqz-KE-bpKQ',
  content: 'A rabbit.\n\nMirrors:\nhttps://vimeo.com/1084537',
};
const textPost = { cid: 'QmText', title: 'New video on Friday', content: 'The next film is almost done.' };
const imagePost = { cid: 'QmImage', content: 'Behind the scenes', link: 'https://example.com/still.png' };
const articlePost = { cid: 'QmLink', content: 'Read this', link: 'https://example.com/blog/post', thumbnailUrl: 'https://example.com/thumb.jpg' };

describe('isFeedPost', () => {
  it('treats a post with a playable source as a video and every other post as a feed post', () => {
    expect(isFeedPost(video)).toBe(false);
    expect(isFeedPost(textPost)).toBe(true);
    expect(isFeedPost(imagePost)).toBe(true);
    expect(isFeedPost(articlePost)).toBe(true);
  });

  it('leaves out removed and deleted posts', () => {
    expect(isFeedPost({ ...textPost, removed: true })).toBe(false);
    expect(isFeedPost({ ...textPost, deleted: true })).toBe(false);
  });
});

describe('getFeedPostMedia', () => {
  it('shows image links as images and other links as link cards', () => {
    expect(getFeedPostMedia(imagePost)).toEqual({ kind: 'image', url: 'https://example.com/still.png', host: 'example.com', thumbnailUrl: undefined });
    expect(getFeedPostMedia({ ...articlePost, linkHtmlTagName: 'img' })?.kind).toBe('image');
    expect(getFeedPostMedia(articlePost)).toEqual({
      kind: 'link',
      url: 'https://example.com/blog/post',
      host: 'example.com',
      thumbnailUrl: 'https://example.com/thumb.jpg',
    });
  });

  it('ignores missing, malformed and non-http links', () => {
    expect(getFeedPostMedia(textPost)).toBeUndefined();
    expect(getFeedPostMedia({ link: 'not a url' })).toBeUndefined();
    expect(getFeedPostMedia({ link: 'javascript:alert(1)' })).toBeUndefined();
  });
});

describe('matchesChannelSearch', () => {
  it('matches every word of the query in the title or description, ignoring case', () => {
    expect(matchesChannelSearch(video, 'bunny')).toBe(true);
    expect(matchesChannelSearch(video, 'RABBIT buck')).toBe(true);
    expect(matchesChannelSearch(textPost, 'next friday')).toBe(true);
    expect(matchesChannelSearch(textPost, 'next sunday')).toBe(false);
  });

  it("does not search a video's mirror list, empty queries or removed posts", () => {
    expect(matchesChannelSearch(video, 'vimeo')).toBe(false);
    expect(matchesChannelSearch(video, '   ')).toBe(false);
    expect(matchesChannelSearch({ ...video, removed: true }, 'bunny')).toBe(false);
  });
});

describe('getKnownVideoCount', () => {
  it('counts the videos of a channel whose preloaded page holds every post', () => {
    expect(getKnownVideoCount({ pages: { hot: { comments: [video, textPost, { ...video, cid: 'QmVideo2' }, { ...video, cid: 'QmGone', removed: true }] } } })).toBe(2);
  });

  it('is zero for a channel without posts and unknown when more pages exist', () => {
    expect(getKnownVideoCount({ pages: {}, pageCids: {} })).toBe(0);
    expect(getKnownVideoCount({ pages: { hot: { comments: [video], nextCid: 'QmNext' } } })).toBeUndefined();
    expect(getKnownVideoCount({ pages: {}, pageCids: { new: 'QmPage' } })).toBeUndefined();
    expect(getKnownVideoCount(undefined)).toBeUndefined();
  });
});
