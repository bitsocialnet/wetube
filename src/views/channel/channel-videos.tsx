import { useState } from 'react';
import { useFeed, type CommunityIdentifier } from '@bitsocial/bitsocial-react-hooks';
import { useTranslation } from 'react-i18next';
import { VideoGrid } from '../../components/video-grid';
import { videoPostsFilter } from '../../lib/video-sources';
import styles from './channel.module.css';

// YouTube's Latest and Popular. Popular ranks by likes until view counts exist; pkc-js has no oldest-first
// post sort, so YouTube's Oldest is left out.
const SORTS = ['new', 'topAll'] as const;
type Sort = (typeof SORTS)[number];

interface ChannelVideosProps {
  channelAddress: string;
  communities: CommunityIdentifier[];
}

/** The Videos tab: every video of the channel, and nothing else it posts. */
export const ChannelVideos = ({ channelAddress, communities }: ChannelVideosProps) => {
  const { t } = useTranslation();
  const labels: Record<Sort, string> = { new: t('latest'), topAll: t('popular') };
  const [sort, setSort] = useState<Sort>('new');
  const { feed, hasMore, loadMore } = useFeed({ communities, sortType: sort, postsPerPage: 24, filter: videoPostsFilter });

  return (
    <>
      <div className={styles.chips} role='group' aria-label={t('sort_videos')}>
        {SORTS.map((option) => (
          <button key={option} type='button' className={styles.chip} aria-pressed={sort === option} onClick={() => setSort(option)}>
            {labels[option]}
          </button>
        ))}
      </div>
      <VideoGrid key={`${channelAddress}:${sort}`} posts={feed} hasMore={hasMore} loadMore={loadMore} showChannel={false} emptyMessage={t('channel_no_videos')} />
    </>
  );
};
