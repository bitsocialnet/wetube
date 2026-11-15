import { Link } from 'react-router-dom';
import { Menu, MenuContent, MenuItem, MenuTrigger } from '@ui-sdk/react/menu';
import { useTranslation } from 'react-i18next';
import { Plus, SquarePen, SquarePlay } from 'lucide-react';
import styles from './create-menu.module.css';

/**
 * YouTube's Create button, with what a WeTube channel owner can publish: a video or a feed post
 * (how-it-works.md). Both pages say what they will do until channel creation and uploads exist.
 */
export const CreateMenu = () => {
  const { t } = useTranslation();

  return (
    <Menu presentation='auto'>
      <MenuTrigger className={styles.trigger} aria-label={t('create')}>
        <Plus size={24} aria-hidden='true' />
        <span className={styles.triggerText}>{t('create')}</span>
      </MenuTrigger>
      <MenuContent className={styles.menu} aria-label={t('create')} align='end' sideOffset={6}>
        <MenuItem className={styles.item} render={<Link to='/upload' />}>
          <SquarePlay size={20} aria-hidden='true' />
          {t('upload_video')}
        </MenuItem>
        <MenuItem className={styles.item} render={<Link to='/create-post' />}>
          <SquarePen size={20} aria-hidden='true' />
          {t('create_post')}
        </MenuItem>
      </MenuContent>
    </Menu>
  );
};
