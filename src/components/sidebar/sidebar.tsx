import { Link, NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { CircleUserRound, Clock, History, House, LayoutGrid, ListVideo, Settings, ThumbsUp, Users, type LucideIcon } from 'lucide-react';
import bitsocialLogo from '../../assets/bitsocial-logo.png';
import { REPOSITORY_URL, SIDEBAR_PATHS, type SidebarPath } from '../../data/navigation';
import styles from './sidebar.module.css';

const ICONS: Record<SidebarPath, LucideIcon> = {
  '/': House,
  '/feed/subscriptions': Users,
  '/feed/liked': ThumbsUp,
  '/feed/history': History,
  '/feed/watch-later': Clock,
  '/categories': LayoutGrid,
  '/feed/playlists': ListVideo,
  '/settings': Settings,
};

interface SidebarProps {
  /** Wide screens: the full sidebar instead of the compact icon rail. */
  expanded: boolean;
  /** The watch page and small screens show no sidebar; the menu button opens it as a drawer. */
  overlay: boolean;
  drawerOpen: boolean;
  onCloseDrawer: () => void;
}

/**
 * YouTube-style navigation: a compact rail by default that the menu button expands, hidden on the watch
 * page and on phones, where the menu button opens it as a drawer. The full sidebar adds the sign-in
 * section and the footer.
 */
export const Sidebar = ({ expanded, overlay, drawerOpen, onCloseDrawer }: SidebarProps) => {
  const { t } = useTranslation();
  // The full name for the expanded sidebar and a short one that fits the compact rail.
  const labels: Record<SidebarPath, [label: string, shortLabel: string]> = {
    '/': [t('home'), t('home')],
    '/feed/subscriptions': [t('subscriptions'), t('subscriptions')],
    '/feed/liked': [t('liked_videos'), t('liked_short')],
    '/feed/history': [t('history'), t('history')],
    '/feed/watch-later': [t('watch_later'), t('watch_later_short')],
    '/categories': [t('categories'), t('categories')],
    '/feed/playlists': [t('playlists'), t('playlists')],
    '/settings': [t('settings'), t('settings')],
  };
  const footerLinks = [
    { href: `${REPOSITORY_URL}#readme`, label: t('about') },
    { href: `${REPOSITORY_URL}/blob/master/how-it-works.md`, label: t('how_wetube_works') },
    { href: `${REPOSITORY_URL}/blob/master/roadmap.md`, label: t('roadmap') },
    { href: `${REPOSITORY_URL}/issues/new`, label: t('feedback') },
    { href: 'https://t.me/bitsocialnet', label: t('contact_us') },
    { href: REPOSITORY_URL, label: t('source_code') },
    { href: `${REPOSITORY_URL}/blob/master/LICENSE`, label: 'GPL-3.0' },
  ];

  return (
    <>
      {drawerOpen && <div className={styles.backdrop} onClick={onCloseDrawer} aria-hidden='true' />}
      <nav
        className={styles.sidebar}
        data-expanded={expanded || undefined}
        data-overlay={overlay || undefined}
        data-drawer-open={drawerOpen || undefined}
        aria-label={t('main_navigation')}
      >
        <div className={styles.items}>
          {SIDEBAR_PATHS.map((path) => {
            const Icon = ICONS[path];
            const [label, shortLabel] = labels[path];
            return (
              <NavLink key={path} to={path} end className={styles.item} onClick={onCloseDrawer} title={label}>
                <Icon size={22} aria-hidden='true' />
                <span className={styles.fullLabel}>{label}</span>
                <span className={styles.shortLabel} aria-hidden='true'>
                  {shortLabel}
                </span>
              </NavLink>
            );
          })}
        </div>
        {/* Signed-in viewers will see their subscriptions here instead (BSIP-14 profiles through Forge RPC). */}
        <section className={styles.signIn} aria-label={t('sign_in')}>
          <p>{t('sidebar_sign_in_text')}</p>
          <Link to='/signin' className={styles.signInButton} onClick={onCloseDrawer}>
            <CircleUserRound size={20} aria-hidden='true' />
            {t('sign_in')}
          </Link>
        </section>
        <footer className={styles.footer}>
          <nav className={styles.footerLinks} aria-label={t('about_wetube')}>
            {footerLinks.map((link) => (
              <a key={link.href} href={link.href} target='_blank' rel='noopener noreferrer'>
                {link.label}
              </a>
            ))}
          </nav>
          <a className={styles.poweredBy} href='https://bitsocial.net' target='_blank' rel='noopener noreferrer'>
            {t('powered_by_bitsocial')}
            <img src={bitsocialLogo} alt='' width='16' height='16' />
          </a>
          <p className={styles.tagline}>{t('tagline')}</p>
        </footer>
      </nav>
    </>
  );
};
