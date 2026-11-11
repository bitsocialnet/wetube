import { useEffect, type RefObject } from 'react';

/**
 * Closes a popover on a pointer press outside `ref` or on Escape. onClose should be stable or cheap to
 * re-subscribe; the listeners only exist while `open` is true.
 */
export const useDismiss = (open: boolean, ref: RefObject<HTMLElement | null>, onClose: (reason: 'outside' | 'escape') => void) => {
  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!ref.current?.contains(event.target as Node)) onClose('outside');
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose('escape');
    };
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open, ref, onClose]);
};
