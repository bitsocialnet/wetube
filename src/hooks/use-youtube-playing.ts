import { useEffect, type RefObject } from 'react';
import { isYouTubePlayingMessage, youTubeListeningMessage } from '../lib/youtube-embed';

// The embed only answers once its player script runs, so "listening" is repeated until it does.
const LISTEN_INTERVAL_MS = 250;
const LISTEN_ATTEMPTS = 40;

/**
 * Calls onPlaying once the YouTube embed in `frameRef` (loaded with enablejsapi=1) reports that its video
 * is playing. `enabled` should turn on when the frame has loaded. onPlaying must be stable.
 */
export const useYouTubePlaying = (frameRef: RefObject<HTMLIFrameElement | null>, enabled: boolean, onPlaying: () => void) => {
  useEffect(() => {
    const frame = frameRef.current;
    if (!enabled || !frame?.src) return;
    const targetOrigin = new URL(frame.src).origin;
    const message = youTubeListeningMessage(`wetube-preview-${Math.random().toString(36).slice(2)}`);
    let attempts = 0;
    const listen = () => frame.contentWindow?.postMessage(message, targetOrigin);
    const interval = window.setInterval(() => {
      attempts += 1;
      if (attempts >= LISTEN_ATTEMPTS) window.clearInterval(interval);
      else listen();
    }, LISTEN_INTERVAL_MS);
    listen();

    const onMessage = (event: MessageEvent) => {
      if (event.source !== frame.contentWindow) return;
      // Any answer means the player has registered this page; it keeps sending updates on its own.
      window.clearInterval(interval);
      if (isYouTubePlayingMessage(event.data)) onPlaying();
    };
    window.addEventListener('message', onMessage);
    return () => {
      window.clearInterval(interval);
      window.removeEventListener('message', onMessage);
    };
  }, [enabled, frameRef, onPlaying]);
};
