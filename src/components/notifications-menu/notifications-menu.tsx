import { useCallback, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useNotifications, type Notification } from '@bitsocial/bitsocial-react-hooks';
import { Bell } from 'lucide-react';
import { useDismiss } from '../../hooks/use-dismiss';
import { shortAddress, videoPath } from '../../lib/channels';
import { timeAgo } from '../../lib/format';
import styles from './notifications-menu.module.css';

const MAX_SHOWN = 20;

// A notification is a reply to one of the account's comments; it opens the video it was posted under.
const NotificationItem = ({ notification, onOpen }: { notification: Notification; onOpen: () => void }) => {
  const author: string = notification.author?.displayName || shortAddress(notification.author?.address) || 'Someone';
  const text: string = notification.content || notification.title || '';
  const content = (
    <>
      <span className={styles.itemText}>
        <strong>{author}</strong> replied: {text.length > 120 ? `${text.slice(0, 120)}…` : text}
      </span>
      {notification.timestamp && <span className={styles.itemTime}>{timeAgo(notification.timestamp)}</span>}
    </>
  );
  const postCid: string | undefined = notification.postCid;
  const channelAddress: string | undefined = notification.communityAddress;
  return postCid && channelAddress ? (
    <Link to={videoPath(channelAddress, postCid)} className={styles.item} data-unread={!notification.markedAsRead || undefined} onClick={onOpen}>
      {content}
    </Link>
  ) : (
    <div className={styles.item}>{content}</div>
  );
};

/** YouTube's notification bell, fed by the account's notifications from bitsocial-react-hooks. */
export const NotificationsMenu = () => {
  const { notifications, markAsRead } = useNotifications();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const unread = notifications.filter((notification) => !notification.markedAsRead).length;
  const dismiss = useCallback((reason: 'outside' | 'escape') => {
    setOpen(false);
    if (reason === 'escape') buttonRef.current?.focus();
  }, []);
  useDismiss(open, rootRef, dismiss);

  const toggle = () => {
    // Opening the list marks everything in it as seen, as YouTube does.
    if (!open && unread > 0) void markAsRead();
    setOpen(!open);
  };

  return (
    <div className={styles.root} ref={rootRef}>
      <button
        ref={buttonRef}
        type='button'
        className={styles.trigger}
        aria-label={unread > 0 ? `Notifications, ${unread} unread` : 'Notifications'}
        aria-haspopup='dialog'
        aria-expanded={open}
        onClick={toggle}
      >
        <Bell size={22} aria-hidden='true' />
        {unread > 0 && <span className={styles.badge}>{unread > 9 ? '9+' : unread}</span>}
      </button>
      {open && (
        <div className={styles.panel} role='dialog' aria-label='Notifications'>
          <h2 className={styles.title}>Notifications</h2>
          {notifications.length === 0 ? (
            <p className={styles.empty}>No notifications yet. Replies to your comments will show up here.</p>
          ) : (
            <div className={styles.list}>
              {notifications.slice(0, MAX_SHOWN).map((notification) => (
                <NotificationItem key={notification.cid} notification={notification} onOpen={() => setOpen(false)} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
