import { useState } from 'react';
import { useFeed, type CommunityIdentifier } from '@bitsocial/bitsocial-react-hooks';
import { VideoGrid } from '../../components/video-grid';
import { videoPostsFilter } from '../../lib/video-sources';
import styles from './channel.module.css';

// YouTube's Latest and Popular. Popular ranks by likes until view counts exist; pkc-js has no oldest-first
// post sort, so YouTube's Oldest is left out.
const SORTS = [
  { value: 'new', label: 'Latest' },
  { value: 'topAll', label: 'Popular' },
] as const;
type Sort = (typeof SORTS)[number]['value'];

interface ChannelVideosProps {
  channelAddress: string;
  communities: CommunityIdentifier[];
}

/** The Videos tab: every video of the channel, and nothing else it posts. */
export const ChannelVideos = ({ channelAddress, communities }: ChannelVideosProps) => {
  const [sort, setSort] = useState<Sort>('new');
  const { feed, hasMore, loadMore } = useFeed({ communities, sortType: sort, postsPerPage: 24, filter: videoPostsFilter });

  return (
    <>
      <div className={styles.chips} role='group' aria-label='Sort videos'>
        {SORTS.map((option) => (
          <button key={option.value} type='button' className={styles.chip} aria-pressed={sort === option.value} onClick={() => setSort(option.value)}>
            {option.label}
          </button>
        ))}
      </div>
      <VideoGrid
        key={`${channelAddress}:${sort}`}
        posts={feed}
        hasMore={hasMore}
        loadMore={loadMore}
        showChannel={false}
        emptyMessage='This channel has no videos yet.'
      />
    </>
  );
};
