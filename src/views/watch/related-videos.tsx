import { useMemo, useState } from 'react';
import { useFeed } from '@bitsocial/bitsocial-react-hooks';
import { VideoCard } from '../../components/video-card';
import { getChannelIdentifier, HOME_COMMUNITIES } from '../../lib/channels';
import { videoPostsFilter } from '../../lib/video-sources';
import styles from './watch.module.css';

const PAGE_SIZE = 20;

interface RelatedVideosProps {
  channelAddress: string;
  channelTitle: string;
  videoCid: string;
}

/**
 * The column next to the player. "All" ranks videos from the home channels (the categories, once they
 * exist) and "From <channel>" lists the channel's newest videos. A recommendation provider will add
 * its own related videos here (curation-and-discovery.md); without one, this is what WeTube shows.
 */
export const RelatedVideos = ({ channelAddress, channelTitle, videoCid }: RelatedVideosProps) => {
  const [tab, setTab] = useState<'all' | 'channel'>('all');
  const communities = useMemo(() => (tab === 'all' ? HOME_COMMUNITIES : [getChannelIdentifier(channelAddress)]), [tab, channelAddress]);
  const { feed, hasMore, loadMore } = useFeed({ communities, sortType: tab === 'all' ? 'hot' : 'new', postsPerPage: PAGE_SIZE, filter: videoPostsFilter });
  const videos = feed.filter((candidate) => candidate.cid !== videoCid);

  return (
    <aside className={styles.secondary} aria-label='Related videos'>
      <div className={styles.relatedChips} role='group' aria-label='Show'>
        <button type='button' className={styles.relatedChip} aria-pressed={tab === 'all'} onClick={() => setTab('all')}>
          All
        </button>
        <button type='button' className={styles.relatedChip} aria-pressed={tab === 'channel'} onClick={() => setTab('channel')}>
          From {channelTitle}
        </button>
      </div>
      <div className={styles.relatedList}>
        {videos.map((candidate) => (
          <VideoCard key={candidate.cid} post={candidate} layout='compact' showChannel={tab === 'all'} />
        ))}
        {videos.length === 0 && !hasMore && <p className={styles.relatedEmpty}>No other videos yet.</p>}
      </div>
      {hasMore && videos.length > 0 && (
        <button type='button' className={styles.showMore} onClick={() => void loadMore()}>
          Show more
        </button>
      )}
    </aside>
  );
};
