import { useId, useState, type RefObject } from 'react';
import { AtSign, CalendarDays, Check, Copy, PlaySquare, UsersRound, X } from 'lucide-react';
import { copyText } from '../../lib/clipboard';
import { formatDate, plural } from '../../lib/format';
import styles from './channel.module.css';

interface ChannelAboutProps {
  dialogRef: RefObject<HTMLDialogElement | null>;
  channelAddress: string;
  title: string;
  description: string | undefined;
  /** When the community was created, in seconds. */
  createdAt: number | undefined;
  videoCount: number | undefined;
}

const CopyAddressButton = ({ address }: { address: string }) => {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    void copyText(address).then((done) => {
      if (!done) return;
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    });
  };
  return (
    <button type='button' className={styles.aboutIconButton} aria-label={copied ? 'Address copied' : 'Copy address'} title='Copy address' onClick={copy}>
      {copied ? <Check size={18} aria-hidden='true' /> : <Copy size={18} aria-hidden='true' />}
    </button>
  );
};

/** YouTube's About dialog, opened by "…more": the whole description and the channel's details. */
export const ChannelAbout = ({ dialogRef, channelAddress, title, description, createdAt, videoCount }: ChannelAboutProps) => {
  const headingId = useId();
  const close = () => dialogRef.current?.close();

  return (
    // A click on the backdrop lands on the dialog itself, outside its padded body, and closes it.
    <dialog
      ref={dialogRef}
      className={styles.about}
      aria-labelledby={headingId}
      onClick={(event) => {
        if (event.target === event.currentTarget) close();
      }}
    >
      <div className={styles.aboutBody}>
        <div className={styles.aboutTop}>
          <h2 id={headingId} className={styles.aboutTitle}>
            About {title}
          </h2>
          <button type='button' className={styles.aboutIconButton} aria-label='Close' onClick={close}>
            <X size={22} aria-hidden='true' />
          </button>
        </div>
        {description && <p className={styles.aboutDescription}>{description}</p>}
        <h3 className={styles.aboutHeading}>Channel details</h3>
        <ul className={styles.aboutDetails}>
          <li>
            <AtSign size={20} aria-hidden='true' />
            <span className={styles.aboutAddress}>{channelAddress}</span>
            <CopyAddressButton address={channelAddress} />
          </li>
          <li>
            <UsersRound size={20} aria-hidden='true' />
            <span title='Subscriber counts are not available yet'>? subscribers</span>
          </li>
          <li>
            <PlaySquare size={20} aria-hidden='true' />
            <span>{videoCount === undefined ? '? videos' : plural(videoCount, 'video')}</span>
          </li>
          {createdAt ? (
            <li>
              <CalendarDays size={20} aria-hidden='true' />
              <span>Joined {formatDate(createdAt)}</span>
            </li>
          ) : null}
        </ul>
      </div>
    </dialog>
  );
};
