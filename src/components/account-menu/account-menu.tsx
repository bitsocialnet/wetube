import { Link } from 'react-router-dom';
import { useAccount } from '@bitsocial/bitsocial-react-hooks';
import {
  Menu,
  MenuContent,
  MenuItem,
  MenuItemIndicator,
  MenuRadioGroup,
  MenuRadioItem,
  MenuSeparator,
  MenuSub,
  MenuSubContent,
  MenuSubTrigger,
  MenuTrigger,
} from '@ui-sdk/react/menu';
import { Check, ChevronRight, Clapperboard, Code, MessageSquareWarning, Moon, Settings, UserRound } from 'lucide-react';
import { REPOSITORY_URL } from '../../data/navigation';
import { useTheme } from '../../hooks/use-theme';
import { channelHue, shortAddress } from '../../lib/channels';
import { setThemePreference, type ThemePreference } from '../../lib/theme';
import styles from './account-menu.module.css';

const THEME_LABELS: Record<ThemePreference, string> = { system: 'Device theme', dark: 'Dark theme', light: 'Light theme' };
const version = import.meta.env.VITE_APP_VERSION;
const commitRef = import.meta.env.VITE_COMMIT_REF;

/** The account button in the header and its YouTube-style menu, limited to what WeTube has or plans. */
export const AccountMenu = () => {
  const account = useAccount();
  const { preference } = useTheme();

  const address: string = account?.author?.address ?? '';
  const name: string = account?.author?.displayName || 'Anonymous';

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
    <Menu presentation='auto'>
      <MenuTrigger className={styles.trigger} aria-label='Account menu'>
        {avatar(32)}
      </MenuTrigger>
      <MenuContent className={styles.menu} aria-label='Account' align='end' sideOffset={6}>
        <div className={styles.identity}>
          {avatar(40)}
          <div className={styles.identityText}>
            <span className={styles.name}>{name}</span>
            <span className={styles.address} title={address}>
              {shortAddress(address) || 'Creating your account…'}
            </span>
          </div>
        </div>
        <MenuSeparator className={styles.divider} />
        {/* Profiles are author communities (BSIP-14); channels are hosted through Forge RPC, on by default. */}
        <MenuItem className={styles.item} label='Your profile' disabled>
          <UserRound size={20} aria-hidden='true' />
          <span className={styles.label}>
            Your profile<span className={styles.hint}>Coming soon</span>
          </span>
        </MenuItem>
        <MenuItem className={styles.item} label='Create a channel' disabled>
          <Clapperboard size={20} aria-hidden='true' />
          <span className={styles.label}>
            Create a channel<span className={styles.hint}>Coming soon, hosted free through Forge RPC</span>
          </span>
        </MenuItem>
        <MenuSeparator className={styles.divider} />
        <MenuSub>
          <MenuSubTrigger className={styles.item}>
            <Moon size={20} aria-hidden='true' />
            <span className={styles.label}>Appearance: {THEME_LABELS[preference]}</span>
            <ChevronRight size={18} aria-hidden='true' />
          </MenuSubTrigger>
          <MenuSubContent className={styles.menu} aria-label='Appearance'>
            <MenuRadioGroup name='theme' value={preference} onValueChange={setThemePreference}>
              {(Object.keys(THEME_LABELS) as ThemePreference[]).map((option) => (
                <MenuRadioItem key={option} className={styles.item} value={option}>
                  <MenuItemIndicator className={styles.check} keepMounted>
                    <Check size={18} aria-hidden='true' />
                  </MenuItemIndicator>
                  <span className={styles.label}>{option === 'system' ? 'Use device theme' : THEME_LABELS[option]}</span>
                </MenuRadioItem>
              ))}
            </MenuRadioGroup>
          </MenuSubContent>
        </MenuSub>
        <MenuItem className={styles.item} render={<Link to='/settings' />}>
          <Settings size={20} aria-hidden='true' />
          <span className={styles.label}>Settings</span>
        </MenuItem>
        <MenuSeparator className={styles.divider} />
        <MenuItem className={styles.item} render={<a href={`${REPOSITORY_URL}/issues/new`} target='_blank' rel='noopener noreferrer' />}>
          <MessageSquareWarning size={20} aria-hidden='true' />
          <span className={styles.label}>Send feedback</span>
        </MenuItem>
        <MenuItem className={styles.item} render={<a href={REPOSITORY_URL} target='_blank' rel='noopener noreferrer' />}>
          <Code size={20} aria-hidden='true' />
          <span className={styles.label}>Source code</span>
        </MenuItem>
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
      </MenuContent>
    </Menu>
  );
};
