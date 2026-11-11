import { Link, useLocation } from 'react-router-dom';
import { Trans, useTranslation } from 'react-i18next';
import { REPOSITORY_URL, type PlannedPagePath } from '../../data/navigation';
import styles from './planned.module.css';

/** The page behind a sidebar section that is not built yet: what it will do. */
const Planned = () => {
  const { t } = useTranslation();
  const { pathname } = useLocation();
  const pages = new Map<string, { title: string; description: string }>([
    ['/feed/subscriptions', { title: t('subscriptions'), description: t('subscriptions_description') }],
    ['/feed/liked', { title: t('liked_videos'), description: t('liked_videos_description') }],
    ['/feed/history', { title: t('history'), description: t('history_description') }],
    ['/categories', { title: t('categories'), description: t('categories_description') }],
    ['/feed/playlists', { title: t('playlists'), description: t('playlists_description') }],
    ['/settings', { title: t('settings'), description: t('settings_description') }],
    ['/signin', { title: t('sign_in'), description: t('sign_in_description') }],
  ] satisfies [PlannedPagePath, { title: string; description: string }][]);
  const page = pages.get(pathname);
  if (!page) return null;

  return (
    <section className={styles.planned}>
      <h1 className={styles.title}>{page.title}</h1>
      <p className={styles.description}>{page.description}</p>
      <p className={styles.status}>
        <Trans
          t={t}
          i18nKey='planned_status'
          components={{
            roadmapLink: <a href={`${REPOSITORY_URL}/blob/master/roadmap.md`} target='_blank' rel='noopener noreferrer' />,
            homeLink: <Link to='/' />,
          }}
        />
      </p>
    </section>
  );
};

export default Planned;
