import { Link, NavLink } from 'react-router-dom';
import { CircleUserRound, Clock, History, House, LayoutGrid, ListVideo, Settings, ThumbsUp, Users, type LucideIcon } from 'lucide-react';
import bitsocialLogo from '../../assets/bitsocial-logo.png';
import { REPOSITORY_URL, SIDEBAR_ITEMS } from '../../data/navigation';
import styles from './sidebar.module.css';

const ICONS: Record<string, LucideIcon> = {
  '/': House,
  '/feed/subscriptions': Users,
  '/feed/liked': ThumbsUp,
  '/feed/history': History,
  '/feed/watch-later': Clock,
  '/categories': LayoutGrid,
  '/feed/playlists': ListVideo,
  '/settings': Settings,
};

const FOOTER_LINKS = [
  { href: `${REPOSITORY_URL}#readme`, label: 'About' },
  { href: `${REPOSITORY_URL}/blob/master/how-it-works.md`, label: 'How WeTube works' },
  { href: `${REPOSITORY_URL}/blob/master/roadmap.md`, label: 'Roadmap' },
  { href: `${REPOSITORY_URL}/issues/new`, label: 'Feedback' },
  { href: 'https://t.me/bitsocialnet', label: 'Contact us' },
  { href: REPOSITORY_URL, label: 'Source code' },
  { href: `${REPOSITORY_URL}/blob/master/LICENSE`, label: 'GPL-3.0' },
];

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
export const Sidebar = ({ expanded, overlay, drawerOpen, onCloseDrawer }: SidebarProps) => (
  <>
    {drawerOpen && <div className={styles.backdrop} onClick={onCloseDrawer} aria-hidden='true' />}
    <nav
      className={styles.sidebar}
      data-expanded={expanded || undefined}
      data-overlay={overlay || undefined}
      data-drawer-open={drawerOpen || undefined}
      aria-label='Main'
    >
      <div className={styles.items}>
        {SIDEBAR_ITEMS.map(({ path, label, shortLabel }) => {
          const Icon = ICONS[path];
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
      <section className={styles.signIn} aria-label='Sign in'>
        <p>Sign in to like videos, comment, and subscribe.</p>
        <Link to='/signin' className={styles.signInButton} onClick={onCloseDrawer}>
          <CircleUserRound size={20} aria-hidden='true' />
          Sign in
        </Link>
      </section>
      <footer className={styles.footer}>
        <nav className={styles.footerLinks} aria-label='About WeTube'>
          {FOOTER_LINKS.map((link) => (
            <a key={link.label} href={link.href} target='_blank' rel='noopener noreferrer'>
              {link.label}
            </a>
          ))}
        </nav>
        <a className={styles.poweredBy} href='https://bitsocial.net' target='_blank' rel='noopener noreferrer'>
          Powered by
          <img src={bitsocialLogo} alt='' width='16' height='16' />
          Bitsocial
        </a>
        <p className={styles.tagline}>Our tubes, our rules.</p>
      </footer>
    </nav>
  </>
);
