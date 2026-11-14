import { useCallback, useState } from 'react';

/** Whether an element's content runs past its start or end edge (right to left too), for scroll arrows and fades. Attach the returned ref. */
export const useHorizontalOverflow = <T extends HTMLElement>() => {
  const [overflow, setOverflow] = useState({ start: false, end: false });
  const ref = useCallback((node: T | null) => {
    if (!node) return;
    const measure = () => {
      // A pixel of slack absorbs subpixel widths. Right to left, scrollLeft runs from 0 down to negative values.
      const scrolled = Math.abs(node.scrollLeft);
      const start = scrolled > 1;
      const end = scrolled + node.clientWidth < node.scrollWidth - 1;
      setOverflow((current) => (current.start === start && current.end === end ? current : { start, end }));
    };
    measure();
    // The element resizing, its content changing (new items, new text) and scrolling all move the edges.
    const resizes = new ResizeObserver(measure);
    resizes.observe(node);
    const mutations = new MutationObserver(measure);
    mutations.observe(node, { childList: true, subtree: true, characterData: true });
    node.addEventListener('scroll', measure, { passive: true });
    return () => {
      resizes.disconnect();
      mutations.disconnect();
      node.removeEventListener('scroll', measure);
    };
  }, []);
  return { ref, ...overflow };
};
