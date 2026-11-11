import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import logoOnDark from '../../../design/logo/wetube-logo-on-dark.svg';
import logoOnLight from '../../../design/logo/wetube-logo-on-light.svg';
import { channelPath } from '../../lib/channels';
import styles from './app-header.module.css';

export const AppHeader = () => {
  const navigate = useNavigate();
  const [address, setAddress] = useState('');

  const openChannel = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = address.trim();
    if (!trimmed) return;
    navigate(channelPath(trimmed));
    setAddress('');
  };

  return (
    <header className={styles.header}>
      <Link to='/' className={styles.brand} aria-label='WeTube home'>
        {/* The SVGs carry a margin around the artwork; the wrapper crops it, as in the logo showcase. */}
        <span className={styles.logoCrop}>
          <picture>
            <source srcSet={logoOnLight} media='(prefers-color-scheme: light)' />
            <img src={logoOnDark} alt='' />
          </picture>
        </span>
        <span className={styles.previewTag}>Preview</span>
      </Link>
      <form className={styles.search} role='search' onSubmit={openChannel}>
        <label htmlFor='channel-address' className='visually-hidden'>
          Open a channel by address
        </label>
        <input
          id='channel-address'
          className={styles.input}
          value={address}
          onChange={(event) => setAddress(event.target.value)}
          placeholder='Open a channel: name.bso or 12D3KooW…'
          autoComplete='off'
          spellCheck={false}
        />
        <button type='submit' className={styles.submit}>
          Open
        </button>
      </form>
    </header>
  );
};
