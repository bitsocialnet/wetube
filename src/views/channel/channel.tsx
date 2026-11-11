import { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { useFeed } from '@bitsocial/bitsocial-react-hooks';
import { ChannelAvatar } from '../../components/channel-avatar';
import { VideoGrid } from '../../components/video-grid';
import { useChannel } from '../../hooks/use-channel';
import { getChannelIdentifier, shortAddress } from '../../lib/channels';
import { videoPostsFilter } from '../../lib/video-sources';
import styles from './channel.module.css';

const Channel = () => {
  const { channelAddress = '' } = useParams();
  const channel = useChannel(channelAddress);
  const communities = useMemo(() => [getChannelIdentifier(channelAddress)], [channelAddress]);
  const { feed, hasMore, loadMore } = useFeed({ communities, sortType: 'new', postsPerPage: 24, filter: videoPostsFilter });
  const loaded = Boolean(channel.updatedAt);
  const title = channel.title || shortAddress(channelAddress);

  return (
    <>
      <header className={styles.header}>
        <ChannelAvatar address={channelAddress} title={channel.title} avatarUrl={channel.suggested?.avatarUrl} size={72} />
        <div className={styles.text}>
          <h1 className={styles.title}>{title}</h1>
          <p className={styles.address} title={channelAddress}>
            {channelAddress}
          </p>
          {channel.description && <p className={styles.description}>{channel.description}</p>}
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
      </header>
      <h2 className={styles.sectionHeading}>Videos</h2>
      <VideoGrid key={channelAddress} posts={feed} hasMore={hasMore} loadMore={loadMore} showChannel={false} emptyMessage='This channel has no videos yet.' />
    </>
  );
};

export default Channel;
