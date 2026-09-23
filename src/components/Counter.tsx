import { useEffect, useRef, useState } from 'react';

/**
 * A figure that counts up from zero when it scrolls into view, the way the
 * reference's side facts do. The final value is what renders on the server
 * and for reduced motion, so the number is never wrong while it animates.
 */
export function Counter({
  value,
  prefix = '',
  duration = 1200,
}: {
  value: number;
  prefix?: string;
  duration?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const [shown, setShown] = useState(value);

  useEffect(() => {
    const el = ref.current;
    if (!el || value === 0 || typeof IntersectionObserver === 'undefined') return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let frame = 0;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();
        const start = performance.now();
        const tick = (now: number) => {
          const t = Math.min(1, (now - start) / duration);
          // easeOutCubic: fast start, gentle landing on the real value.
          setShown(Math.round(value * (1 - Math.pow(1 - t, 3))));
          if (t < 1) frame = requestAnimationFrame(tick);
        };
        setShown(0);
        frame = requestAnimationFrame(tick);
      },
      { threshold: 0.6 },
    );
    observer.observe(el);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [value, duration]);

  return (
    <span className="counter" ref={ref}>
      <span aria-hidden="true">
        {prefix}
        {shown}
      </span>
      <span className="visually-hidden">
        {prefix}
        {value}
      </span>
    </span>
  );
}
