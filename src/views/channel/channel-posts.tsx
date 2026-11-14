import { useFeed, type CommunityIdentifier } from '@bitsocial/bitsocial-react-hooks';
import { PostCard } from '../../components/post-card';
import { useLoadMore } from '../../hooks/use-load-more';
import { feedPostsFilter } from '../../lib/channel-posts';
import styles from './channel.module.css';

/** The Posts tab: the channel's text, image and link posts, newest first, without its videos. */
export const ChannelPosts = ({ communities }: { communities: CommunityIdentifier[] }) => {
  const { feed, hasMore, loadMore } = useFeed({ communities, sortType: 'new', postsPerPage: 10, filter: feedPostsFilter });
  const sentinelRef = useLoadMore(hasMore, loadMore);

  if (feed.length === 0 && !hasMore) return <p className={styles.empty}>This channel has no posts yet.</p>;

  return (
    <div className={styles.postList}>
      {feed.map((post) => (
        <PostCard key={post.cid} post={post} />
      ))}
      {feed.length === 0 && (
        <p className={styles.loading} role='status'>
          Loading posts from peers…
        </p>
      )}
      {hasMore && <div key={feed.length} ref={sentinelRef} className={styles.sentinel} />}
    </div>
  );
};
