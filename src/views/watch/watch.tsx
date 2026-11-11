import { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useComment } from '@bitsocial/bitsocial-react-hooks';
import { Check, Clock, Share2, ThumbsDown, ThumbsUp } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { ChannelAvatar } from '../../components/channel-avatar';
import { Comments } from '../../components/comments';
import { Player } from '../../components/player';
import { SignInPrompt } from '../../components/sign-in-prompt';
import { SubscribeButtons } from '../../components/subscribe-buttons';
import { useChannel } from '../../hooks/use-channel';
import { useFormat } from '../../hooks/use-format';
import { useWatchLater } from '../../hooks/use-watch-later';
import { channelPath, getChannelAddressFromHandle, getChannelIdentifier, shortAddress } from '../../lib/channels';
import { copyText } from '../../lib/clipboard';
import { getVideo } from '../../lib/video-sources';
import { toggleWatchLater } from '../../lib/watch-later';
import { RelatedVideos } from './related-videos';
import { VideoDescription } from './video-description';
import styles from './watch.module.css';

// Copies the page's link; the hash route is the whole address of the video.
const ShareButton = () => {
  const { t } = useTranslation();
  const [state, setState] = useState<'idle' | 'copied' | 'failed'>('idle');
  const share = () => {
    void copyText(window.location.href).then((copied) => {
      setState(copied ? 'copied' : 'failed');
      window.setTimeout(() => setState('idle'), 2000);
    });
  };
  return (
    <button type='button' className={styles.actionButton} onClick={share} aria-live='polite'>
      {state === 'copied' ? <Check size={20} aria-hidden='true' /> : <Share2 size={20} aria-hidden='true' />}
      {state === 'copied' ? t('link_copied') : state === 'failed' ? t('copy_failed') : t('share')}
    </button>
  );
};

const Watch = () => {
  const { t, count } = useFormat();
  const { channelHandle, videoCid = '' } = useParams();
  const channelAddress = getChannelAddressFromHandle(channelHandle) ?? '';
  const community = useMemo(() => getChannelIdentifier(channelAddress), [channelAddress]);
  const post = useComment({ commentCid: videoCid, community });
  const channel = useChannel(channelAddress);
  const video = useMemo(() => getVideo(post), [post]);
  const savedForLater = useWatchLater().some((saved) => saved.cid === videoCid);
  const loaded = Boolean(post.timestamp);
  const channelTitle = channel.title || shortAddress(channelAddress);

  return (
    <div className={styles.layout}>
      <div className={styles.primary}>
        {loaded && video ? (
          <Player key={videoCid} sources={video.sources} title={video.title || t('untitled_video')} />
        ) : (
          <div className={styles.playerPlaceholder} role='status'>
            {post.error ? t('could_not_load_video', { error: post.error.message }) : t('loading_video_post')}
          </div>
        )}
        {loaded && video && (
          <>
            <h1 className={styles.title} dir='auto'>
              {video.title || t('untitled_video')}
            </h1>
            <div className={styles.ownerRow}>
              <div className={styles.owner}>
                <Link to={channelPath(channelAddress)} className={styles.ownerLink}>
                  <ChannelAvatar address={channelAddress} title={channel.title} avatarUrl={channel.suggested?.avatarUrl} size={40} />
                  <span className={styles.ownerText}>
                    <span className={styles.ownerName}>{channelTitle}</span>
                    <span className={styles.ownerAddress} title={channelAddress}>
                      {shortAddress(channelAddress)}
                    </span>
                  </span>
                </Link>
                <SubscribeButtons channelAddress={channelAddress} />
              </div>
              <div className={styles.actions}>
                <div className={styles.votes}>
                  <SignInPrompt
                    className={styles.voteButton}
                    label={t('like_label', { likes: post.upvoteCount === 1 ? t('one_like') : t('x_likes', { number: count(post.upvoteCount) }) })}
                    title={t('like_video_title')}
                    text={t('sign_in_to_vote')}
                  >
                    <ThumbsUp size={20} aria-hidden='true' />
                    {count(post.upvoteCount)}
                  </SignInPrompt>
                  <span className={styles.voteDivider} aria-hidden='true' />
                  <SignInPrompt
                    className={styles.voteButton}
                    label={t('dislike_label', {
                      dislikes: post.downvoteCount === 1 ? t('one_dislike') : t('x_dislikes', { number: count(post.downvoteCount) }),
                    })}
                    title={t('dislike_video_title')}
                    text={t('sign_in_to_vote')}
                  >
                    <ThumbsDown size={20} aria-hidden='true' />
                    {count(post.downvoteCount)}
                  </SignInPrompt>
                </div>
                <ShareButton />
                <button type='button' className={styles.actionButton} aria-pressed={savedForLater} onClick={() => toggleWatchLater({ cid: videoCid, channelAddress })}>
                  {savedForLater ? <Check size={20} aria-hidden='true' /> : <Clock size={20} aria-hidden='true' />}
                  {savedForLater ? t('saved') : t('watch_later')}
                </button>
              </div>
            </div>
            <VideoDescription post={post} video={video} />
            <Comments post={post} />
          </>
        )}
      </div>
      <RelatedVideos key={channelAddress} channelAddress={channelAddress} channelTitle={channelTitle} videoCid={videoCid} />
    </div>
  );
};

export default Watch;
