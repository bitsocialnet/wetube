import { useState } from 'react';
import { channelHue } from '../../lib/channels';
import styles from './channel-avatar.module.css';

interface ChannelAvatarProps {
  address: string;
  title?: string;
  avatarUrl?: string;
  size?: number;
}

/** The channel's avatar image when it sets one (community.suggested.avatarUrl), otherwise its initial. */
export const ChannelAvatar = ({ address, title, avatarUrl, size = 36 }: ChannelAvatarProps) => {
  const [failedUrl, setFailedUrl] = useState<string>();
  const initial =
    (title || address)
      .replace(/^[^a-z0-9]+/i, '')
      .charAt(0)
      .toUpperCase() || '?';
  const showImage = avatarUrl && failedUrl !== avatarUrl;

  return (
    <span className={styles.avatar} style={{ width: size, height: size, fontSize: size * 0.42, background: `hsl(${channelHue(address)} 55% 42%)` }} aria-hidden='true'>
      {showImage ? <img src={avatarUrl} alt='' loading='lazy' referrerPolicy='no-referrer' onError={() => setFailedUrl(avatarUrl)} /> : initial}
    </span>
  );
};
