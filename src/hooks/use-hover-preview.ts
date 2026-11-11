import { useCallback, useEffect, useRef, useState } from 'react';

// YouTube starts a card's preview after the pointer rests on it briefly, so passing over cards plays nothing.
const HOVER_DELAY_MS = 600;
// Only with a mouse-like pointer, and never for viewers who ask for reduced motion.
const PREVIEW_QUERY = '(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)';

/** Pointer handlers that turn `active` on after a short hover and off when the pointer leaves. */
export const useHoverPreview = (enabled: boolean) => {
  const [active, setActive] = useState(false);
  const timer = useRef<number | undefined>(undefined);
  useEffect(() => () => window.clearTimeout(timer.current), []);

  const onPointerEnter = useCallback(() => {
    if (!enabled || !window.matchMedia(PREVIEW_QUERY).matches) return;
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setActive(true), HOVER_DELAY_MS);
  }, [enabled]);

  const onPointerLeave = useCallback(() => {
    window.clearTimeout(timer.current);
    setActive(false);
  }, []);

  return { active, onPointerEnter, onPointerLeave };
};
