import { describe, expect, it } from 'vitest';
import { getVideo, getVideoSources, isPlayableVideoPost, parseVideoSource, splitVideoContent } from '../video-sources';

describe('parseVideoSource', () => {
  it('embeds YouTube watch, short, shorts and live links through youtube-nocookie', () => {
    for (const url of [
      'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      'https://youtu.be/dQw4w9WgXcQ?t=10',
      'https://m.youtube.com/shorts/dQw4w9WgXcQ',
      'https://www.youtube.com/live/dQw4w9WgXcQ',
    ]) {
      expect(parseVideoSource(url)).toMatchObject({
        kind: 'youtube',
        playUrl: 'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ',
        thumbnailUrl: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg',
      });
    }
  });

  it('keeps an Invidious mirror on its own instance', () => {
    expect(parseVideoSource('https://yewtu.be/watch?v=dQw4w9WgXcQ')).toMatchObject({ kind: 'youtube', playUrl: 'https://yewtu.be/embed/dQw4w9WgXcQ', label: 'yewtu.be' });
  });

  it('rejects YouTube channel, playlist and malformed links', () => {
    expect(parseVideoSource('https://www.youtube.com/@somechannel')).toBeUndefined();
    expect(parseVideoSource('https://www.youtube.com/playlist?list=PL123')).toBeUndefined();
    expect(parseVideoSource('https://www.youtube.com/watch?v=short')).toBeUndefined();
  });

  it('embeds Vimeo, keeping the privacy hash of unlisted videos', () => {
    expect(parseVideoSource('https://vimeo.com/76979871')?.playUrl).toBe('https://player.vimeo.com/video/76979871?dnt=1');
    expect(parseVideoSource('https://vimeo.com/76979871/abc123')?.playUrl).toBe('https://player.vimeo.com/video/76979871?dnt=1&h=abc123');
  });

  it('embeds Odysee, Bitchute and Streamable', () => {
    expect(parseVideoSource('https://odysee.com/@chan:1/my-video:2')?.playUrl).toBe('https://odysee.com/$/embed/@chan:1/my-video:2');
    expect(parseVideoSource('https://www.bitchute.com/video/AbC123/')?.playUrl).toBe('https://www.bitchute.com/embed/AbC123/');
    expect(parseVideoSource('https://streamable.com/xyz12')?.playUrl).toBe('https://streamable.com/e/xyz12');
    expect(parseVideoSource('https://odysee.com/$/discover')).toBeUndefined();
  });

  it('plays direct video files and ipfs:// links in a video element', () => {
    expect(parseVideoSource('https://files.example.org/clip.WEBM')).toMatchObject({
      kind: 'file',
      playUrl: 'https://files.example.org/clip.WEBM',
      label: 'files.example.org',
    });
    expect(parseVideoSource('ipfs://bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi/video.mp4')).toMatchObject({
      kind: 'file',
      label: 'IPFS',
      playUrl: 'https://ipfs.io/ipfs/bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi/video.mp4',
    });
    expect(parseVideoSource('https://cdn.example.org/stream', { linkHtmlTagName: 'video' })?.kind).toBe('file');
  });

  it('ignores pages it cannot play', () => {
    expect(parseVideoSource('https://v.redd.it/abc123')).toBeUndefined();
    expect(parseVideoSource('https://example.org/article')).toBeUndefined();
    expect(parseVideoSource('javascript:alert(1)')).toBeUndefined();
    expect(parseVideoSource('not a url')).toBeUndefined();
  });
});

describe('splitVideoContent', () => {
  it('separates the description from the mirror list', () => {
    const content = 'How the source list works.\n\nMirrors:\n- https://vimeo.com/76979871\n* <https://yewtu.be/watch?v=dQw4w9WgXcQ>.\n\nThanks for watching.';
    expect(splitVideoContent(content)).toEqual({
      description: 'How the source list works.\n\n\nThanks for watching.',
      mirrorUrls: ['https://vimeo.com/76979871', 'https://yewtu.be/watch?v=dQw4w9WgXcQ'],
    });
  });

  it('accepts a markdown heading and stops at the first line without a URL', () => {
    expect(splitVideoContent('## Sources\n\nhttps://a.example/v.mp4\nnot a link\nhttps://b.example/v.mp4').mirrorUrls).toEqual(['https://a.example/v.mp4']);
  });

  it('keeps content without a mirror heading as the description', () => {
    expect(splitVideoContent('  Just a description https://youtu.be/dQw4w9WgXcQ  ')).toEqual({
      description: 'Just a description https://youtu.be/dQw4w9WgXcQ',
      mirrorUrls: [],
    });
  });
});

describe('getVideoSources and getVideo', () => {
  const post = {
    title: '  Redundant embeds  ',
    link: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    content: 'Description\n\nMirrors:\nhttps://youtu.be/dQw4w9WgXcQ\nhttps://vimeo.com/76979871\nhttps://example.org/not-a-video',
  };

  it('puts the post link first and drops duplicate and unplayable mirrors', () => {
    expect(getVideoSources(post).map((source) => source.label)).toEqual(['youtube.com', 'vimeo.com']);
  });

  it('builds the video with a trimmed title and a thumbnail from the first source that has one', () => {
    expect(getVideo(post)).toMatchObject({ title: 'Redundant embeds', description: 'Description', thumbnailUrl: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg' });
  });

  it('falls back to the first description line for the title', () => {
    expect(getVideo({ content: '\nFirst line\nSecond line', link: 'https://streamable.com/xyz12' })?.title).toBe('First line');
  });

  it('treats removed, deleted and source-less posts as not playable', () => {
    expect(isPlayableVideoPost(post)).toBe(true);
    expect(isPlayableVideoPost({ ...post, removed: true })).toBe(false);
    expect(isPlayableVideoPost({ ...post, deleted: true })).toBe(false);
    expect(isPlayableVideoPost({ title: 'Text post', content: 'No video here' })).toBe(false);
  });
});
