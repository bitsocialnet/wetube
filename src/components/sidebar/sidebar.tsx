import { NavLink } from 'react-router-dom';
import { Clock, History, House, LayoutGrid, ListVideo, Settings, ThumbsUp, Users, type LucideIcon } from 'lucide-react';
import { PLANNED_PAGES } from '../../data/navigation';
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

const ITEMS = [{ path: '/', label: 'Home', shortLabel: 'Home' }, ...PLANNED_PAGES];

interface SidebarProps {
  /** Desktop: the full sidebar instead of the compact icon rail. */
  expanded: boolean;
  /** Small screens: the sidebar opens as a drawer over the page. */
  drawerOpen: boolean;
  onCloseDrawer: () => void;
}

/** YouTube-style navigation: a compact rail by default that the menu button expands, a drawer on phones. */
export const Sidebar = ({ expanded, drawerOpen, onCloseDrawer }: SidebarProps) => (
  <>
    {drawerOpen && <div className={styles.backdrop} onClick={onCloseDrawer} aria-hidden='true' />}
    <nav className={styles.sidebar} data-expanded={expanded || undefined} data-drawer-open={drawerOpen || undefined} aria-label='Main'>
      {ITEMS.map(({ path, label, shortLabel }) => {
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
    </nav>
  </>
);
