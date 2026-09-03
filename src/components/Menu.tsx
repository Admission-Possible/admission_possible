import { Fragment, useEffect, useRef } from 'react';
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

  // Trap Tab / Shift+Tab within the dialog.
  //
  // This listens on the document, not on the dialog. The overlay is full-screen
  // with large non-focusable areas: clicking one moved activeElement to <body>,
  // and a handler bound to the dialog then never fired — so Tab walked
  // invisibly into the obscured page behind. Chrome.tsx additionally marks that
  // content inert while the menu is open; this is the belt to that's braces.
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: globalThis.KeyboardEvent) => {
      if (e.key !== 'Tab') return;
      const dialog = dialogRef.current;
      if (!dialog) return;
      const focusable = [
        ...dialog.querySelectorAll<HTMLElement>('a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'),
      ];
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement;
      const outside = !dialog.contains(active);
      if (e.shiftKey) {
        if (outside || active === first) {
          e.preventDefault();
          last.focus();
        }
      } else if (outside || active === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [open]);

  if (!open) return null;
  return (
    <div className="ov-menu" role="dialog" aria-modal="true" aria-label="Site menu" ref={dialogRef}>
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
