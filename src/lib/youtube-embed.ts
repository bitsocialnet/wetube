// The YouTube embed's postMessage protocol, without loading YouTube's iframe_api script. With
// enablejsapi=1 the embed answers a parent that sends a "listening" message, and then reports the
// player's state: "onStateChange" events and "infoDelivery" updates carrying playerState and currentTime.

const PLAYING = 1;

/** The embed URL with its JavaScript API on, answering only the page's own origin. */
export const withYouTubeJsApi = (url: string, origin: string) => {
  const parsed = new URL(url);
  parsed.searchParams.set('enablejsapi', '1');
  parsed.searchParams.set('origin', origin);
  return parsed.toString();
};

/** The message a parent sends (and repeats until the player answers) to receive the player's events. */
export const youTubeListeningMessage = (id: string) => JSON.stringify({ event: 'listening', id, channel: 'widget' });

/** True when a message from a YouTube embed says its video is playing. */
export const isYouTubePlayingMessage = (data: unknown): boolean => {
  let message: unknown = data;
  if (typeof data === 'string') {
    try {
      message = JSON.parse(data);
    } catch {
      return false;
    }
  }
  if (typeof message !== 'object' || message === null) return false;
  const { event, info } = message as { event?: unknown; info?: unknown };
  if (event === 'onStateChange') return info === PLAYING;
  if (event === 'infoDelivery' || event === 'initialDelivery') {
    const { playerState, currentTime } = (info ?? {}) as { playerState?: unknown; currentTime?: unknown };
    return playerState === PLAYING || (typeof currentTime === 'number' && currentTime > 0);
  }
  return false;
};
