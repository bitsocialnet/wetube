import { useMemo } from 'react';
import { useComment } from '@bitsocial/bitsocial-react-hooks';
import { useTranslation } from 'react-i18next';
import { VideoCard } from '../../components/video-card';
import { useWatchLater } from '../../hooks/use-watch-later';
import { getChannelIdentifier } from '../../lib/channels';
import type { SavedVideo } from '../../lib/watch-later';
import styles from './watch-later.module.css';

const SavedVideoCard = ({ video }: { video: SavedVideo }) => {
  const { t } = useTranslation();
  const community = useMemo(() => getChannelIdentifier(video.channelAddress), [video.channelAddress]);
  const post = useComment({ commentCid: video.cid, community, autoUpdate: false });
  if (!post.timestamp) return <div className={styles.loading} aria-label={t('loading_video')} />;
  // The saved channel address wins, so the card links where the video was saved from.
  return <VideoCard post={{ ...post, communityAddress: post.communityAddress ?? video.channelAddress }} />;
};

const WatchLater = () => {
  const { t } = useTranslation();
  const saved = useWatchLater();

  return (
    <section>
      <h1 className={styles.title}>{t('watch_later')}</h1>
      <p className={styles.note}>{t('watch_later_note')}</p>
      {saved.length === 0 ? (
        <p className={styles.empty}>{t('watch_later_empty', { button: t('watch_later') })}</p>
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
