import { useState, type FormEvent } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Menu, Search } from 'lucide-react';
import logoOnDark from '../../../design/logo/wetube-logo-on-dark.svg';
import logoOnLight from '../../../design/logo/wetube-logo-on-light.svg';
import { useTheme } from '../../hooks/use-theme';
import { channelPath, looksLikeChannelAddress } from '../../lib/channels';
import { AccountMenu } from '../account-menu';
import { NotificationsMenu } from '../notifications-menu';
import styles from './app-header.module.css';

interface AppHeaderProps {
  onToggleSidebar: () => void;
}

export const AppHeader = ({ onToggleSidebar }: AppHeaderProps) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('q') ?? '');
  const { resolved } = useTheme();

  // A channel address opens the channel; anything else searches the videos on the home page.
  const search = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) return;
    if (looksLikeChannelAddress(trimmed)) {
      navigate(channelPath(trimmed));
      setQuery('');
    } else {
      navigate(`/?${new URLSearchParams({ q: trimmed })}`);
    }
  };

  return (
    <header className={styles.header}>
      <div className={styles.start}>
        <button type='button' className={styles.iconButton} onClick={onToggleSidebar} aria-label='Menu'>
          <Menu size={22} aria-hidden='true' />
        </button>
        <Link to='/' className={styles.brand} aria-label='WeTube home'>
          {/* The SVGs carry a margin around the artwork; the wrapper crops it, as in the logo showcase. */}
          <span className={styles.logoCrop}>
            <img src={resolved === 'light' ? logoOnLight : logoOnDark} alt='' />
          </span>
          <span className={styles.previewTag}>Preview</span>
        </Link>
      </div>
      <form className={styles.search} role='search' onSubmit={search}>
        <input
          className={styles.input}
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder='Search'
          aria-label='Search videos, or open a channel by its address'
          autoComplete='off'
          spellCheck={false}
          type='search'
        />
        <button type='submit' className={styles.submit} aria-label='Search'>
          <Search size={20} aria-hidden='true' />
        </button>
      </form>
      <div className={styles.end}>
        <NotificationsMenu />
        <AccountMenu />
      </div>
    </header>
  );
};
