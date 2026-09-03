import { Fragment, useEffect, useRef } from 'react';
import type { KeyboardEvent } from 'react';
import { Link } from 'react-router';
import { navLinks } from '../data/nav';
import { Wordmark } from './Wordmark';

interface MenuProps {
  open: boolean;
  current: string;
  /** Adds the "My plan" entry once the student has completed the intake. */
  hasPlan?: boolean;
  onClose: () => void;
}

// Full-screen overlay menu: huge mono-caps links separated by backslashes.
export function Menu({ open, current, hasPlan = false, onClose }: MenuProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  // On open, capture the opener, focus the close button, and restore focus on close/unmount.
  useEffect(() => {
    if (!open) return;
    const opener = document.activeElement as HTMLElement | null;
    closeRef.current?.focus();
    return () => opener?.focus();
  }, [open]);

  // Trap Tab / Shift+Tab within the dialog's focusable elements.
  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key !== 'Tab') return;
    const focusable = dialogRef.current?.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
    );
    if (!focusable || focusable.length === 0) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    const active = document.activeElement;
    if (e.shiftKey) {
      if (active === first || !dialogRef.current?.contains(active)) {
        e.preventDefault();
        last.focus();
      }
    } else if (active === last) {
      e.preventDefault();
      first.focus();
    }
  };

  if (!open) return null;
  return (
    <div
      className="ov-menu"
      role="dialog"
      aria-modal="true"
      aria-label="Site menu"
      ref={dialogRef}
      onKeyDown={onKeyDown}
    >
      <div className="ov-menu__top">
        <Wordmark white />
      </div>
      <nav className="ov-menu__links">
        {navLinks(hasPlan).map((n, i) => (
          <Fragment key={n.id}>
            {i > 0 && <span className="ov-menu__sep"> \ </span>}
            <Link className={'ov-menu__link' + (n.id === current ? ' is-current' : '')} to={n.path} onClick={onClose}>
              {n.label}
            </Link>
          </Fragment>
        ))}
      </nav>
      <button className="ov-menu__close" aria-label="Close menu" onClick={onClose} ref={closeRef}>
        <span />
        <span />
      </button>
      <div className="ov-menu__rule" />
    </div>
  );
}
