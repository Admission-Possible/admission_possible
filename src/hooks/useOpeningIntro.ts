import { useEffect, useState } from 'react';

export const OPENING_DURATION_MS = 5200;

/** Play only on an initial homepage visit, never while navigating within the app. */
export function useOpeningIntro(pathname: string) {
  const [enabled, setEnabled] = useState(pathname === '/');
  const [initialPath, setInitialPath] = useState(pathname);
  if (initialPath !== pathname) {
    setInitialPath(pathname);
    setEnabled(false);
  }
  const opening = enabled && pathname === '/';
  const finish = () => setEnabled(false);

  useEffect(() => {
    if (!opening) return;
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (motion.matches || window.location.hash) {
      const frame = window.requestAnimationFrame(() => setEnabled(false));
      return () => window.cancelAnimationFrame(frame);
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const complete = () => setEnabled(false);
    const onKey = (event: KeyboardEvent) => {
      // Keyboard navigation immediately reveals the controls it is moving to.
      if (event.key === 'Escape' || event.key === 'Tab') complete();
    };
    const onMotionChange = () => {
      if (motion.matches) complete();
    };
    const onPageHide = () => complete();
    const timer = window.setTimeout(complete, OPENING_DURATION_MS + 100);
    document.addEventListener('keydown', onKey);
    window.addEventListener('pagehide', onPageHide);
    motion.addEventListener('change', onMotionChange);
    return () => {
      window.clearTimeout(timer);
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', onKey);
      window.removeEventListener('pagehide', onPageHide);
      motion.removeEventListener('change', onMotionChange);
    };
  }, [opening]);

  return { opening, finish };
}
