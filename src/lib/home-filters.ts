import type { CommentsFilter } from '@bitsocial/bitsocial-react-hooks';
import { getVideo, isPlayableVideoPost, type VideoComment } from './video-sources';

// Home page filters, kept in the URL so a filtered view can be shared. Duration is missing because video
// posts do not carry one yet (open-questions.md).
export const SORT_OPTIONS = [
  { value: 'hot', label: 'Popular' },
  { value: 'new', label: 'Upload date' },
  { value: 'active', label: 'Recent comments' },
  { value: 'topAll', label: 'Most liked' },
] as const;

export const DATE_OPTIONS = [
  { value: 'day', label: 'Today', seconds: 24 * 3600 },
  { value: 'week', label: 'This week', seconds: 7 * 24 * 3600 },
  { value: 'month', label: 'This month', seconds: 30 * 24 * 3600 },
  { value: 'year', label: 'This year', seconds: 365 * 24 * 3600 },
] as const;

export const SOURCE_OPTIONS = [
  { value: 'youtube', label: 'YouTube' },
  { value: 'peertube', label: 'PeerTube' },
  { value: 'vimeo', label: 'Vimeo' },
  { value: 'file', label: 'Video files' },
  { value: 'ipfs', label: 'IPFS' },
] as const;

export const FEATURE_OPTIONS = [{ value: 'mirrored', label: 'Mirrored (2+ sources)' }] as const;

export interface HomeFilters {
  sort: (typeof SORT_OPTIONS)[number]['value'];
  date?: (typeof DATE_OPTIONS)[number]['value'];
  source?: (typeof SOURCE_OPTIONS)[number]['value'];
  feature?: (typeof FEATURE_OPTIONS)[number]['value'];
  /** Text search over titles and descriptions. */
  query?: string;
  /** One channel's address, chosen with a chip. */
  channel?: string;
}

const pick = <T extends { value: string }>(options: readonly T[], value: string | null) =>
  options.find((option) => option.value === value)?.value as T['value'] | undefined;

export const readHomeFilters = (params: URLSearchParams): HomeFilters => ({
  sort: pick(SORT_OPTIONS, params.get('sort')) ?? 'hot',
  date: pick(DATE_OPTIONS, params.get('date')),
  source: pick(SOURCE_OPTIONS, params.get('source')),
  feature: pick(FEATURE_OPTIONS, params.get('feature')),
  query: params.get('q')?.trim() || undefined,
  channel: params.get('c') || undefined,
});

export const getNewerThanSeconds = (filters: HomeFilters) => DATE_OPTIONS.find((option) => option.value === filters.date)?.seconds;

const matchesSource = (comment: VideoComment, source: HomeFilters['source']) => {
  if (!source) return true;
  const sources = getVideo(comment)?.sources ?? [];
  if (source === 'ipfs') return sources.some((candidate) => candidate.label.startsWith('IPFS'));
  if (source === 'file') return sources.some((candidate) => candidate.kind === 'file' && !candidate.label.startsWith('IPFS'));
  return sources.some((candidate) => candidate.kind === source);
};

const matchesQuery = (comment: VideoComment, query: string | undefined) => {
  if (!query) return true;
  const video = getVideo(comment);
  const haystack = `${video?.title ?? ''}\n${video?.description ?? ''}`.toLowerCase();
  return query
    .toLowerCase()
    .split(/\s+/)
    .every((word) => haystack.includes(word));
};

/** The feed filter for the client-side filters. Its key changes with them, so cached feeds are rebuilt. */
export const getHomeFeedFilter = ({ source, feature, query }: Pick<HomeFilters, 'source' | 'feature' | 'query'>): CommentsFilter => ({
  key: `wetube-home-v1:${source ?? ''}:${feature ?? ''}:${query ?? ''}`,
  filter: (comment) =>
    isPlayableVideoPost(comment) &&
    matchesSource(comment, source) &&
    (feature !== 'mirrored' || (getVideo(comment)?.sources.length ?? 0) >= 2) &&
    matchesQuery(comment, query),
});

export const hasActiveFilters = (filters: HomeFilters) => Boolean(filters.date || filters.source || filters.feature || filters.sort !== 'hot');
