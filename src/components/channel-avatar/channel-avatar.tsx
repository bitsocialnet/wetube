import { useState, type CSSProperties } from 'react';
import { channelHue } from '../../lib/channels';
import styles from './channel-avatar.module.css';

interface ChannelAvatarProps {
  address: string;
  title?: string;
  avatarUrl?: string;
  /** In pixels. Without it, the size comes from --avatar-size, which className can set per breakpoint. */
  size?: number;
  className?: string;
}

/** The channel's avatar image when it sets one (community.suggested.avatarUrl), otherwise its initial. */
export const ChannelAvatar = ({ address, title, avatarUrl, size, className }: ChannelAvatarProps) => {
  const [failedUrl, setFailedUrl] = useState<string>();
  const initial =
    (title || address)
      .replace(/^[^a-z0-9]+/i, '')
      .charAt(0)
      .toUpperCase() || '?';
  const showImage = avatarUrl && failedUrl !== avatarUrl;

  return (
    <span
      className={className ? `${styles.avatar} ${className}` : styles.avatar}
      style={{ ...(size ? { '--avatar-size': `${size}px` } : {}), background: `hsl(${channelHue(address)} 55% 42%)` } as CSSProperties}
      aria-hidden='true'
    >
      {showImage ? <img src={avatarUrl} alt='' loading='lazy' referrerPolicy='no-referrer' onError={() => setFailedUrl(avatarUrl)} /> : initial}
    </span>
  );
};
