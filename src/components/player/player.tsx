import { useState } from 'react';
import type { VideoSource } from '../../lib/video-sources';
import styles from './player.module.css';

interface PlayerProps {
  sources: VideoSource[];
  title: string;
}

const EMBED_SANDBOX = 'allow-scripts allow-popups allow-popups-to-escape-sandbox allow-forms allow-presentation allow-same-origin';
const EMBED_ALLOW = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';

/**
 * Plays one of a video's sources and lets the viewer switch between them. A file source that fails
 * to load falls through to the next one automatically; iframe embeds don't report failures to the
 * page, so for those the viewer switches by hand. Key this component by video so state resets.
 */
export const Player = ({ sources, title }: PlayerProps) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [failedUrls, setFailedUrls] = useState<string[]>([]);
  const source = sources[selectedIndex];
  const allFailed = sources.length > 0 && sources.every((candidate) => failedUrls.includes(candidate.playUrl));

  const markFailed = (failed: VideoSource) => {
    const nextFailed = [...failedUrls, failed.playUrl];
    setFailedUrls(nextFailed);
    const nextIndex = sources.findIndex((candidate) => !nextFailed.includes(candidate.playUrl));
    if (nextIndex !== -1) setSelectedIndex(nextIndex);
  };

  if (!source) {
    return <div className={styles.message}>This post has no source WeTube can play.</div>;
  }

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
            // YouTube refuses to play embeds that send no referrer.
            referrerPolicy={source.kind === 'youtube' ? 'origin' : 'no-referrer'}
          />
        )}
      </div>
      <div className={styles.sources}>
        <span className={styles.sourcesLabel} id='video-sources-label'>
          {sources.length === 1 ? 'Source' : `${sources.length} sources`}
        </span>
        <div className={styles.sourceButtons} role='group' aria-labelledby='video-sources-label'>
          {sources.map((candidate, index) => {
            const failed = failedUrls.includes(candidate.playUrl);
            return (
              <button
                key={candidate.playUrl}
                type='button'
                className={styles.sourceButton}
                aria-pressed={index === selectedIndex}
                data-failed={failed || undefined}
                onClick={() => {
                  // Choosing a failed source retries it.
                  setFailedUrls((current) => current.filter((url) => url !== candidate.playUrl));
                  setSelectedIndex(index);
                }}
                title={candidate.url}
              >
                {candidate.label}
                {failed && <span className='visually-hidden'> (failed to load)</span>}
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
