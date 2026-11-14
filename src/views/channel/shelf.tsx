import { useCallback, useId, useRef, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useHorizontalOverflow } from '../../hooks/use-horizontal-overflow';
import styles from './channel.module.css';

interface ShelfProps {
  title: string;
  /** The tab with everything the shelf previews. */
  to: string;
  variant: 'videos' | 'posts';
  children: ReactNode;
}

/** One row of a channel's Home tab, scrolled sideways with YouTube's round arrow buttons. */
export const Shelf = ({ title, to, variant, children }: ShelfProps) => {
  const headingId = useId();
  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const { ref: measureRef, start: overflowsStart, end: overflowsEnd } = useHorizontalOverflow<HTMLDivElement>();
  const setScroller = useCallback(
    (node: HTMLDivElement | null) => {
      scrollerRef.current = node;
      return measureRef(node);
    },
    [measureRef],
  );
  const scroll = (direction: 1 | -1) => {
    const node = scrollerRef.current;
    node?.scrollBy({ left: direction * node.clientWidth * 0.9, behavior: 'smooth' });
  };

  return (
    <section className={styles.shelf} aria-labelledby={headingId}>
      <h2 id={headingId} className={styles.shelfTitle}>
        <Link to={to}>{title}</Link>
      </h2>
      <div className={styles.shelfViewport}>
        <div ref={setScroller} className={styles.shelfItems} data-variant={variant}>
          {children}
        </div>
        {overflowsStart && (
          <button type='button' className={styles.shelfArrow} data-side='start' aria-label={`Scroll ${title} back`} onClick={() => scroll(-1)}>
            <ChevronLeft size={24} aria-hidden='true' />
          </button>
        )}
        {overflowsEnd && (
          <button type='button' className={styles.shelfArrow} data-side='end' aria-label={`Scroll ${title} forward`} onClick={() => scroll(1)}>
            <ChevronRight size={24} aria-hidden='true' />
          </button>
        )}
      </div>
    </section>
  );
};
