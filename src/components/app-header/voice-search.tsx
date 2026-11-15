import { Popover, PopoverContent, PopoverDescription, PopoverTitle, PopoverTrigger } from '@ui-sdk/react/popover';
import { useTranslation } from 'react-i18next';
import { Mic } from 'lucide-react';
import styles from './app-header.module.css';

/** YouTube's microphone next to the search box. Voice search is not built yet; the button says so. */
export const VoiceSearch = () => {
  const { t } = useTranslation();

  return (
    <Popover>
      <PopoverTrigger className={styles.voiceButton} aria-label={t('search_with_voice')} title={t('search_with_voice')}>
        <Mic size={20} aria-hidden='true' />
      </PopoverTrigger>
      <PopoverContent className={styles.voicePopover} align='center' sideOffset={8}>
        <PopoverTitle className={styles.voiceTitle}>{t('search_with_voice')}</PopoverTitle>
        <PopoverDescription className={styles.voiceText}>{t('voice_search_unavailable')}</PopoverDescription>
      </PopoverContent>
    </Popover>
  );
};
