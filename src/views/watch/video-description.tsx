import { useState } from 'react';
import type { Comment } from '@bitsocial/bitsocial-react-hooks';
import { timeAgo } from '../../lib/format';
import type { Video } from '../../lib/video-sources';
import styles from './watch.module.css';

// Collapsed like YouTube's description box; "…more" opens it and the whole box can be clicked.
const COLLAPSED_LENGTH = 220;

interface VideoDescriptionProps {
  post: Comment;
  video: Video;
}

export const VideoDescription = ({ post, video }: VideoDescriptionProps) => {
  const [expanded, setExpanded] = useState(false);
  const edit = post.edit as { timestamp?: number; reason?: string } | undefined;
  const long = video.description.length > COLLAPSED_LENGTH || video.sources.length > 1;

  return (
    <div className={styles.description} data-expanded={expanded || undefined}>
      <p className={styles.descriptionMeta}>
        <span title='View counts are not available yet'>? views</span>
        {post.timestamp ? <span>{timeAgo(post.timestamp)}</span> : null}
        {video.sources.length > 1 && <span>Mirrored on {video.sources.length} hosts</span>}
      </p>
      {video.description && (
        <p className={styles.descriptionText} data-clamped={!expanded || undefined}>
          {video.description}
        </p>
      )}
      {expanded && (
        // WeTube's own section: where the video plays from, which only the channel owner can change.
        <section className={styles.mirrors} aria-label='Sources'>
          <h2 className={styles.mirrorsTitle}>Sources</h2>
          <p className={styles.mirrorsNote}>
            WeTube plays the first source that works. The channel owner can add, remove or reorder them at any time; the video keeps its page, comments and likes.
            {edit?.timestamp ? ` Last updated ${timeAgo(edit.timestamp)}${edit.reason ? ` (“${edit.reason}”)` : ''}.` : ''}
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
          {expanded ? 'Show less' : '…more'}
        </button>
      )}
    </div>
  );
};
