import { useEffect } from 'react';
import type { VideoSource } from '../lib/video-sources';

// Statuses with which oEmbed endpoints and the PeerTube API say a video is gone, private or not embeddable.
const UNAVAILABLE_STATUSES = new Set([401, 403, 404, 410]);

/**
 * Asks the source's host whether the video still exists, and calls onUnavailable when it does not. Embeds
 * show their own error page inside the iframe without telling the page, so this is how a removed embed is
 * skipped. A check that cannot answer (network error, rate limit, server error) counts as available: it
 * must not hide a video that may still play. onAvailable runs only when the host confirms the video. Both
 * callbacks must be stable, such as wrappers around a reducer's dispatch.
 */
export const useSourceAvailability = (source: VideoSource | undefined, onUnavailable: (source: VideoSource) => void, onAvailable?: (source: VideoSource) => void) => {
  useEffect(() => {
    const url = source?.availabilityUrl;
    if (!source || !url) return;
    const controller = new AbortController();
    fetch(url, { signal: controller.signal, credentials: 'omit', referrerPolicy: 'no-referrer' })
      .then((response) => {
        if (UNAVAILABLE_STATUSES.has(response.status)) onUnavailable(source);
        else if (response.ok) onAvailable?.(source);
      })
      .catch(() => undefined);
    return () => controller.abort();
  }, [source, onUnavailable, onAvailable]);
};
