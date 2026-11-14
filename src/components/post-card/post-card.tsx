import { useState } from 'react';
import { Link } from 'react-router-dom';
import type { Comment } from '@bitsocial/bitsocial-react-hooks';
import { MessageSquare, ThumbsDown, ThumbsUp } from 'lucide-react';
import { useChannel } from '../../hooks/use-channel';
import { useFormat } from '../../hooks/use-format';
import { getFeedPostMedia, type FeedPostMedia } from '../../lib/channel-posts';
import { channelPath, postPath, shortAddress } from '../../lib/channels';
import { ChannelAvatar } from '../channel-avatar';
import { SignInPrompt } from '../sign-in-prompt';
import styles from './post-card.module.css';

// Lists clamp a long post to four lines, as YouTube does, and "Read more" opens it in place.
const LONG_POST_LENGTH = 280;
const LONG_POST_LINES = 4;

interface PostCardProps {
  post: Comment;
  /** 'list' clamps long text with Read more, 'shelf' clamps it in a fixed-width card, 'page' shows all of it. */
  layout?: 'list' | 'shelf' | 'page';
}

const LinkCard = ({ media }: { media: FeedPostMedia }) => {
  const [thumbnailFailed, setThumbnailFailed] = useState(false);
  return (
    <a className={styles.linkCard} href={media.url} target='_blank' rel='noopener noreferrer'>
      {media.thumbnailUrl && !thumbnailFailed && (
        <img className={styles.linkThumbnail} src={media.thumbnailUrl} alt='' loading='lazy' referrerPolicy='no-referrer' onError={() => setThumbnailFailed(true)} />
      )}
      <span className={styles.linkText}>
        <span className={styles.linkHost}>{media.host}</span>
        <span className={styles.linkUrl}>{media.url}</span>
      </span>
    </a>
  );
};

const Media = ({ media }: { media: FeedPostMedia }) => {
  const { t } = useFormat();
  const [imageFailed, setImageFailed] = useState(false);
  if (media.kind === 'image' && !imageFailed) {
    return (
      <a className={styles.image} href={media.url} target='_blank' rel='noopener noreferrer' aria-label={t('open_image_on', { host: media.host })}>
        <img src={media.url} alt='' loading='lazy' referrerPolicy='no-referrer' onError={() => setImageFailed(true)} />
      </a>
    );
  }
  // An image that fails to load still leaves its link.
  return <LinkCard media={media} />;
};

/** A channel's feed post, as YouTube shows a post: the channel, the text, an image or link, and its votes. */
export const PostCard = ({ post, layout = 'list' }: PostCardProps) => {
  const { t, timeAgo, count } = useFormat();
  const [expanded, setExpanded] = useState(false);
  const channelAddress: string = post.communityAddress;
  const channel = useChannel(channelAddress, { onlyIfCached: true });
  if (!post.cid || !channelAddress) return null;

  const href = postPath(channelAddress, post.cid);
  const channelTitle = channel.title || shortAddress(channelAddress);
  const media = getFeedPostMedia(post);
  const content: string = post.content?.trim() ?? '';
  const edited = Boolean((post.edit as { timestamp?: number } | undefined)?.timestamp);
  const long = layout === 'list' && (content.length > LONG_POST_LENGTH || content.split('\n').length > LONG_POST_LINES);
  const clamped = layout === 'shelf' || (long && !expanded);
  // On its own page the post's title is the page's heading.
  const Title = layout === 'page' ? 'h1' : 'h3';

  return (
    <article className={styles.card} data-layout={layout}>
      <Link to={channelPath(channelAddress)} className={styles.avatarLink} tabIndex={-1} aria-hidden='true'>
        <ChannelAvatar address={channelAddress} title={channel.title} avatarUrl={channel.suggested?.avatarUrl} size={40} />
      </Link>
      <div className={styles.body}>
        <p className={styles.meta}>
          <Link to={channelPath(channelAddress)} className={styles.channelName}>
            {channelTitle}
          </Link>
          {layout === 'page' ? <span>{timeAgo(post.timestamp)}</span> : <Link to={href}>{timeAgo(post.timestamp)}</Link>}
          {edited && <span>{t('edited')}</span>}
        </p>
        {post.title && (
          <Title className={styles.title} dir='auto'>
            {post.title}
          </Title>
        )}
        {content && (
          <p className={styles.content} data-clamped={clamped || undefined} dir='auto'>
            {content}
          </p>
        )}
        {long && (
          <button type='button' className={styles.readMore} aria-expanded={expanded} onClick={() => setExpanded(!expanded)}>
            {expanded ? t('show_less') : t('read_more')}
          </button>
        )}
        {media && <Media media={media} />}
        <div className={styles.actions}>
          <SignInPrompt
            className={styles.action}
            label={t('like_label', { likes: post.upvoteCount === 1 ? t('one_like') : t('x_likes', { number: count(post.upvoteCount) }) })}
            title={t('like_post_title')}
            text={t('sign_in_to_vote')}
          >
            <ThumbsUp size={18} aria-hidden='true' />
            {count(post.upvoteCount)}
          </SignInPrompt>
          <SignInPrompt
            className={styles.action}
            label={t('dislike_label', { dislikes: post.downvoteCount === 1 ? t('one_dislike') : t('x_dislikes', { number: count(post.downvoteCount) }) })}
            title={t('dislike_post_title')}
            text={t('sign_in_to_vote')}
          >
            <ThumbsDown size={18} aria-hidden='true' />
          </SignInPrompt>
          {layout !== 'page' && (
            <Link
              to={href}
              className={styles.action}
              aria-label={t('comments_label', { comments: post.replyCount === 1 ? t('one_comment') : t('x_comments', { number: count(post.replyCount) }) })}
            >
              <MessageSquare size={18} aria-hidden='true' />
              {count(post.replyCount)}
            </Link>
          )}
        </div>
      </div>
    </article>
  );
};
