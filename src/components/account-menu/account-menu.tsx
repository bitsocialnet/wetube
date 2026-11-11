import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAccount } from '@bitsocial/bitsocial-react-hooks';
import { ArrowLeft, Check, ChevronRight, Clapperboard, Code, MessageSquareWarning, Moon, Settings, UserRound } from 'lucide-react';
import { useTheme } from '../../hooks/use-theme';
import { channelHue, shortAddress } from '../../lib/channels';
import { setThemePreference, type ThemePreference } from '../../lib/theme';
import styles from './account-menu.module.css';

const REPOSITORY_URL = 'https://github.com/bitsocialnet/wetube';
const THEME_LABELS: Record<ThemePreference, string> = { system: 'Device theme', dark: 'Dark theme', light: 'Light theme' };
const version = import.meta.env.VITE_APP_VERSION;
const commitRef = import.meta.env.VITE_COMMIT_REF;

/** The account button in the header and its YouTube-style menu, limited to what WeTube has or plans. */
export const AccountMenu = () => {
  const account = useAccount();
  const { preference } = useTheme();
  const [open, setOpen] = useState(false);
  const [view, setView] = useState<'main' | 'appearance'>('main');
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const address: string = account?.author?.address ?? '';
  const name: string = account?.author?.displayName || 'Anonymous';

  const close = () => {
    setOpen(false);
    setView('main');
  };

  // Close on a click outside the menu or on Escape, which also returns focus to the button.
  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
        setView('main');
      }
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      setOpen(false);
      setView('main');
      buttonRef.current?.focus();
    };
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  const avatar = (size: number) => (
    <span
      className={styles.avatar}
      style={{ width: size, height: size, fontSize: size * 0.45, background: `hsl(${channelHue(address || name)} 50% 42%)` }}
      aria-hidden='true'
    >
      {name.charAt(0).toUpperCase()}
    </span>
  );

  return (
    <div className={styles.root} ref={rootRef}>
      <button
        ref={buttonRef}
        type='button'
        className={styles.trigger}
        aria-label='Account menu'
        aria-haspopup='menu'
        aria-expanded={open}
        onClick={() => (open ? close() : setOpen(true))}
      >
        {avatar(32)}
      </button>
      {open && view === 'main' && (
        <div className={styles.menu} role='menu' aria-label='Account'>
          <div className={styles.identity}>
            {avatar(40)}
            <div className={styles.identityText}>
              <span className={styles.name}>{name}</span>
              <span className={styles.address} title={address}>
                {shortAddress(address) || 'Creating your account…'}
              </span>
            </div>
          </div>
          <hr className={styles.divider} />
          {/* Profiles are author communities (BSIP-14); channels are hosted through Forge RPC, on by default. */}
          <div className={styles.item} role='menuitem' aria-disabled='true'>
            <UserRound size={20} aria-hidden='true' />
            <span className={styles.label}>
              Your profile<span className={styles.hint}>Coming soon</span>
            </span>
          </div>
          <div className={styles.item} role='menuitem' aria-disabled='true'>
            <Clapperboard size={20} aria-hidden='true' />
            <span className={styles.label}>
              Create a channel<span className={styles.hint}>Coming soon, hosted free through Forge RPC</span>
            </span>
          </div>
          <hr className={styles.divider} />
          <button type='button' className={styles.item} role='menuitem' aria-haspopup='menu' onClick={() => setView('appearance')}>
            <Moon size={20} aria-hidden='true' />
            <span className={styles.label}>Appearance: {THEME_LABELS[preference]}</span>
            <ChevronRight size={18} aria-hidden='true' />
          </button>
          <Link to='/settings' className={styles.item} role='menuitem' onClick={close}>
            <Settings size={20} aria-hidden='true' />
            <span className={styles.label}>Settings</span>
          </Link>
          <hr className={styles.divider} />
          <a className={styles.item} role='menuitem' href={`${REPOSITORY_URL}/issues/new`} target='_blank' rel='noopener noreferrer' onClick={close}>
            <MessageSquareWarning size={20} aria-hidden='true' />
            <span className={styles.label}>Send feedback</span>
          </a>
          <a className={styles.item} role='menuitem' href={REPOSITORY_URL} target='_blank' rel='noopener noreferrer' onClick={close}>
            <Code size={20} aria-hidden='true' />
            <span className={styles.label}>Source code</span>
          </a>
          <p className={styles.version}>
            WeTube v{version}
            {commitRef && (
              <>
                {' · '}
                <a href={`${REPOSITORY_URL}/commit/${commitRef}`} target='_blank' rel='noopener noreferrer'>
                  {commitRef.slice(0, 7)}
                </a>
              </>
            )}
          </p>
        </div>
      )}
      {open && view === 'appearance' && (
        <div className={styles.menu} role='menu' aria-label='Appearance'>
          <button type='button' className={styles.back} onClick={() => setView('main')}>
            <ArrowLeft size={20} aria-hidden='true' />
            Appearance
          </button>
          <hr className={styles.divider} />
          {(Object.keys(THEME_LABELS) as ThemePreference[]).map((option) => (
            <button
              key={option}
              type='button'
              className={styles.item}
              role='menuitemradio'
              aria-checked={preference === option}
              onClick={() => setThemePreference(option)}
            >
              <span className={styles.check}>{preference === option && <Check size={18} aria-hidden='true' />}</span>
              <span className={styles.label}>{option === 'system' ? 'Use device theme' : THEME_LABELS[option]}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
