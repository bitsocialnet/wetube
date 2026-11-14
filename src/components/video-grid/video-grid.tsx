import type { ReactNode } from 'react';
import type { Comment } from '@bitsocial/bitsocial-react-hooks';
import { useLoadMore } from '../../hooks/use-load-more';
import { VideoCard } from '../video-card';
import styles from './video-grid.module.css';

interface VideoGridProps {
  posts: Comment[];
  hasMore: boolean;
  loadMore: () => Promise<void>;
  showChannel?: boolean;
  emptyMessage: ReactNode;
}

const SKELETON_COUNT = 8;

export const VideoGrid = ({ posts, hasMore, loadMore, showChannel = true, emptyMessage }: VideoGridProps) => {
  const sentinelRef = useLoadMore(hasMore, loadMore);

  if (posts.length === 0 && !hasMore) {
    return <div className={styles.empty}>{emptyMessage}</div>;
  }

  return (
    <>
      <div className={styles.grid}>
        {posts.map((post) => (
          <VideoCard key={post.cid} post={post} showChannel={showChannel} />
        ))}
        {posts.length === 0 &&
          Array.from({ length: SKELETON_COUNT }, (_, index) => (
            <div key={index} className={styles.skeleton} aria-hidden='true'>
              <div className={styles.skeletonThumbnail} />
              <div className={styles.skeletonLine} />
              <div className={styles.skeletonLineShort} />
            </div>
          ))}
      </div>
      {posts.length === 0 && (
        <p className={styles.status} role='status'>
          Loading videos from peers…
        </p>
      )}
      {hasMore && <div key={posts.length} ref={sentinelRef} className={styles.sentinel} />}
    </>
  );
};
