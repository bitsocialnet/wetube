import { useRef, useState } from 'react';
import { useSubscribe } from '@bitsocial/bitsocial-react-hooks';
import { AlertDialog, AlertDialogBackdrop, AlertDialogClose, AlertDialogContent, AlertDialogTitle, createConfirm } from '@ui-sdk/react/alert-dialog';
import { Menu, MenuContent, MenuItem, MenuItemIndicator, MenuRadioGroup, MenuRadioItem, MenuTrigger } from '@ui-sdk/react/menu';
import { useTranslation } from 'react-i18next';
import { BellOff, BellRing, Check, ChevronDown, UserRoundMinus } from 'lucide-react';
import { useChannelBell } from '../../hooks/use-channel-bell';
import { setChannelBell } from '../../lib/channel-notifications';
import styles from './subscribe-button.module.css';

interface SubscribeButtonProps {
  channelAddress: string;
  /** Named in the "Unsubscribe from…?" question. */
  channelTitle: string;
  /** 40px on the channel page, 36px next to a video, as on YouTube. */
  size?: 'medium' | 'large';
}

/**
 * YouTube's Subscribe button. Once subscribed it becomes a menu for the channel's notifications (all or
 * none; WeTube has no "personalized") and Unsubscribe, which asks first. The subscription is the account's
 * list of communities (useSubscribe), kept by this browser's Bitsocial account; nothing is published.
 */
export const SubscribeButton = ({ channelAddress, channelTitle, size = 'medium' }: SubscribeButtonProps) => {
  const { t } = useTranslation();
  const { subscribed, subscribe, unsubscribe, state } = useSubscribe({ communityAddress: channelAddress });
  const bellOn = useChannelBell(channelAddress);
  const [confirm] = useState(() => createConfirm());
  // Unsubscribing replaces the menu button with Subscribe; focus follows it there once.
  const focusSubscribe = useRef(false);

  const askToUnsubscribe = async () => {
    if (!(await confirm())) return;
    focusSubscribe.current = true;
    await unsubscribe();
  };

  return (
    <span className={styles.root} data-size={size}>
      {subscribed ? (
        <Menu>
          <MenuTrigger className={styles.subscribed}>
            {bellOn ? <BellRing size={20} aria-hidden='true' /> : <BellOff size={20} aria-hidden='true' />}
            {t('subscribed')}
            <ChevronDown size={18} aria-hidden='true' />
          </MenuTrigger>
          <MenuContent className={styles.menu} aria-label={t('subscribed')} align='start' sideOffset={6}>
            <MenuRadioGroup
              name='notifications'
              aria-label={t('channel_notifications')}
              value={bellOn ? 'all' : 'none'}
              onValueChange={(value: string) => setChannelBell(channelAddress, value === 'all')}
            >
              <MenuRadioItem className={styles.item} value='all' closeOnSelect>
                <BellRing size={20} aria-hidden='true' />
                <span className={styles.label}>{t('notifications_all')}</span>
                <MenuItemIndicator className={styles.check} keepMounted>
                  <Check size={18} aria-hidden='true' />
                </MenuItemIndicator>
              </MenuRadioItem>
              <MenuRadioItem className={styles.item} value='none' closeOnSelect>
                <BellOff size={20} aria-hidden='true' />
                <span className={styles.label}>{t('notifications_none')}</span>
                <MenuItemIndicator className={styles.check} keepMounted>
                  <Check size={18} aria-hidden='true' />
                </MenuItemIndicator>
              </MenuRadioItem>
            </MenuRadioGroup>
            {/* The dialog lives outside the menu, which closes first; a returned promise would hold the menu open. */}
            <MenuItem className={styles.item} onSelect={() => void askToUnsubscribe()}>
              <UserRoundMinus size={20} aria-hidden='true' />
              <span className={styles.label}>{t('unsubscribe')}</span>
            </MenuItem>
          </MenuContent>
        </Menu>
      ) : (
        <button
          ref={(node) => {
            if (!node || !focusSubscribe.current) return;
            focusSubscribe.current = false;
            node.focus();
          }}
          type='button'
          className={styles.subscribe}
          disabled={state !== 'ready'}
          onClick={() => void subscribe()}
        >
          {t('subscribe')}
        </button>
      )}
      <AlertDialog controller={confirm.controller}>
        <AlertDialogBackdrop className={styles.backdrop} />
        <AlertDialogContent className={styles.confirm}>
          <AlertDialogTitle className={styles.confirmTitle} dir='auto'>
            {t('unsubscribe_from', { channel: channelTitle })}
          </AlertDialogTitle>
          <div className={styles.confirmActions}>
            <AlertDialogClose className={styles.textButton}>{t('cancel')}</AlertDialogClose>
            <AlertDialogClose className={`${styles.textButton} ${styles.confirmButton}`} value='confirm'>
              {t('unsubscribe')}
            </AlertDialogClose>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </span>
  );
};
