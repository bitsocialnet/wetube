import { useCallback, useReducer, type ReactNode } from 'react';
import { useFormat } from '../../hooks/use-format';
import { useSourceAvailability } from '../../hooks/use-source-availability';
import type { VideoSource } from '../../lib/video-sources';
import { getSourceStatus, initialPlayerState, playerReducer } from './player-state';
import { SourcesDialog } from './sources-dialog';
import styles from './player.module.css';

interface PlayerProps {
  sources: VideoSource[];
  title: string;
  /** The video's heading, shown under the player with the sources button beside it. */
  children?: ReactNode;
}

const EMBED_SANDBOX = 'allow-scripts allow-popups allow-popups-to-escape-sandbox allow-forms allow-presentation allow-same-origin';
const EMBED_ALLOW = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';

/**
 * Plays one of a video's sources and lets the viewer switch between them in a dialog next to the title. A
 * source that fails moves the player to the next one: a file reports its own load error, and an embed is
 * checked against its host's oEmbed or API (useSourceAvailability). Key this component by video so its
 * state resets.
 */
export const Player = ({ sources, title, children }: PlayerProps) => {
  const { t, language } = useFormat();
  const [state, dispatch] = useReducer(playerReducer, initialPlayerState);
  const source = sources[state.selectedIndex];
  const markFailed = useCallback((failed: VideoSource) => dispatch({ type: 'fail', playUrl: failed.playUrl, sources }), [sources]);
  const markAvailable = useCallback((available: VideoSource) => dispatch({ type: 'available', playUrl: available.playUrl }), []);
  const selectSource = useCallback((index: number) => dispatch({ type: 'select', index, playUrl: sources[index].playUrl }), [sources]);
  useSourceAvailability(source, markFailed, markAvailable);

  if (!source) {
    return (
      <div className={styles.player}>
        <div className={styles.message}>{t('no_playable_source')}</div>
        {children}
      </div>
    );
  }

  const allFailed = sources.every((candidate) => state.failedUrls.includes(candidate.playUrl));
  const skipped = sources.filter((candidate) => state.failedUrls.includes(candidate.playUrl) && candidate !== source);

  return (
    <div className={styles.player}>
      <div className={styles.frame}>
        {allFailed ? (
          <div className={styles.message} role='alert'>
            {sources.length === 1 ? t('source_failed') : t('all_sources_failed', { number: sources.length })}
          </div>
        ) : source.kind === 'file' ? (
          <video
            key={source.playUrl}
            className={styles.media}
            src={source.playUrl}
            controls
            playsInline
            preload='metadata'
            onLoadedMetadata={() => markAvailable(source)}
            onError={() => markFailed(source)}
          />
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
          {t('playing_from', {
            failed: new Intl.ListFormat(language, { type: 'conjunction' }).format(skipped.map((candidate) => candidate.label)),
            source: source.label,
          })}
        </p>
      )}
      <div className={styles.titleRow}>
        {children}
        <SourcesDialog
          sources={sources}
          getStatus={(index) => getSourceStatus(state, sources, index)}
          onSelect={selectSource}
          onUnavailable={markFailed}
          onAvailable={markAvailable}
        />
      </div>
    </div>
  );
};
