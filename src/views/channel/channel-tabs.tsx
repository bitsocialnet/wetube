import { useRef, useState, type FormEvent } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Search } from 'lucide-react';
import { channelSearchPath, channelSectionPath, type ChannelSection } from '../../lib/channels';
import styles from './channel.module.css';

const TABS = ['home', 'videos', 'playlists', 'posts'] as const;

interface ChannelTabsProps {
  channelAddress: string;
  section: ChannelSection;
  query: string;
}

/** The tab bar, and YouTube's search button that opens a field for searching this channel. */
export const ChannelTabs = ({ channelAddress, section, query }: ChannelTabsProps) => {
  const { t } = useTranslation();
  const labels: Record<(typeof TABS)[number], string> = { home: t('home'), videos: t('videos'), playlists: t('playlists'), posts: t('posts') };
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const location = useLocation();
  // The page the viewer opened the field on: it closes once they navigate, except to the search results,
  // where it stays open with their query.
  // Locations the browser creates itself (a typed URL) all share the key "default", hence the path too.
  const page = `${location.key} ${location.pathname}${location.search}`;
  const [openedOn, setOpenedOn] = useState<string>();
  const opened = openedOn === page;
  const open = opened || section === 'search';
  // What the viewer typed, for the query it was typed over: a new query in the URL (a search, Back) shows
  // that query instead, and the field keeps focus because it is never remounted.
  const [draft, setDraft] = useState<{ query: string; value: string }>();
  const value = draft?.query === query ? draft.value : query;

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!value.trim()) {
      inputRef.current?.focus();
      return;
    }
    // The URL holds the query from now on, so Back shows the query it returns to.
    setDraft(undefined);
    navigate(channelSearchPath(channelAddress, value.trim()));
  };

  return (
    <div className={styles.tabBar}>
      <nav className={styles.tabs} aria-label={t('channel_tabs')}>
        {TABS.map((tab) => (
          <Link key={tab} to={channelSectionPath(channelAddress, tab)} className={styles.tab} aria-current={section === tab ? 'page' : undefined}>
            {labels[tab]}
          </Link>
        ))}
      </nav>
      <form className={styles.search} role='search' data-open={open || undefined} onSubmit={submit}>
        {/* Opens the field; once open, it submits the search. */}
        <button
          ref={buttonRef}
          type={open ? 'submit' : 'button'}
          className={styles.searchButton}
          aria-label={t('search_channel')}
          aria-expanded={open}
          onClick={open ? undefined : () => setOpenedOn(page)}
        >
          <Search size={22} aria-hidden='true' />
        </button>
        {open && (
          <input
            ref={inputRef}
            className={styles.searchInput}
            name='query'
            type='search'
            value={value}
            onChange={(event) => setDraft({ query, value: event.target.value })}
            placeholder={t('search')}
            aria-label={t('search_channel')}
            autoComplete='off'
            autoFocus={opened}
            onKeyDown={(event) => {
              if (event.key === 'Escape' && section !== 'search') {
                buttonRef.current?.focus();
                setOpenedOn(undefined);
              }
            }}
            onBlur={(event) => {
              // An empty field closes when focus leaves the search, as on YouTube.
              if (!event.currentTarget.value && !event.currentTarget.form?.contains(event.relatedTarget)) setOpenedOn(undefined);
            }}
          />
        )}
      </form>
    </div>
  );
};
