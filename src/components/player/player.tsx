import { useCallback, useReducer } from 'react';
import { useSourceAvailability } from '../../hooks/use-source-availability';
import type { VideoSource } from '../../lib/video-sources';
import { initialPlayerState, playerReducer } from './player-state';
import styles from './player.module.css';

interface PlayerProps {
  sources: VideoSource[];
  title: string;
}

const EMBED_SANDBOX = 'allow-scripts allow-popups allow-popups-to-escape-sandbox allow-forms allow-presentation allow-same-origin';
const EMBED_ALLOW = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';

/**
 * Plays one of a video's sources and lets the viewer switch between them. A source that fails moves the
 * player to the next one: a file reports its own load error, and an embed is checked against its host's
 * oEmbed or API (useSourceAvailability). Key this component by video so its state resets.
 */
export const Player = ({ sources, title }: PlayerProps) => {
  const [state, dispatch] = useReducer(playerReducer, initialPlayerState);
  const source = sources[state.selectedIndex];
  const markFailed = useCallback((failed: VideoSource) => dispatch({ type: 'fail', playUrl: failed.playUrl, sources }), [sources]);
  useSourceAvailability(source, markFailed);

  if (!source) {
    return <div className={styles.message}>This post has no source WeTube can play.</div>;
  }

  const allFailed = sources.every((candidate) => state.failedUrls.includes(candidate.playUrl));
  const skipped = sources.filter((candidate) => state.failedUrls.includes(candidate.playUrl) && candidate !== source);

  return (
    <div className={styles.player}>
      <div className={styles.frame}>
        {allFailed ? (
          <div className={styles.message} role='alert'>
            {sources.length === 1 ? "This video's source could not be played." : `None of this video's ${sources.length} sources could be played.`}
          </div>
        ) : source.kind === 'file' ? (
          <video key={source.playUrl} className={styles.media} src={source.playUrl} controls playsInline preload='metadata' onError={() => markFailed(source)} />
        ) : (
          <iframe
            key={source.playUrl}
            className={styles.media}
            src={source.playUrl}
            title={`${title} (${source.label})`}
            allow={EMBED_ALLOW}
            allowFullScreen
            sandbox={EMBED_SANDBOX}
            // YouTube refuses to play an embed that sends no referrer, and PeerTube's player then fails to load
            // its preview image ("Invalid width to find appropriate image"). Both get the origin only.
            referrerPolicy={source.kind === 'youtube' || source.kind === 'peertube' ? 'origin' : 'no-referrer'}
          />
        )}
      </div>
      {!allFailed && skipped.length > 0 && (
        <p className={styles.notice} role='status'>
          Not available on {skipped.map((candidate) => candidate.label).join(', ')}. Playing from {source.label}.
        </p>
      )}
      <div className={styles.sources}>
        <span className={styles.sourcesLabel} id='video-sources-label'>
          {sources.length === 1 ? 'Source' : `${sources.length} sources`}
        </span>
        <div className={styles.sourceButtons} role='group' aria-labelledby='video-sources-label'>
          {sources.map((candidate, index) => {
            const failed = state.failedUrls.includes(candidate.playUrl);
            return (
              <button
                key={candidate.playUrl}
                type='button'
                className={styles.sourceButton}
                aria-pressed={index === state.selectedIndex}
                data-failed={failed || undefined}
                // Choosing a failed source retries it.
                onClick={() => dispatch({ type: 'select', index, playUrl: candidate.playUrl })}
                title={candidate.url}
              >
                {candidate.label}
                {failed && <span className='visually-hidden'> (not available)</span>}
              </button>
            );
          })}
        </div>
        <a className={styles.openLink} href={source.url} target='_blank' rel='noopener noreferrer'>
          Open on {source.label}
        </a>
      </div>
    </div>
  );
};
