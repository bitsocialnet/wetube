import { useCallback, useRef, useState } from 'react';
import { useAccount, useReplies, type Comment } from '@bitsocial/bitsocial-react-hooks';
import { useTranslation } from 'react-i18next';
import { Check, ListFilter, ThumbsDown, ThumbsUp } from 'lucide-react';
import type { TFunction } from 'i18next';
import { useDismiss } from '../../hooks/use-dismiss';
import { useFormat } from '../../hooks/use-format';
import { channelHue, shortAddress } from '../../lib/channels';
import { SignInPrompt } from '../sign-in-prompt';
import styles from './comments.module.css';

const SORTS = ['best', 'new'] as const;
type Sort = (typeof SORTS)[number];

const authorName = (comment: Comment, t: TFunction) => comment.author?.displayName || shortAddress(comment.author?.address) || t('anonymous');

const Avatar = ({ seed, name, size = 36 }: { seed: string; name: string; size?: number }) => (
  <span className={styles.avatar} style={{ width: size, height: size, background: `hsl(${channelHue(seed)} 45% 40%)` }} aria-hidden='true'>
    {name.charAt(0).toUpperCase()}
  </span>
);

const CommentItem = ({ comment }: { comment: Comment }) => {
  const { t, timeAgo, count } = useFormat();
  const name = authorName(comment, t);
  const address: string = comment.author?.address ?? '';
  return (
    <li className={styles.comment}>
      <Avatar seed={address || name} name={name} />
      <div className={styles.body}>
        <p className={styles.meta}>
          <span className={styles.author} title={address}>
            {name}
          </span>
          {comment.timestamp && <span>{timeAgo(comment.timestamp)}</span>}
        </p>
        {comment.content && <p className={styles.content}>{comment.content}</p>}
        <div className={styles.stats}>
          <SignInPrompt
            className={styles.voteButton}
            label={t('like_label', { likes: comment.upvoteCount === 1 ? t('one_like') : t('x_likes', { number: count(comment.upvoteCount) }) })}
            title={t('like_comment_title')}
            text={t('sign_in_to_vote')}
          >
            <ThumbsUp size={16} aria-hidden='true' />
            {count(comment.upvoteCount)}
          </SignInPrompt>
          <SignInPrompt
            className={styles.voteButton}
            label={t('dislike_label', {
              dislikes: comment.downvoteCount === 1 ? t('one_dislike') : t('x_dislikes', { number: count(comment.downvoteCount) }),
            })}
            title={t('dislike_comment_title')}
            text={t('sign_in_to_vote')}
          >
            <ThumbsDown size={16} aria-hidden='true' />
            {count(comment.downvoteCount)}
          </SignInPrompt>
          {(comment.replyCount ?? 0) > 0 && (
            <span className={styles.replies}>{comment.replyCount === 1 ? t('one_reply') : t('x_replies', { number: count(comment.replyCount) })}</span>
          )}
        </div>
      </div>
    </li>
  );
};

const SortMenu = ({ sort, onChange }: { sort: Sort; onChange: (sort: Sort) => void }) => {
  const { t } = useTranslation();
  const labels: Record<Sort, string> = { best: t('top_comments'), new: t('newest_first') };
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const close = useCallback(() => setOpen(false), []);
  useDismiss(open, rootRef, close);
  return (
    <div className={styles.sort} ref={rootRef}>
      <button type='button' className={styles.sortButton} aria-haspopup='menu' aria-expanded={open} onClick={() => setOpen(!open)}>
        <ListFilter size={20} aria-hidden='true' />
        {t('sort_by')}
      </button>
      {open && (
        <div className={styles.sortMenu} role='menu' aria-label={t('sort_comments')}>
          {SORTS.map((option) => (
            <button
              key={option}
              type='button'
              role='menuitemradio'
              aria-checked={sort === option}
              className={styles.sortOption}
              onClick={() => {
                onChange(option);
                setOpen(false);
              }}
            >
              <span className={styles.check}>{sort === option && <Check size={16} aria-hidden='true' />}</span>
              {labels[option]}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

/** Top-level comments under a video, with a sort menu and a comment box that asks the viewer to sign in. */
export const Comments = ({ post }: { post: Comment | undefined }) => {
  const [sort, setSort] = useState<Sort>('best');
  const { t, count } = useFormat();
  const account = useAccount();
  const { replies, hasMore, loadMore } = useReplies({ comment: post?.cid ? post : undefined, sortType: sort, repliesPerPage: 20 });
  const visibleReplies = replies.filter((reply) => !reply.removed && !reply.deleted);
  const accountName: string = account?.author?.displayName || t('anonymous');

  return (
    <section className={styles.comments} aria-labelledby='comments-heading'>
      <div className={styles.header}>
        <h2 id='comments-heading' className={styles.heading}>
          {post?.replyCount === 1 ? t('one_comment') : t('x_comments', { number: count(post?.replyCount) })}
        </h2>
        <SortMenu sort={sort} onChange={setSort} />
      </div>
      <div className={styles.compose}>
        <Avatar seed={account?.author?.address || accountName} name={accountName} size={40} />
        <SignInPrompt className={styles.composeField} title={t('join_conversation_title')} text={t('sign_in_to_comment')}>
          {t('add_comment')}
        </SignInPrompt>
      </div>
      {visibleReplies.length > 0 ? (
        <ul className={styles.list}>
          {visibleReplies.map((reply) => (
            <CommentItem key={reply.cid} comment={reply} />
          ))}
        </ul>
      ) : (
        !hasMore && <p className={styles.empty}>{t('no_comments')}</p>
      )}
      {hasMore && (
        <button type='button' className={styles.more} onClick={() => void loadMore()}>
          {visibleReplies.length > 0 ? t('show_more_comments') : t('load_comments')}
        </button>
      )}
    </section>
  );
};
