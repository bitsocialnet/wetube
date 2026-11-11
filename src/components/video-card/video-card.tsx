import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import type { Comment } from '@bitsocial/bitsocial-react-hooks';
import { useChannel } from '../../hooks/use-channel';
import { useHoverPreview } from '../../hooks/use-hover-preview';
import { channelPath, shortAddress, videoPath } from '../../lib/channels';
import { timeAgo } from '../../lib/format';
import { getPreviewSource, getVideo, type PreviewSource } from '../../lib/video-sources';
import { ChannelAvatar } from '../channel-avatar';
import styles from './video-card.module.css';

interface VideoCardProps {
  post: Comment;
  /** Show the channel name and avatar; off on a channel's own page. */
  showChannel?: boolean;
  /** Compact cards sit in the watch page's side column. */
  layout?: 'grid' | 'compact';
}

// Tries each thumbnail in turn, then the first frame of a video file, then a placeholder with the host.
const Thumbnail = ({ urls, frameUrl, label }: { urls: string[]; frameUrl?: string; label?: string }) => {
  const [failedUrls, setFailedUrls] = useState<string[]>([]);
  const fail = (failed: string) => setFailedUrls((current) => [...current, failed]);
  const url = urls.find((candidate) => !failedUrls.includes(candidate));
  if (url) {
    return (
      <img
        key={url}
        className={styles.thumbnailImage}
        src={url}
        alt=''
        loading='lazy'
        referrerPolicy='no-referrer'
        onError={() => fail(url)}
        // For a removed video YouTube answers 404 with a 120×90 gray placeholder, which browsers still display.
        onLoad={(event) => {
          if (url.startsWith('https://i.ytimg.com/') && event.currentTarget.naturalWidth === 120 && event.currentTarget.naturalHeight === 90) fail(url);
        }}
      />
    );
  }
  // preload='metadata' fetches only the start of the file.
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

// Plays over the thumbnail, muted, once it has a frame to show, so the thumbnail never flashes black.
const Preview = ({ source, title }: { source: PreviewSource; title: string }) => {
  const [ready, setReady] = useState(false);
  return source.kind === 'video' ? (
    <video
      className={styles.preview}
      data-ready={ready || undefined}
      src={source.url}
      muted
      autoPlay
      loop
      playsInline
      tabIndex={-1}
      aria-hidden='true'
      onPlaying={() => setReady(true)}
    />
  ) : (
    <iframe
      className={styles.preview}
      data-ready={ready || undefined}
      src={source.url}
      title={`Preview of ${title}`}
      allow='autoplay; encrypted-media'
      sandbox='allow-scripts allow-same-origin'
      referrerPolicy={source.referrerPolicy}
      tabIndex={-1}
      aria-hidden='true'
      onLoad={() => setReady(true)}
    />
  );
};

export const VideoCard = ({ post, showChannel = true, layout = 'grid' }: VideoCardProps) => {
  const video = useMemo(() => getVideo(post), [post]);
  const channelAddress: string = post.communityAddress;
  const channel = useChannel(showChannel ? channelAddress : undefined, { onlyIfCached: true });
  // Grid cards preview on hover, as YouTube's home page does; the watch page's compact list does not.
  const previewSource = useMemo(() => (video && layout === 'grid' ? getPreviewSource(video) : undefined), [video, layout]);
  const preview = useHoverPreview(Boolean(previewSource));
  if (!video || !post.cid || !channelAddress) return null;

  const href = videoPath(channelAddress, post.cid);
  const channelTitle = channel.title || shortAddress(channelAddress);

  return (
    <article className={layout === 'compact' ? styles.compact : styles.card}>
      {/* The title link is the accessible one; the thumbnail repeats it for pointer users. */}
      <Link to={href} className={styles.thumbnail} tabIndex={-1} aria-hidden='true' onPointerEnter={preview.onPointerEnter} onPointerLeave={preview.onPointerLeave}>
        <Thumbnail urls={video.thumbnailUrls} frameUrl={video.sources.find((source) => source.kind === 'file')?.playUrl} label={video.sources[0]?.label} />
        {preview.active && previewSource && <Preview source={previewSource} title={video.title} />}
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
            {/* View counts come from view providers, which are not built yet (views.md). */}
            <span title='View counts are not available yet'>? views</span>
            {post.timestamp ? ` · ${timeAgo(post.timestamp)}` : ''}
          </p>
        </div>
      </div>
    </article>
  );
};
