import { useMemo } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { useChannel } from '../../hooks/use-channel';
import { getChannelAddressFromHandle, getChannelIdentifier, getChannelSection } from '../../lib/channels';
import { ChannelHeader } from './channel-header';
import { ChannelHome } from './channel-home';
import { ChannelPosts } from './channel-posts';
import { ChannelSearch } from './channel-search';
import { ChannelTabs } from './channel-tabs';
import { ChannelVideos } from './channel-videos';
import styles from './channel.module.css';

const Channel = () => {
  const { channelHandle, channelSection } = useParams();
  const channelAddress = getChannelAddressFromHandle(channelHandle) ?? '';
  // The app only routes known sections here.
  const section = getChannelSection(channelSection) ?? 'home';
  const query = useSearchParams()[0].get('query')?.trim() ?? '';
  const channel = useChannel(channelAddress);
  const communities = useMemo(() => [getChannelIdentifier(channelAddress)], [channelAddress]);

  return (
    <div className={styles.page}>
      <ChannelHeader channelAddress={channelAddress} channel={channel} />
      <ChannelTabs channelAddress={channelAddress} section={section} query={query} />
      {/* Keyed by channel so moving between channels starts each section afresh. */}
      <div key={channelAddress} className={styles.section}>
        {section === 'home' && <ChannelHome channelAddress={channelAddress} communities={communities} />}
        {section === 'videos' && <ChannelVideos channelAddress={channelAddress} communities={communities} />}
        {section === 'playlists' && <p className={styles.empty}>This channel has no playlists. WeTube does not support playlists yet.</p>}
        {section === 'posts' && <ChannelPosts communities={communities} />}
        {section === 'search' && <ChannelSearch communities={communities} query={query} />}
      </div>
    </div>
  );
};

export default Channel;
