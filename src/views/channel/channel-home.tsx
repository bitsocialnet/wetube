import { useFeed, type CommunityIdentifier } from '@bitsocial/bitsocial-react-hooks';
import { PostCard } from '../../components/post-card';
import { VideoCard } from '../../components/video-card';
import { feedPostsFilter } from '../../lib/channel-posts';
import { channelSectionPath } from '../../lib/channels';
import { videoPostsFilter } from '../../lib/video-sources';
import { Shelf } from './shelf';
import styles from './channel.module.css';

const SKELETON_COUNT = 4;

interface ChannelHomeProps {
  channelAddress: string;
  communities: CommunityIdentifier[];
}

/** The Home tab: the channel's latest videos and latest posts, each in a shelf linking to its tab. */
export const ChannelHome = ({ channelAddress, communities }: ChannelHomeProps) => {
  const videos = useFeed({ communities, sortType: 'new', postsPerPage: 12, filter: videoPostsFilter });
  const posts = useFeed({ communities, sortType: 'new', postsPerPage: 6, filter: feedPostsFilter });
  const loadingVideos = videos.feed.length === 0 && videos.hasMore;

  if (videos.feed.length === 0 && !videos.hasMore && posts.feed.length === 0 && !posts.hasMore) {
    return <p className={styles.empty}>This channel has no videos or posts yet.</p>;
  }

  return (
    <>
      {(videos.feed.length > 0 || loadingVideos) && (
        <Shelf title='Videos' to={channelSectionPath(channelAddress, 'videos')} variant='videos'>
          {videos.feed.map((post) => (
            <div key={post.cid} className={styles.shelfItem}>
              <VideoCard post={post} showChannel={false} />
            </div>
          ))}
          {loadingVideos &&
            Array.from({ length: SKELETON_COUNT }, (_, index) => (
              <div key={index} className={styles.shelfItem} aria-hidden='true'>
                <div className={styles.skeletonThumbnail} />
              </div>
            ))}
        </Shelf>
      )}
      {/* No placeholder while posts load: most channels have none, and the shelf would only flash. */}
      {posts.feed.length > 0 && (
        <Shelf title='Posts' to={channelSectionPath(channelAddress, 'posts')} variant='posts'>
          {posts.feed.map((post) => (
            <div key={post.cid} className={styles.shelfItem}>
              <PostCard post={post} layout='shelf' />
            </div>
          ))}
        </Shelf>
      )}
    </>
  );
};
