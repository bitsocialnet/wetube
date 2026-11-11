import { describe, expect, it } from 'vitest';
import { getHomeFeedFilter, getNewerThanSeconds, hasActiveFilters, readHomeFilters } from '../home-filters';

const sintel = {
  title: 'Sintel',
  link: 'https://www.youtube.com/watch?v=SintelBlock',
  content:
    'A girl searches for her dragon.\n\nMirrors:\nhttps://video.blender.org/w/2PcJe5aZqozRvH7MJ8BTmC\nipfs://bafybeidku5tz3hiv5facncsakrmbrmkngleo3ipnkuceopx4cnzjzkcdui',
};
const clip = { title: 'Kangaroo and dog', link: 'https://files.example.org/clip.mp4' };

describe('readHomeFilters', () => {
  it('reads known values and ignores unknown ones', () => {
    const filters = readHomeFilters(new URLSearchParams('sort=new&date=week&source=peertube&feature=mirrored&q=%20dragon%20&c=alice.bso&bogus=1'));
    expect(filters).toEqual({ sort: 'new', date: 'week', source: 'peertube', feature: 'mirrored', query: 'dragon', channel: 'alice.bso' });
    expect(readHomeFilters(new URLSearchParams('sort=views&date=decade'))).toEqual({
      sort: 'hot',
      date: undefined,
      source: undefined,
      feature: undefined,
      query: undefined,
      channel: undefined,
    });
  });

  it('maps the date filter to a feed time window and tells when filters are set', () => {
    expect(getNewerThanSeconds(readHomeFilters(new URLSearchParams('date=day')))).toBe(86400);
    expect(hasActiveFilters(readHomeFilters(new URLSearchParams('q=dragon')))).toBe(false);
    expect(hasActiveFilters(readHomeFilters(new URLSearchParams('sort=new')))).toBe(true);
  });
});

describe('getHomeFeedFilter', () => {
  const keep = (params: string) =>
    [sintel, clip].filter((post) => getHomeFeedFilter(readHomeFilters(new URLSearchParams(params))).filter(post)).map((post) => post.title);

  it('filters by source kind, telling IPFS from other files', () => {
    expect(keep('source=peertube')).toEqual(['Sintel']);
    expect(keep('source=ipfs')).toEqual(['Sintel']);
    expect(keep('source=file')).toEqual(['Kangaroo and dog']);
  });

  it('keeps mirrored videos and matches every search word in the title or description', () => {
    expect(keep('feature=mirrored')).toEqual(['Sintel']);
    expect(keep('q=girl%20DRAGON')).toEqual(['Sintel']);
    expect(keep('q=dragon%20bunny')).toEqual([]);
  });

  it('changes its key with the filters', () => {
    expect(getHomeFeedFilter(readHomeFilters(new URLSearchParams('q=a'))).key).not.toBe(getHomeFeedFilter(readHomeFilters(new URLSearchParams('q=b'))).key);
  });
});
