import { useState } from 'react';
import type { Comment } from '@bitsocial/bitsocial-react-hooks';
import { useFormat } from '../../hooks/use-format';
import type { Video } from '../../lib/video-sources';
import styles from './watch.module.css';

// Collapsed like YouTube's description box; "…more" opens it and the whole box can be clicked.
const COLLAPSED_LENGTH = 220;

interface VideoDescriptionProps {
  post: Comment;
  video: Video;
}

export const VideoDescription = ({ post, video }: VideoDescriptionProps) => {
  const { t, timeAgo, count } = useFormat();
  const [expanded, setExpanded] = useState(false);
  const edit = post.edit as { timestamp?: number; reason?: string } | undefined;
  const long = video.description.length > COLLAPSED_LENGTH || video.sources.length > 1;

  return (
    <div className={styles.description} data-expanded={expanded || undefined}>
      <p className={styles.descriptionMeta}>
        <span title={t('views_unavailable')}>{t('unknown_views')}</span>
        {post.timestamp ? <span>{timeAgo(post.timestamp)}</span> : null}
        {video.sources.length > 1 && <span>{t('mirrored_on_hosts', { number: count(video.sources.length) })}</span>}
      </p>
      {video.description && (
        <p className={styles.descriptionText} data-clamped={!expanded || undefined}>
          {video.description}
        </p>
      )}
      {expanded && (
        // WeTube's own section: where the video plays from, which only the channel owner can change.
        <section className={styles.mirrors} aria-label={t('sources')}>
          <h2 className={styles.mirrorsTitle}>{t('sources')}</h2>
          <p className={styles.mirrorsNote}>
            {t('sources_note')}
            {edit?.timestamp &&
              ` ${edit.reason ? t('last_updated_with_reason', { time: timeAgo(edit.timestamp), reason: edit.reason }) : t('last_updated', { time: timeAgo(edit.timestamp) })}`}
          </p>
          <ol className={styles.mirrorsList}>
            {video.sources.map((source) => (
              <li key={source.playUrl}>
                <span className={styles.mirrorHost}>{source.label}</span>
                <a href={source.url} target='_blank' rel='noopener noreferrer'>
                  {source.url}
                </a>
              </li>
            ))}
          </ol>
        </section>
      )}
      {long && (
        <button type='button' className={styles.moreButton} aria-expanded={expanded} onClick={() => setExpanded(!expanded)}>
          {expanded ? t('show_less') : t('more')}
        </button>
      )}
    </div>
  );
};
