import { useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useComment, useFeed } from '@bitsocial/bitsocial-react-hooks';
import { ChannelAvatar } from '../../components/channel-avatar';
import { Comments } from '../../components/comments';
import { Player } from '../../components/player';
import { VideoCard } from '../../components/video-card';
import { useChannel } from '../../hooks/use-channel';
import { channelPath, getChannelAddressFromHandle, getChannelIdentifier, shortAddress } from '../../lib/channels';
import { formatCount, plural, timeAgo } from '../../lib/format';
import { getVideo, videoPostsFilter } from '../../lib/video-sources';
import styles from './watch.module.css';

const MORE_VIDEOS_COUNT = 10;

const Watch = () => {
  const { channelHandle, videoCid = '' } = useParams();
  const channelAddress = getChannelAddressFromHandle(channelHandle) ?? '';
  const community = useMemo(() => getChannelIdentifier(channelAddress), [channelAddress]);
  const communities = useMemo(() => [community], [community]);
  const post = useComment({ commentCid: videoCid, community });
  const channel = useChannel(channelAddress);
  const { feed } = useFeed({ communities, sortType: 'new', postsPerPage: 24, filter: videoPostsFilter });
  const video = useMemo(() => getVideo(post), [post]);
  const moreVideos = feed.filter((candidate) => candidate.cid !== videoCid).slice(0, MORE_VIDEOS_COUNT);
  const loaded = Boolean(post.timestamp);
  const channelTitle = channel.title || shortAddress(channelAddress);

  return (
    <div className={styles.layout}>
      <div className={styles.primary}>
        {loaded && video ? (
          <Player key={videoCid} sources={video.sources} title={video.title} />
        ) : (
          <div className={styles.playerPlaceholder} role='status'>
            {post.error ? `Could not load this video: ${post.error.message}` : 'Loading the video post from peers…'}
          </div>
        )}
        {loaded && video && (
          <>
            <h1 className={styles.title}>{video.title}</h1>
            <div className={styles.ownerRow}>
              <Link to={channelPath(channelAddress)} className={styles.owner}>
                <ChannelAvatar address={channelAddress} title={channel.title} avatarUrl={channel.suggested?.avatarUrl} size={40} />
                <span className={styles.ownerName}>{channelTitle}</span>
              </Link>
              <div className={styles.votes}>
                <span aria-label={plural(post.upvoteCount, 'like')}>▲ {formatCount(post.upvoteCount)}</span>
                <span className={styles.voteDivider} aria-hidden='true' />
                <span aria-label={plural(post.downvoteCount, 'dislike')}>▼ {formatCount(post.downvoteCount)}</span>
              </div>
            </div>
            <div className={styles.description}>
              <p className={styles.descriptionMeta}>{timeAgo(post.timestamp)}</p>
              {video.description && <p className={styles.descriptionText}>{video.description}</p>}
            </div>
            <Comments post={post} />
          </>
        )}
      </div>
      <aside className={styles.secondary} aria-label={`More from ${channelTitle}`}>
        <h2 className={styles.secondaryHeading}>More from {channelTitle}</h2>
        <div className={styles.moreList}>
          {moreVideos.map((candidate) => (
            <VideoCard key={candidate.cid} post={candidate} layout='compact' showChannel={false} />
          ))}
        </div>
      </aside>
    </div>
  );
};

export default Watch;
