import { useMemo } from 'react';
import { useFeed, type CommunityIdentifier } from '@bitsocial/bitsocial-react-hooks';
import { PostCard } from '../../components/post-card';
import { VideoCard } from '../../components/video-card';
import { useLoadMore } from '../../hooks/use-load-more';
import { channelSearchFilter } from '../../lib/channel-posts';
import { isPlayableVideoPost } from '../../lib/video-sources';
import styles from './channel.module.css';

interface ChannelSearchProps {
  communities: CommunityIdentifier[];
  query: string;
}

const SearchResults = ({ communities, query }: ChannelSearchProps) => {
  const filter = useMemo(() => channelSearchFilter(query), [query]);
  const { feed, hasMore, loadMore } = useFeed({ communities, sortType: 'new', postsPerPage: 20, filter });
  const sentinelRef = useLoadMore(hasMore, loadMore);

  if (feed.length === 0 && !hasMore) return <p className={styles.empty}>No results for “{query}” in this channel.</p>;

  return (
    <div className={styles.results}>
      {feed.map((post) =>
        isPlayableVideoPost(post) ? <VideoCard key={post.cid} post={post} layout='list' showChannel={false} /> : <PostCard key={post.cid} post={post} />,
      )}
      {feed.length === 0 && (
        <p className={styles.loading} role='status'>
          Searching the channel's posts…
        </p>
      )}
      {hasMore && <div key={feed.length} ref={sentinelRef} className={styles.sentinel} />}
    </div>
  );
};

/** In-channel search results: videos as rows, posts as cards, newest first. */
export const ChannelSearch = ({ communities, query }: ChannelSearchProps) =>
  query ? <SearchResults key={query} communities={communities} query={query} /> : <p className={styles.empty}>Search this channel's videos and posts.</p>;
