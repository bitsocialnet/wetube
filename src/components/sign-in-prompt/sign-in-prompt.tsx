import { useCallback, useId, useRef, useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { useDismiss } from '../../hooks/use-dismiss';
import styles from './sign-in-prompt.module.css';

interface SignInPromptProps {
  /** The prompt's question, such as "Like this video?". */
  title: string;
  text: string;
  /** The trigger's content; the trigger itself is a button that opens the prompt. */
  children: ReactNode;
  className?: string;
  label?: string;
  placement?: 'below' | 'above';
}

/**
 * A button for an action that needs an account (like, comment, subscribe) and, until sign-in exists
 * (BSIP-14 profiles through Forge RPC), opens YouTube's "sign in to…" prompt instead of acting.
 */
export const SignInPrompt = ({ title, text, children, className, label, placement = 'below' }: SignInPromptProps) => {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLSpanElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const dialogId = useId();
  const dismiss = useCallback((reason: 'outside' | 'escape') => {
    setOpen(false);
    if (reason === 'escape') buttonRef.current?.focus();
  }, []);
  useDismiss(open, rootRef, dismiss);

  return (
    <span className={styles.root} ref={rootRef}>
      <button
        ref={buttonRef}
        type='button'
        className={className}
        aria-label={label}
        aria-haspopup='dialog'
        aria-expanded={open}
        aria-controls={open ? dialogId : undefined}
        onClick={() => setOpen(!open)}
      >
        {children}
      </button>
      {open && (
        <span id={dialogId} className={styles.prompt} data-placement={placement} role='dialog' aria-label={title}>
          <span className={styles.title}>{title}</span>
          <span className={styles.text}>{text}</span>
          <Link to='/signin' className={styles.signIn} onClick={() => setOpen(false)}>
            Sign in
          </Link>
        </span>
      )}
    </span>
  );
};
