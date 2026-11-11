import { useReplies, type Comment } from '@bitsocial/bitsocial-react-hooks';
import { channelHue, shortAddress } from '../../lib/channels';
import { formatCount, plural, timeAgo } from '../../lib/format';
import styles from './comments.module.css';

const authorName = (comment: Comment) => comment.author?.displayName || shortAddress(comment.author?.address) || 'Anonymous';

const CommentItem = ({ comment }: { comment: Comment }) => {
  const name = authorName(comment);
  const address: string = comment.author?.address ?? '';
  return (
    <li className={styles.comment}>
      <span className={styles.avatar} style={{ background: `hsl(${channelHue(address || name)} 45% 40%)` }} aria-hidden='true'>
        {name.charAt(0).toUpperCase()}
      </span>
      <div className={styles.body}>
        <p className={styles.meta}>
          <span className={styles.author} title={address}>
            {name}
          </span>
          {comment.timestamp && <span>{timeAgo(comment.timestamp)}</span>}
        </p>
        {comment.content && <p className={styles.content}>{comment.content}</p>}
        <p className={styles.stats}>
          <span aria-label={plural(comment.upvoteCount, 'like')}>▲ {formatCount(comment.upvoteCount)}</span>
          <span aria-label={plural(comment.downvoteCount, 'dislike')}>▼ {formatCount(comment.downvoteCount)}</span>
          {(comment.replyCount ?? 0) > 0 && <span>{plural(comment.replyCount, 'reply', 'replies')}</span>}
        </p>
      </div>
    </li>
  );
};

/** Top-level comments under a video, best first. Replies to comments come later. */
export const Comments = ({ post }: { post: Comment | undefined }) => {
  const { replies, hasMore, loadMore } = useReplies({ comment: post?.cid ? post : undefined, sortType: 'best', repliesPerPage: 20 });
  const visibleReplies = replies.filter((reply) => !reply.removed && !reply.deleted);

  return (
    <section className={styles.comments} aria-labelledby='comments-heading'>
      <h2 id='comments-heading' className={styles.heading}>
        {plural(post?.replyCount, 'comment')}
      </h2>
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
