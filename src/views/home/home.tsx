import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useFeed } from '@bitsocial/bitsocial-react-hooks';
import { SlidersHorizontal, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
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
  type HomeFilters,
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

const labeled = <V extends string>(options: readonly { value: V }[], labels: Record<V, string>) => options.map(({ value }) => ({ value, label: labels[value] }));

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
  const { t } = useTranslation();
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

  const sortLabels: Record<HomeFilters['sort'], string> = { hot: t('popular'), new: t('upload_date'), active: t('recent_comments'), topAll: t('most_liked') };
  const dateLabels: Record<NonNullable<HomeFilters['date']>, string> = { day: t('today'), week: t('this_week'), month: t('this_month'), year: t('this_year') };
  const sourceLabels: Record<NonNullable<HomeFilters['source']>, string> = {
    youtube: 'YouTube',
    peertube: 'PeerTube',
    vimeo: 'Vimeo',
    file: t('video_files'),
    ipfs: 'IPFS',
  };
  const featureLabels: Record<NonNullable<HomeFilters['feature']>, string> = { mirrored: t('mirrored_sources') };

  return (
    <>
      <h1 className='visually-hidden'>{filters.query ? t('search_results_for', { query: filters.query }) : t('wetube_home')}</h1>
      <div className={styles.toolbar}>
        <button type='button' className={styles.filtersButton} aria-expanded={filtersOpen} aria-controls='home-filters' onClick={() => setFiltersOpen(!filtersOpen)}>
          <SlidersHorizontal size={18} aria-hidden='true' />
          {t('filters')}
          {hasActiveFilters(filters) && <span className={styles.activeDot} aria-label={t('filters_active')} />}
        </button>
        <div className={styles.chips} role='group' aria-label={t('categories')}>
          <button type='button' className={styles.chip} aria-pressed={!filters.channel} onClick={() => setParam('c', undefined)}>
            {t('all')}
          </button>
          {HOME_CHANNELS.map((channel) => (
            <ChannelChip key={channel.address} channel={channel} selected={filters.channel === channel.address} onSelect={() => setParam('c', channel.address)} />
          ))}
        </div>
      </div>
      {filtersOpen && (
        <div id='home-filters' className={styles.filters}>
          <FilterGroup title={t('upload_date')} param='date' options={labeled(DATE_OPTIONS, dateLabels)} selected={filters.date} onChange={setParam} />
          <FilterGroup title={t('source')} param='source' options={labeled(SOURCE_OPTIONS, sourceLabels)} selected={filters.source} onChange={setParam} />
          <FilterGroup title={t('features')} param='feature' options={labeled(FEATURE_OPTIONS, featureLabels)} selected={filters.feature} onChange={setParam} />
          <FilterGroup
            title={t('sort_by')}
            param='sort'
            options={labeled(SORT_OPTIONS, sortLabels)}
            selected={filters.sort}
            onChange={(param, value) => setParam(param, value === 'hot' ? undefined : (value ?? undefined))}
          />
          {hasActiveFilters(filters) && (
            <button type='button' className={styles.clearFilters} onClick={clearFilters}>
              {t('clear_filters')}
            </button>
          )}
        </div>
      )}
      {filters.query && (
        <p className={styles.searchStatus}>
          {t('results_for', { query: filters.query })}
          <button type='button' className={styles.clearSearch} onClick={() => setParam('q', undefined)} aria-label={t('clear_search')}>
            <X size={16} aria-hidden='true' />
          </button>
        </p>
      )}
      <VideoGrid
        key={`${filters.channel ?? 'all'}:${filters.sort}:${filters.date ?? ''}:${feedFilter.key}`}
        posts={feed}
        hasMore={hasMore}
        loadMore={loadMore}
        emptyMessage={filters.query || hasActiveFilters(filters) ? t('no_videos_match') : t('no_videos_yet')}
      />
    </>
  );
};

export default Home;
