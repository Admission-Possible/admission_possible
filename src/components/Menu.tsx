import { useEffect, useRef } from 'react';
import { Link } from 'react-router';
import { NAV } from '../data/nav';
import { Plus } from './Plus';

interface MenuProps {
  open: boolean;
  current: string;
  onClose: () => void;
}

// Full-height navigation drawer. Same destinations as the header and footer.
export function Menu({ open, current, onClose }: MenuProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  // On open, capture the opener, focus the close button, and restore focus on close/unmount.
  useEffect(() => {
    if (!open) return;
    const opener = document.activeElement as HTMLElement | null;
    closeRef.current?.focus();
    return () => opener?.focus();
  }, [open]);

  // Trap Tab / Shift+Tab within the dialog. Listens on the document: clicking
  // a dead area of the overlay moves focus to <body>, where a handler bound to
  // the dialog would never fire. Chrome.tsx also marks the page behind inert.
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
      <div className="ov-menu__backdrop" onClick={onClose} aria-hidden="true" />
      <div className="ov-menu__top">Explore the guide</div>
      <nav className="ov-menu__links">
        {NAV.map((n, i) => (
          <Link
            key={n.id}
            className={'ov-menu__link' + (n.id === current ? ' is-current' : '')}
            to={n.path}
            onClick={onClose}
            aria-current={n.id === current ? 'page' : undefined}
          >
            <span>{n.label}</span>
            <sup aria-hidden="true">{String(i + 1).padStart(2, '0')}</sup>
          </Link>
        ))}
        <div className="ov-menu__caption">By first-gen students. For the next ones.</div>
      </nav>
      <button className="ov-menu__close" aria-label="Close menu" onClick={onClose} ref={closeRef}>
        <Plus className="plus--close" />
      </button>
    </div>
  );
}
