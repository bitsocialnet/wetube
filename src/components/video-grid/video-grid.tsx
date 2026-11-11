import { useCallback, type ReactNode } from 'react';
import type { Comment } from '@bitsocial/bitsocial-react-hooks';
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
  // Load the next page when the sentinel nears the viewport.
  const sentinelRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (!node || !hasMore) return;
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry?.isIntersecting) void loadMore();
        },
        { rootMargin: '800px 0px' },
      );
      observer.observe(node);
      return () => observer.disconnect();
    },
    [hasMore, loadMore],
  );

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
      {/* Keyed by length so each page gets a fresh observer: an observer only reports changes, so a
          sentinel still in view after a page loads would otherwise never trigger the next one. */}
      {hasMore && <div key={posts.length} ref={sentinelRef} className={styles.sentinel} />}
    </>
  );
};
