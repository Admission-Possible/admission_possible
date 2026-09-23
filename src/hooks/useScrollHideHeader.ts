import { useEffect, useRef } from 'react';

// Hide the header on scroll-down, show it on scroll-up (legacy chrome.js behaviour).
export function useScrollHideHeader<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  useEffect(() => {
    // Seed from the real position, not 0: after a browser-restored scroll the
    // first event would otherwise look like a large downward jump and hide the
    // header spuriously. (Restoration can land after mount, so this is a
    // best-effort read — the next scroll event corrects it either way.)
    let lastY = window.scrollY;
    const onScroll = () => {
      const h = ref.current;
      if (!h) return;
      const y = window.scrollY;
      h.style.transform = y > lastY && y > 140 ? 'translateY(-100%)' : 'translateY(0)';
      lastY = y;
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  return ref;
}
