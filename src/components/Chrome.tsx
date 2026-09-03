import { useEffect, useRef, useState } from 'react';
import { Outlet, useLocation } from 'react-router';
import { NAV } from '../data/nav';
import { hasIntake } from '../data/storage';
import { titleForPath } from '../data/titles';
import { useHydrated } from '../hooks/useHydrated';
import { useReveal } from '../hooks/useReveal';
import { Header } from './Header';
import { Menu } from './Menu';
import { Footer } from './Footer';

// Shared layout: header + full-screen menu + page outlet + footer.
// Owns the menu open state, scroll-reveal motion, and route-change resets.
export function Chrome() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { pathname } = useLocation();
  const current = NAV.find((n) => n.path === pathname)?.id ?? '';
  const mainRef = useRef<HTMLDivElement>(null);
  // A route change should move focus; the first paint should not steal it.
  const firstRender = useRef(true);

  // Derived per render, so finishing the intake reveals the "My plan" link on
  // that same navigation. False until hydrated, so the first client paint
  // matches the prerendered HTML (#45).
  const hydrated = useHydrated();
  const hasPlan = hydrated && hasIntake();

  // On navigation: close the menu (state adjusted during render, per React docs).
  const [prevPathname, setPrevPathname] = useState(pathname);
  if (prevPathname !== pathname) {
    setPrevPathname(pathname);
    setMenuOpen(false);
  }

  useReveal();

  // Lock body scroll while the full-screen menu is open, and always restore on
  // cleanup. Without it, a render that throws while the menu is open unmounts
  // Chrome with overflow:hidden stuck, so the ErrorBoundary fallback renders on
  // an unscrollable body and its "Start over" button can clip off-screen — the
  // one code path that exists for when things are already wrong.
  useEffect(() => {
    if (!menuOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
    };
  }, [menuOpen]);

  // Escape closes the menu.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMenuOpen(false);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  // Every route shared one static title, so tabs, history, bookmarks and search
  // results were indistinguishable (WCAG 2.4.2).
  useEffect(() => {
    document.title = titleForPath(pathname);
  }, [pathname]);

  // On navigation: jump to the top (legacy did full page loads) and move focus
  // into the new page. Without the focus move a screen-reader user who
  // activates a nav link gets no signal that anything changed and has to
  // re-explore from scratch.
  useEffect(() => {
    window.scrollTo({ top: 0 });
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    mainRef.current?.focus();
  }, [pathname]);

  // While the overlay menu is open the page behind it is inert: not focusable,
  // not clickable, hidden from assistive tech. Previously a keyboard user who
  // clicked a dead area of the overlay could Tab invisibly into the obscured
  // page and activate its controls.
  const behind = menuOpen || undefined;

  return (
    <>
      <a className="skip-link" href="#main-content" inert={behind}>
        Skip to content
      </a>
      <div inert={behind}>
        <Header onMenu={() => setMenuOpen(true)} />
        {/* tabIndex -1 so it can receive focus on route change without
            entering the tab order. */}
        <div id="main-content" ref={mainRef} tabIndex={-1}>
          <Outlet />
        </div>
        <Footer hasPlan={hasPlan} />
      </div>
      <Menu open={menuOpen} current={current} hasPlan={hasPlan} onClose={() => setMenuOpen(false)} />
    </>
  );
}
