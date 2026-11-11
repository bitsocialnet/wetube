import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useFeed } from '@bitsocial/bitsocial-react-hooks';
import { SlidersHorizontal, X } from 'lucide-react';
import { VideoGrid } from '../../components/video-grid';
import { HOME_CHANNELS, type ChannelListing } from '../../data/channels';
import { useChannel } from '../../hooks/use-channel';
import { getChannelIdentifier, HOME_COMMUNITIES, shortAddress } from '../../lib/channels';
import {
  DATE_OPTIONS,
  FEATURE_OPTIONS,
  getHomeFeedFilter,
  getNewerThanSeconds,
  hasActiveFilters,
  readHomeFilters,
  SORT_OPTIONS,
  SOURCE_OPTIONS,
} from '../../lib/home-filters';
import styles from './home.module.css';

// Chips will be the categories (community lists, BSIP-15); until those exist there is one per home channel.
const ChannelChip = ({ channel, selected, onSelect }: { channel: ChannelListing; selected: boolean; onSelect: () => void }) => {
  const community = useChannel(channel.address, { onlyIfCached: true });
  return (
    <button type='button' className={styles.chip} aria-pressed={selected} onClick={onSelect}>
      {community.title || shortAddress(channel.address)}
    </button>
  );
};

interface FilterGroupProps {
  title: string;
  param: string;
  options: readonly { value: string; label: string }[];
  selected: string | undefined;
  onChange: (param: string, value: string | undefined) => void;
}

const FilterGroup = ({ title, param, options, selected, onChange }: FilterGroupProps) => (
  <div className={styles.filterGroup} role='group' aria-label={title}>
    <h2 className={styles.filterTitle}>{title}</h2>
    {options.map((option) => (
      <button
        key={option.value}
        type='button'
        className={styles.filterOption}
        aria-pressed={selected === option.value}
        onClick={() => onChange(param, selected === option.value ? undefined : option.value)}
      >
        {option.label}
      </button>
    ))}
  </div>
);

const Home = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [filtersOpen, setFiltersOpen] = useState(false);
  const filters = readHomeFilters(searchParams);
  const communities = useMemo(() => (filters.channel ? [getChannelIdentifier(filters.channel)] : HOME_COMMUNITIES), [filters.channel]);
  const { source, feature, query } = filters;
  const feedFilter = useMemo(() => getHomeFeedFilter({ source, feature, query }), [source, feature, query]);
  const { feed, hasMore, loadMore } = useFeed({ communities, sortType: filters.sort, newerThan: getNewerThanSeconds(filters), postsPerPage: 24, filter: feedFilter });

  const setParam = (param: string, value: string | undefined) =>
    setSearchParams((current) => {
      const next = new URLSearchParams(current);
      if (value) next.set(param, value);
      else next.delete(param);
      return next;
    });
  const clearFilters = () =>
    setSearchParams((current) => {
      const next = new URLSearchParams(current);
      for (const param of ['sort', 'date', 'source', 'feature']) next.delete(param);
      return next;
    });

  return (
    <>
      <h1 className='visually-hidden'>{filters.query ? `Search results for ${filters.query}` : 'WeTube home'}</h1>
      <div className={styles.toolbar}>
        <button type='button' className={styles.filtersButton} aria-expanded={filtersOpen} aria-controls='home-filters' onClick={() => setFiltersOpen(!filtersOpen)}>
          <SlidersHorizontal size={18} aria-hidden='true' />
          Filters
          {hasActiveFilters(filters) && <span className={styles.activeDot} aria-label='(active)' />}
        </button>
        <div className={styles.chips} role='group' aria-label='Categories'>
          <button type='button' className={styles.chip} aria-pressed={!filters.channel} onClick={() => setParam('c', undefined)}>
            All
          </button>
          {HOME_CHANNELS.map((channel) => (
            <ChannelChip key={channel.address} channel={channel} selected={filters.channel === channel.address} onSelect={() => setParam('c', channel.address)} />
          ))}
        </div>
      </div>
      {filtersOpen && (
        <div id='home-filters' className={styles.filters}>
          <FilterGroup title='Upload date' param='date' options={DATE_OPTIONS} selected={filters.date} onChange={setParam} />
          <FilterGroup title='Source' param='source' options={SOURCE_OPTIONS} selected={filters.source} onChange={setParam} />
          <FilterGroup title='Features' param='feature' options={FEATURE_OPTIONS} selected={filters.feature} onChange={setParam} />
          <FilterGroup
            title='Sort by'
            param='sort'
            options={SORT_OPTIONS}
            selected={filters.sort}
            onChange={(param, value) => setParam(param, value === 'hot' ? undefined : (value ?? undefined))}
          />
          {hasActiveFilters(filters) && (
            <button type='button' className={styles.clearFilters} onClick={clearFilters}>
              Clear filters
            </button>
          )}
        </div>
      )}
      {filters.query && (
        <p className={styles.searchStatus}>
          Results for “{filters.query}”
          <button type='button' className={styles.clearSearch} onClick={() => setParam('q', undefined)} aria-label='Clear search'>
            <X size={16} aria-hidden='true' />
          </button>
        </p>
      )}
      <VideoGrid
        key={`${filters.channel ?? 'all'}:${filters.sort}:${filters.date ?? ''}:${feedFilter.key}`}
        posts={feed}
        hasMore={hasMore}
        loadMore={loadMore}
        emptyMessage={filters.query || hasActiveFilters(filters) ? 'No videos match.' : 'No videos yet.'}
      />
    </>
  );
};

export default Home;
