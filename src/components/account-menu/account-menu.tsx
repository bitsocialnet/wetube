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
import { useTranslation } from 'react-i18next';
import { Check, ChevronRight, Clapperboard, Code, Languages, MessageSquareWarning, Moon, Settings, UserRound } from 'lucide-react';
import { REPOSITORY_URL } from '../../data/navigation';
import { useTheme } from '../../hooks/use-theme';
import { channelHue, shortAddress } from '../../lib/channels';
import { getLanguageName, saveLanguage, SUPPORTED_LANGUAGES } from '../../lib/languages';
import { setThemePreference, type ThemePreference } from '../../lib/theme';
import styles from './account-menu.module.css';

const THEME_OPTIONS: ThemePreference[] = ['system', 'dark', 'light'];
const version = import.meta.env.VITE_APP_VERSION;
const commitRef = import.meta.env.VITE_COMMIT_REF;

/** The account button in the header and its YouTube-style menu, limited to what WeTube has or plans. */
export const AccountMenu = () => {
  const account = useAccount();
  const { preference } = useTheme();
  const { t, i18n } = useTranslation();
  const themeLabels: Record<ThemePreference, string> = { system: t('device_theme'), dark: t('dark_theme'), light: t('light_theme') };

  const address: string = account?.author?.address ?? '';
  const name: string = account?.author?.displayName || t('anonymous');

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
      <MenuTrigger className={styles.trigger} aria-label={t('account_menu')}>
        {avatar(32)}
      </MenuTrigger>
      <MenuContent className={styles.menu} aria-label={t('account')} align='end' sideOffset={6}>
        <div className={styles.identity}>
          {avatar(40)}
          <div className={styles.identityText}>
            <span className={styles.name}>{name}</span>
            <span className={styles.address} title={address}>
              {shortAddress(address) || t('creating_account')}
            </span>
          </div>
        </div>
        <MenuSeparator className={styles.divider} />
        {/* Profiles are author communities (BSIP-14); channels are hosted through Forge RPC, on by default. */}
        <MenuItem className={styles.item} label={t('your_profile')} disabled>
          <UserRound size={20} aria-hidden='true' />
          <span className={styles.label}>
            {t('your_profile')}
            <span className={styles.hint}>{t('coming_soon')}</span>
          </span>
        </MenuItem>
        <MenuItem className={styles.item} label={t('create_channel')} disabled>
          <Clapperboard size={20} aria-hidden='true' />
          <span className={styles.label}>
            {t('create_channel')}
            <span className={styles.hint}>{t('create_channel_hint')}</span>
          </span>
        </MenuItem>
        <MenuSeparator className={styles.divider} />
        <MenuSub>
          <MenuSubTrigger className={styles.item}>
            <Moon size={20} aria-hidden='true' />
            <span className={styles.label}>{t('appearance_value', { theme: themeLabels[preference] })}</span>
            <ChevronRight size={18} aria-hidden='true' />
          </MenuSubTrigger>
          <MenuSubContent className={styles.menu} aria-label={t('appearance')}>
            <MenuRadioGroup name='theme' value={preference} onValueChange={setThemePreference}>
              {THEME_OPTIONS.map((option) => (
                <MenuRadioItem key={option} className={styles.item} value={option}>
                  <MenuItemIndicator className={styles.check} keepMounted>
                    <Check size={18} aria-hidden='true' />
                  </MenuItemIndicator>
                  <span className={styles.label}>{option === 'system' ? t('use_device_theme') : themeLabels[option]}</span>
                </MenuRadioItem>
              ))}
            </MenuRadioGroup>
          </MenuSubContent>
        </MenuSub>
        <MenuSub>
          <MenuSubTrigger className={styles.item}>
            <Languages size={20} aria-hidden='true' />
            <span className={styles.label}>{t('language_value', { language: getLanguageName(i18n.language) })}</span>
            <ChevronRight size={18} aria-hidden='true' />
          </MenuSubTrigger>
          <MenuSubContent className={styles.menu} aria-label={t('language')}>
            <MenuRadioGroup
              name='language'
              value={i18n.language}
              onValueChange={(language: string) => {
                saveLanguage(language);
                void i18n.changeLanguage(language);
              }}
            >
              {SUPPORTED_LANGUAGES.map((language) => (
                <MenuRadioItem key={language} className={styles.item} value={language}>
                  <MenuItemIndicator className={styles.check} keepMounted>
                    <Check size={18} aria-hidden='true' />
                  </MenuItemIndicator>
                  <span className={styles.label} lang={language}>
                    {getLanguageName(language)}
                  </span>
                </MenuRadioItem>
              ))}
            </MenuRadioGroup>
          </MenuSubContent>
        </MenuSub>
        <MenuItem className={styles.item} render={<Link to='/settings' />}>
          <Settings size={20} aria-hidden='true' />
          <span className={styles.label}>{t('settings')}</span>
        </MenuItem>
        <MenuSeparator className={styles.divider} />
        <MenuItem className={styles.item} render={<a href={`${REPOSITORY_URL}/issues/new`} target='_blank' rel='noopener noreferrer' />}>
          <MessageSquareWarning size={20} aria-hidden='true' />
          <span className={styles.label}>{t('send_feedback')}</span>
        </MenuItem>
        <MenuItem className={styles.item} render={<a href={REPOSITORY_URL} target='_blank' rel='noopener noreferrer' />}>
          <Code size={20} aria-hidden='true' />
          <span className={styles.label}>{t('source_code')}</span>
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
