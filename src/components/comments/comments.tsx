import { useCallback, useRef, useState } from 'react';
import { useAccount, useReplies, type Comment } from '@bitsocial/bitsocial-react-hooks';
import { Check, ListFilter, ThumbsDown, ThumbsUp } from 'lucide-react';
import { useDismiss } from '../../hooks/use-dismiss';
import { channelHue, shortAddress } from '../../lib/channels';
import { formatCount, plural, timeAgo } from '../../lib/format';
import { SignInPrompt } from '../sign-in-prompt';
import styles from './comments.module.css';

const SORTS = [
  { value: 'best', label: 'Top comments' },
  { value: 'new', label: 'Newest first' },
] as const;
type Sort = (typeof SORTS)[number]['value'];

const authorName = (comment: Comment) => comment.author?.displayName || shortAddress(comment.author?.address) || 'Anonymous';

const Avatar = ({ seed, name, size = 36 }: { seed: string; name: string; size?: number }) => (
  <span className={styles.avatar} style={{ width: size, height: size, background: `hsl(${channelHue(seed)} 45% 40%)` }} aria-hidden='true'>
    {name.charAt(0).toUpperCase()}
  </span>
);

const CommentItem = ({ comment }: { comment: Comment }) => {
  const name = authorName(comment);
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
            label={`Like (${plural(comment.upvoteCount, 'like')})`}
            title='Like this comment?'
            text='Sign in to make your opinion count.'
          >
            <ThumbsUp size={16} aria-hidden='true' />
            {formatCount(comment.upvoteCount)}
          </SignInPrompt>
          <SignInPrompt
            className={styles.voteButton}
            label={`Dislike (${plural(comment.downvoteCount, 'dislike')})`}
            title="Don't like this comment?"
            text='Sign in to make your opinion count.'
          >
            <ThumbsDown size={16} aria-hidden='true' />
            {formatCount(comment.downvoteCount)}
          </SignInPrompt>
          {(comment.replyCount ?? 0) > 0 && <span className={styles.replies}>{plural(comment.replyCount, 'reply', 'replies')}</span>}
        </div>
      </div>
    </li>
  );
};

const SortMenu = ({ sort, onChange }: { sort: Sort; onChange: (sort: Sort) => void }) => {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const close = useCallback(() => setOpen(false), []);
  useDismiss(open, rootRef, close);
  return (
    <div className={styles.sort} ref={rootRef}>
      <button type='button' className={styles.sortButton} aria-haspopup='menu' aria-expanded={open} onClick={() => setOpen(!open)}>
        <ListFilter size={20} aria-hidden='true' />
        Sort by
      </button>
      {open && (
        <div className={styles.sortMenu} role='menu' aria-label='Sort comments'>
          {SORTS.map((option) => (
            <button
              key={option.value}
              type='button'
              role='menuitemradio'
              aria-checked={sort === option.value}
              className={styles.sortOption}
              onClick={() => {
                onChange(option.value);
                setOpen(false);
              }}
            >
              <span className={styles.check}>{sort === option.value && <Check size={16} aria-hidden='true' />}</span>
              {option.label}
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
  const account = useAccount();
  const { replies, hasMore, loadMore } = useReplies({ comment: post?.cid ? post : undefined, sortType: sort, repliesPerPage: 20 });
  const visibleReplies = replies.filter((reply) => !reply.removed && !reply.deleted);
  const accountName: string = account?.author?.displayName || 'Anonymous';

  return (
    <section className={styles.comments} aria-labelledby='comments-heading'>
      <div className={styles.header}>
        <h2 id='comments-heading' className={styles.heading}>
          {plural(post?.replyCount, 'comment')}
        </h2>
        <SortMenu sort={sort} onChange={setSort} />
      </div>
      <div className={styles.compose}>
        <Avatar seed={account?.author?.address || accountName} name={accountName} size={40} />
        <SignInPrompt className={styles.composeField} title='Want to join the conversation?' text='Sign in to comment.'>
          Add a comment…
        </SignInPrompt>
      </div>
      {visibleReplies.length > 0 ? (
        <ul className={styles.list}>
          {visibleReplies.map((reply) => (
            <CommentItem key={reply.cid} comment={reply} />
          ))}
        </ul>
      ) : (
        !hasMore && <p className={styles.empty}>No comments yet.</p>
      )}
      {hasMore && (
        <button type='button' className={styles.more} onClick={() => void loadMore()}>
          {visibleReplies.length > 0 ? 'Show more comments' : 'Load comments'}
        </button>
      )}
    </section>
  );
};
