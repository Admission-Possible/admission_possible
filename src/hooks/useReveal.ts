import { useEffect } from 'react';
import { useLocation } from 'react-router';

const SLASH_ANGLE = 12;

// Scroll-reveal for [data-reveal]/[data-slash], re-scanned on every route
// change. Ports legacy motion.js. Honours prefers-reduced-motion. Runs from
// the layout so it covers the active page.
export function useReveal() {
  const { pathname } = useLocation();

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const root = document.documentElement;
    root.classList.add('is-animated');
    root.style.setProperty('--slash-angle', `${SLASH_ANGLE}deg`);

    const all = Array.from(document.querySelectorAll<HTMLElement>('[data-slash],[data-reveal]'));
    const show = (n: HTMLElement) => {
      n.classList.add('shown');
      n.dataset.shown = '1';
    };

    const check = () => {
      const vh = window.innerHeight || document.documentElement.clientHeight;
      const margin = vh * 0.12;
      all.forEach((n) => {
        if (n.dataset.shown) return;
        const r = n.getBoundingClientRect();
        if (r.top < vh - margin && r.bottom > 0) show(n);
      });
    };

    // Track every scheduled rAF so the cleanup can cancel them all — otherwise
    // an in-flight scroll check can run against stale nodes.
    const rafIds = new Set<number>();

    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      const id = requestAnimationFrame(() => {
        rafIds.delete(id);
        ticking = false;
        check();
      });
      rafIds.add(id);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });

    let io: IntersectionObserver | null = null;
    try {
      io = new IntersectionObserver(
        (entries) => {
          entries.forEach((e) => {
            if (!e.isIntersecting) return;
            const el = e.target as HTMLElement;
            if (el.dataset.shown) return;
            show(el);
            io?.unobserve(el);
          });
        },
        { threshold: 0.12, rootMargin: '0px 0px -8% 0px' },
      );
      all.forEach((n) => io?.observe(n));
    } catch {
      /* no IntersectionObserver */
    }

    check();
    const fallback = window.setTimeout(() => all.forEach(show), 1600);

    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      io?.disconnect();
      clearTimeout(fallback);
      rafIds.forEach((id) => cancelAnimationFrame(id));
    };
  }, [pathname]);
}
