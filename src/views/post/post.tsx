import { useMemo } from 'react';
import { Navigate, useParams } from 'react-router-dom';
import { useComment } from '@bitsocial/bitsocial-react-hooks';
import { useTranslation } from 'react-i18next';
import { Comments } from '../../components/comments';
import { PostCard } from '../../components/post-card';
import { getChannelAddressFromHandle, getChannelIdentifier, videoPath } from '../../lib/channels';
import { isPlayableVideoPost } from '../../lib/video-sources';
import styles from './post.module.css';

/** A channel's feed post on its own page, with its comments, like YouTube's /post pages. */
const Post = () => {
  const { t } = useTranslation();
  const { channelHandle, postCid = '' } = useParams();
  const channelAddress = getChannelAddressFromHandle(channelHandle) ?? '';
  const community = useMemo(() => getChannelIdentifier(channelAddress), [channelAddress]);
  const post = useComment({ commentCid: postCid, community });
  const loaded = Boolean(post.timestamp);

  // A video's page is the watch page.
  if (loaded && isPlayableVideoPost(post)) return <Navigate to={videoPath(channelAddress, postCid)} replace />;

  return (
    <div className={styles.page}>
      {loaded ? (
        <>
          <PostCard post={post} layout='page' />
          <Comments post={post} />
        </>
      ) : (
        <p className={styles.status} role='status'>
          {post.error ? t('could_not_load_post', { error: post.error.message }) : t('loading_post')}
        </p>
      )}
    </div>
  );
};

export default Post;
