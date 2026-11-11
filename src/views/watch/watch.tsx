import { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useComment } from '@bitsocial/bitsocial-react-hooks';
import { Check, Clock, Share2, ThumbsDown, ThumbsUp } from 'lucide-react';
import { ChannelAvatar } from '../../components/channel-avatar';
import { Comments } from '../../components/comments';
import { Player } from '../../components/player';
import { SignInPrompt } from '../../components/sign-in-prompt';
import { useChannel } from '../../hooks/use-channel';
import { useWatchLater } from '../../hooks/use-watch-later';
import { channelPath, getChannelAddressFromHandle, getChannelIdentifier, shortAddress } from '../../lib/channels';
import { copyText } from '../../lib/clipboard';
import { formatCount, plural } from '../../lib/format';
import { getVideo } from '../../lib/video-sources';
import { toggleWatchLater } from '../../lib/watch-later';
import { RelatedVideos } from './related-videos';
import { VideoDescription } from './video-description';
import styles from './watch.module.css';

// Copies the page's link; the hash route is the whole address of the video.
const ShareButton = () => {
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
      {state === 'copied' ? 'Link copied' : state === 'failed' ? 'Copy failed' : 'Share'}
    </button>
  );
};

const Watch = () => {
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
                <SignInPrompt className={styles.subscribeButton} title='Want to subscribe to this channel?' text='Sign in to subscribe to this channel.'>
                  Subscribe
                </SignInPrompt>
              </div>
              <div className={styles.actions}>
                <div className={styles.votes}>
                  <SignInPrompt
                    className={styles.voteButton}
                    label={`Like (${plural(post.upvoteCount, 'like')})`}
                    title='Like this video?'
                    text='Sign in to make your opinion count.'
                  >
                    <ThumbsUp size={20} aria-hidden='true' />
                    {formatCount(post.upvoteCount)}
                  </SignInPrompt>
                  <span className={styles.voteDivider} aria-hidden='true' />
                  <SignInPrompt
                    className={styles.voteButton}
                    label={`Dislike (${plural(post.downvoteCount, 'dislike')})`}
                    title="Don't like this video?"
                    text='Sign in to make your opinion count.'
                  >
                    <ThumbsDown size={20} aria-hidden='true' />
                    {formatCount(post.downvoteCount)}
                  </SignInPrompt>
                </div>
                <ShareButton />
                <button type='button' className={styles.actionButton} aria-pressed={savedForLater} onClick={() => toggleWatchLater({ cid: videoCid, channelAddress })}>
                  {savedForLater ? <Check size={20} aria-hidden='true' /> : <Clock size={20} aria-hidden='true' />}
                  {savedForLater ? 'Saved' : 'Watch later'}
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
