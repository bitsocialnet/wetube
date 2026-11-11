import { useCallback, useEffect, useRef, useState } from 'react';

// YouTube shows a card's preview after the pointer rests on it briefly, so passing over cards plays nothing.
const SHOW_DELAY_MS = 600;
// Loading starts sooner, but not for a pointer just crossing the card on its way somewhere else.
const LOAD_DELAY_MS = 150;
// Only with a mouse-like pointer, and never for viewers who ask for reduced motion.
const PREVIEW_QUERY = '(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)';

/**
 * Pointer handlers for a card's hover preview. The preview starts loading hidden shortly after the pointer
 * enters (`loading`) and is shown after a longer rest (`visible`), so the wait overlaps the loading.
 */
export const useHoverPreview = (enabled: boolean) => {
  const [state, setState] = useState<'idle' | 'loading' | 'visible'>('idle');
  const timers = useRef<number[]>([]);
  const clearTimers = () => {
    for (const timer of timers.current) window.clearTimeout(timer);
    timers.current = [];
  };
  useEffect(() => clearTimers, []);

  const onPointerEnter = useCallback(() => {
    if (!enabled || !window.matchMedia(PREVIEW_QUERY).matches) return;
    clearTimers();
    timers.current = [window.setTimeout(() => setState('loading'), LOAD_DELAY_MS), window.setTimeout(() => setState('visible'), SHOW_DELAY_MS)];
  }, [enabled]);

  const onPointerLeave = useCallback(() => {
    clearTimers();
    setState('idle');
  }, []);

  return { loading: state !== 'idle', visible: state === 'visible', onPointerEnter, onPointerLeave };
};
