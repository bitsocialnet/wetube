import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import type { Comment } from '@bitsocial/bitsocial-react-hooks';
import { useChannel } from '../../hooks/use-channel';
import { channelPath, shortAddress, videoPath } from '../../lib/channels';
import { plural, timeAgo } from '../../lib/format';
import { getVideo } from '../../lib/video-sources';
import { ChannelAvatar } from '../channel-avatar';
import styles from './video-card.module.css';

interface VideoCardProps {
  post: Comment;
  /** Show the channel name and avatar; off on a channel's own page. */
  showChannel?: boolean;
  /** Compact cards sit in the watch page's side column. */
  layout?: 'grid' | 'compact';
}

const Thumbnail = ({ url, frameUrl, label }: { url?: string; frameUrl?: string; label?: string }) => {
  const [failedUrls, setFailedUrls] = useState<string[]>([]);
  const fail = (failed: string) => setFailedUrls((current) => [...current, failed]);
  if (url && !failedUrls.includes(url)) {
    return <img className={styles.thumbnailImage} src={url} alt='' loading='lazy' referrerPolicy='no-referrer' onError={() => fail(url)} />;
  }
  // A video file with no thumbnail shows its first frame; preload='metadata' fetches only the start of the file.
  if (frameUrl && !failedUrls.includes(frameUrl)) {
    return <video className={styles.thumbnailImage} src={`${frameUrl}#t=0.1`} preload='metadata' muted playsInline tabIndex={-1} onError={() => fail(frameUrl)} />;
  }
  return (
    <span className={styles.thumbnailFallback}>
      <svg viewBox='0 0 24 24' width='28' height='28' aria-hidden='true'>
        <path d='M8 5v14l11-7z' fill='currentColor' />
      </svg>
      {label && <span>{label}</span>}
    </span>
  );
};

export const VideoCard = ({ post, showChannel = true, layout = 'grid' }: VideoCardProps) => {
  const video = useMemo(() => getVideo(post), [post]);
  const channelAddress: string = post.communityAddress;
  const channel = useChannel(showChannel ? channelAddress : undefined, { onlyIfCached: true });
  if (!video || !post.cid || !channelAddress) return null;

  const href = videoPath(channelAddress, post.cid);
  const channelTitle = channel.title || shortAddress(channelAddress);

  return (
    <article className={layout === 'compact' ? styles.compact : styles.card}>
      {/* The title link is the accessible one; the thumbnail repeats it for pointer users. */}
      <Link to={href} className={styles.thumbnail} tabIndex={-1} aria-hidden='true'>
        <Thumbnail url={video.thumbnailUrl} frameUrl={video.sources.find((source) => source.kind === 'file')?.playUrl} label={video.sources[0]?.label} />
      </Link>
      <div className={styles.details}>
        {showChannel && layout === 'grid' && (
          <Link to={channelPath(channelAddress)} className={styles.avatarLink} tabIndex={-1} aria-hidden='true'>
            <ChannelAvatar address={channelAddress} title={channel.title} avatarUrl={channel.suggested?.avatarUrl} />
          </Link>
        )}
        <div className={styles.text}>
          <h3 className={styles.title}>
            <Link to={href}>{video.title}</Link>
          </h3>
          {showChannel && (
            <Link to={channelPath(channelAddress)} className={styles.channelName}>
              {channelTitle}
            </Link>
          )}
          <p className={styles.stats}>
            {plural(post.upvoteCount, 'like')} · {plural(post.replyCount, 'comment')}
            {post.timestamp ? ` · ${timeAgo(post.timestamp)}` : ''}
          </p>
        </div>
      </div>
    </article>
  );
};
