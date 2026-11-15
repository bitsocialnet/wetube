import { Link, useLocation } from 'react-router-dom';
import { Trans, useTranslation } from 'react-i18next';
import { PLANNED_PAGE_PATHS, REPOSITORY_URL, type PlannedPagePath } from '../../data/navigation';
import styles from './planned.module.css';

/** The page behind a sidebar section or Create menu item that is not built yet: what it will do. */
const Planned = () => {
  const { t } = useTranslation();
  const { pathname } = useLocation();
  const pages: Record<PlannedPagePath, { title: string; description: string }> = {
    '/feed/subscriptions': { title: t('subscriptions'), description: t('subscriptions_description') },
    '/feed/liked': { title: t('liked_videos'), description: t('liked_videos_description') },
    '/feed/history': { title: t('history'), description: t('history_description') },
    '/categories': { title: t('categories'), description: t('categories_description') },
    '/feed/playlists': { title: t('playlists'), description: t('playlists_description') },
    '/settings': { title: t('settings'), description: t('settings_description') },
    '/signin': { title: t('sign_in'), description: t('sign_in_description') },
    '/upload': { title: t('upload_video'), description: t('upload_video_description') },
    '/create-post': { title: t('create_post'), description: t('create_post_description') },
  };
  const page = PLANNED_PAGE_PATHS.find((path) => path === pathname);
  if (!page) return null;
  const { title, description } = pages[page];

  return (
    <section className={styles.planned}>
      <h1 className={styles.title}>{title}</h1>
      <p className={styles.description}>{description}</p>
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
