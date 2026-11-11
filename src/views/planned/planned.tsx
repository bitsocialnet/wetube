import { Link, useLocation } from 'react-router-dom';
import { PLANNED_PAGES, REPOSITORY_URL } from '../../data/navigation';
import styles from './planned.module.css';

/** The page behind a sidebar section that is not built yet: what it will do. */
const Planned = () => {
  const { pathname } = useLocation();
  const page = PLANNED_PAGES.find((candidate) => candidate.path === pathname);
  if (!page) return null;

  return (
    <section className={styles.planned}>
      <h1 className={styles.title}>{page.title}</h1>
      <p className={styles.description}>{page.description}</p>
      <p className={styles.status}>
        Not built yet. Follow progress in the{' '}
        <a href={`${REPOSITORY_URL}/blob/master/roadmap.md`} target='_blank' rel='noopener noreferrer'>
          roadmap
        </a>
        , or go back <Link to='/'>home</Link>.
      </p>
    </section>
  );
};

export default Planned;
