import { useRef, useState } from 'react';
import { ChannelAvatar } from '../../components/channel-avatar';
import { SubscribeButtons } from '../../components/subscribe-buttons';
import type { useChannel } from '../../hooks/use-channel';
import { useHorizontalOverflow } from '../../hooks/use-horizontal-overflow';
import { getKnownVideoCount } from '../../lib/channel-posts';
import { shortAddress } from '../../lib/channels';
import { plural } from '../../lib/format';
import { ChannelAbout } from './channel-about';
import styles from './channel.module.css';

interface ChannelHeaderProps {
  channelAddress: string;
  channel: ReturnType<typeof useChannel>;
}

// The banner the channel sets (community.suggested.bannerUrl), or a plain block in the theme's surface color.
const Banner = ({ url }: { url: string | undefined }) => {
  const [failedUrl, setFailedUrl] = useState<string>();
  return <div className={styles.banner}>{url && failedUrl !== url && <img src={url} alt='' referrerPolicy='no-referrer' onError={() => setFailedUrl(url)} />}</div>;
};

/** YouTube's channel header: banner, avatar, name, counts, a one-line description and Subscribe. */
export const ChannelHeader = ({ channelAddress, channel }: ChannelHeaderProps) => {
  const aboutRef = useRef<HTMLDialogElement>(null);
  const loaded = Boolean(channel.updatedAt);
  const title = channel.title || shortAddress(channelAddress);
  const description = (channel.description ?? '').replace(/\s+/g, ' ').trim();
  // A loaded channel without posts may publish no posts field at all.
  const videoCount = loaded ? getKnownVideoCount(channel.posts ?? {}) : undefined;
  const { ref: descriptionRef, end: descriptionOverflows } = useHorizontalOverflow<HTMLSpanElement>();

  return (
    <header className={styles.header}>
      <Banner url={channel.suggested?.bannerUrl} />
      <div className={styles.identity}>
        <ChannelAvatar className={styles.avatar} address={channelAddress} title={channel.title} avatarUrl={channel.suggested?.avatarUrl} />
        <div className={styles.info}>
          <h1 className={styles.title}>{title}</h1>
          <p className={styles.metadata}>
            <span className={styles.address} title={channelAddress}>
              {shortAddress(channelAddress)}
            </span>
            <span title='Subscriber counts are not available yet'>? subscribers</span>
            {videoCount === undefined ? <span title='The video count is not available yet'>? videos</span> : <span>{plural(videoCount, 'video')}</span>}
          </p>
          {/* One line that fades out before "…more", which opens the channel's About dialog. */}
          <div className={styles.description}>
            <span ref={descriptionRef} className={styles.descriptionText} data-faded={descriptionOverflows || undefined}>
              {description || 'More about this channel'}
            </span>
            <button
              type='button'
              className={styles.descriptionMore}
              aria-haspopup='dialog'
              aria-label='More about this channel'
              onClick={() => aboutRef.current?.showModal()}
            >
              …more
            </button>
          </div>
          <div className={styles.headerActions}>
            <SubscribeButtons channelAddress={channelAddress} size='large' />
          </div>
          {!loaded && !channel.error && (
            <p className={styles.status} role='status'>
              Connecting to the channel's peers…
            </p>
          )}
          {channel.error && (
            <p className={styles.error} role='alert'>
              Could not load this channel: {channel.error.message}
            </p>
          )}
        </div>
      </div>
      <ChannelAbout
        dialogRef={aboutRef}
        channelAddress={channelAddress}
        title={title}
        description={channel.description}
        createdAt={channel.createdAt}
        videoCount={videoCount}
      />
    </header>
  );
};
