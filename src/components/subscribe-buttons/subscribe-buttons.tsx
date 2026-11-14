import { useSubscribe } from '@bitsocial/bitsocial-react-hooks';
import { useTranslation } from 'react-i18next';
import { Bell, BellOff } from 'lucide-react';
import { useChannelBell } from '../../hooks/use-channel-bell';
import { setChannelBell } from '../../lib/channel-notifications';
import styles from './subscribe-buttons.module.css';

interface SubscribeButtonsProps {
  channelAddress: string;
  /** 40px on the channel page, 36px next to a video, as on YouTube. */
  size?: 'medium' | 'large';
}

/**
 * Subscribe, and once subscribed a separate bell. Unlike YouTube's menu there are two states each:
 * subscribed or not, and the bell on or off. The subscription is the account's list of communities
 * (useSubscribe), kept by this browser's Bitsocial account; nothing is published.
 */
export const SubscribeButtons = ({ channelAddress, size = 'medium' }: SubscribeButtonsProps) => {
  const { t } = useTranslation();
  const { subscribed, subscribe, unsubscribe, state } = useSubscribe({ communityAddress: channelAddress });
  const bellOn = useChannelBell(channelAddress);

  return (
    <span className={styles.buttons} data-size={size}>
      <button
        type='button'
        className={styles.subscribe}
        aria-pressed={Boolean(subscribed)}
        disabled={state !== 'ready'}
        onClick={() => void (subscribed ? unsubscribe() : subscribe())}
      >
        {subscribed ? t('subscribed') : t('subscribe')}
      </button>
      {subscribed && (
        <button
          type='button'
          className={styles.bell}
          aria-label={t('channel_notifications')}
          aria-pressed={bellOn}
          title={bellOn ? t('turn_off_notifications') : t('turn_on_notifications')}
          onClick={() => setChannelBell(channelAddress, !bellOn)}
        >
          {bellOn ? <Bell size={20} aria-hidden='true' /> : <BellOff size={20} aria-hidden='true' />}
        </button>
      )}
    </span>
  );
};
