import { useMemo } from 'react';
import { useComment } from '@bitsocial/bitsocial-react-hooks';
import { VideoCard } from '../../components/video-card';
import { useWatchLater } from '../../hooks/use-watch-later';
import { getChannelIdentifier } from '../../lib/channels';
import type { SavedVideo } from '../../lib/watch-later';
import styles from './watch-later.module.css';

const SavedVideoCard = ({ video }: { video: SavedVideo }) => {
  const community = useMemo(() => getChannelIdentifier(video.channelAddress), [video.channelAddress]);
  const post = useComment({ commentCid: video.cid, community, autoUpdate: false });
  if (!post.timestamp) return <div className={styles.loading} aria-label='Loading video' />;
  // The saved channel address wins, so the card links where the video was saved from.
  return <VideoCard post={{ ...post, communityAddress: post.communityAddress ?? video.channelAddress }} />;
};

const WatchLater = () => {
  const saved = useWatchLater();

  return (
    <section>
      <h1 className={styles.title}>Watch later</h1>
      <p className={styles.note}>Saved in this browser. Your account will sync them once sign-in exists.</p>
      {saved.length === 0 ? (
        <p className={styles.empty}>No saved videos. Use “Watch later” under a video to save it here.</p>
      ) : (
        <div className={styles.grid}>
          {saved.map((video) => (
            <SavedVideoCard key={video.cid} video={video} />
          ))}
        </div>
      )}
    </section>
  );
};

export default WatchLater;
