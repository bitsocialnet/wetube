import { useCallback } from 'react';

/**
 * A ref for a sentinel element after a feed's last item: loads the next page when the sentinel nears the
 * viewport. Key the sentinel by the item count so each page gets a fresh observer: an observer only
 * reports changes, so a sentinel still in view after a page loads would otherwise never trigger the next.
 */
export const useLoadMore = (hasMore: boolean, loadMore: () => Promise<void>) =>
  useCallback(
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
