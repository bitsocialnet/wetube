import { Link } from 'react-router-dom';
import { useFeed } from '@bitsocial/bitsocial-react-hooks';
import { VideoGrid } from '../../components/video-grid';
import { HOME_CHANNELS, type ChannelListing } from '../../data/channels';
import { useChannel } from '../../hooks/use-channel';
import { channelPath, getChannelIdentifier, shortAddress } from '../../lib/channels';
import { videoPostsFilter } from '../../lib/video-sources';
import styles from './home.module.css';

const HOME_COMMUNITIES = HOME_CHANNELS.map((channel) => getChannelIdentifier(channel.address));

const ChannelChip = ({ channel }: { channel: ChannelListing }) => {
  const community = useChannel(channel.address, { onlyIfCached: true });
  return (
    <Link to={channelPath(channel.address)} className={styles.chip}>
      {community.title || shortAddress(channel.address)}
    </Link>
  );
};

const Home = () => {
  const { feed, hasMore, loadMore } = useFeed({ communities: HOME_COMMUNITIES, sortType: 'hot', postsPerPage: 24, filter: videoPostsFilter });

  return (
    <>
      <h1 className='visually-hidden'>WeTube home</h1>
      <nav className={styles.chips} aria-label='Channels'>
        <span className={styles.chipActive} aria-current='page'>
          All
        </span>
        {HOME_CHANNELS.map((channel) => (
          <ChannelChip key={channel.address} channel={channel} />
        ))}
      </nav>
      <VideoGrid posts={feed} hasMore={hasMore} loadMore={loadMore} emptyMessage='No videos yet.' />
    </>
  );
};

export default Home;
