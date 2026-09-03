import { useEffect, useRef, useState } from 'react';

// Campus photos, cycled across the tile slots. Drop more files in /public/intro
// and add their paths here to vary the field further.
//
// Sized to 340x453 — 2x the largest tile (w:170, rendered at a 3:4 box) — and
// encoded as WebP. The PNG originals were 7.1MB combined for tiles no wider
// than 170 CSS px.
const IMAGES = [
  '/intro/yale.webp',
  '/intro/mit.webp',
  '/intro/harvard.webp',
  '/intro/princeton.webp',
  '/intro/yale.webp',
  '/intro/mit.webp',
  '/intro/harvard.webp',
  '/intro/princeton.webp',
];

type Depth = 'far' | 'mid' | 'near';
type Vis = 'mobile' | 'tablet' | 'desktop'; // minimum breakpoint at which the tile shows

type Tile = {
  x: number; // % left  (50 = centre)
  y: number; // % top   (50 = centre)
  w: number; // px width
  img: number;
  depth: Depth;
  o: number; // base opacity
  rot: number; // max rotation (deg) reached at full inward
  vis: Vis;
};

// Distance / styling per depth tier. Near images are larger, sharper, move more,
// and sit on top; far images are small, faint, blurred, and barely move.
const DEPTH: Record<Depth, { in: number; out: number; blur: number; z: number }> = {
  far: { in: 42, out: 58, blur: 1.4, z: 1 },
  mid: { in: 84, out: 104, blur: 0, z: 3 },
  near: { in: 140, out: 168, blur: 0, z: 5 },
};

// Scattered across every quadrant, never a grid. Centre band (x 34–66 / y 42–58)
// is kept clear so the headline stays readable.
const TILES: Tile[] = [
  { x: 8, y: 16, w: 152, img: 0, depth: 'near', o: 1, rot: -4, vis: 'mobile' },
  { x: 20, y: 31, w: 72, img: 5, depth: 'mid', o: 0.95, rot: 3, vis: 'tablet' },
  { x: 5, y: 41, w: 48, img: 2, depth: 'far', o: 0.5, rot: -2, vis: 'desktop' },
  { x: 40, y: 10, w: 96, img: 6, depth: 'mid', o: 1, rot: 2, vis: 'mobile' },
  { x: 54, y: 18, w: 58, img: 4, depth: 'far', o: 0.55, rot: -3, vis: 'desktop' },
  { x: 47, y: 30, w: 40, img: 3, depth: 'far', o: 0.45, rot: 2, vis: 'desktop' },
  { x: 66, y: 12, w: 104, img: 1, depth: 'mid', o: 1, rot: -3, vis: 'tablet' },
  { x: 83, y: 24, w: 170, img: 7, depth: 'near', o: 1, rot: 4, vis: 'mobile' },
  { x: 92, y: 14, w: 60, img: 2, depth: 'far', o: 0.6, rot: -2, vis: 'desktop' },
  { x: 75, y: 39, w: 70, img: 5, depth: 'mid', o: 0.9, rot: 3, vis: 'tablet' },
  { x: 10, y: 55, w: 56, img: 3, depth: 'far', o: 0.6, rot: 2, vis: 'desktop' },
  { x: 16, y: 67, w: 90, img: 4, depth: 'mid', o: 0.95, rot: -3, vis: 'tablet' },
  { x: 88, y: 56, w: 150, img: 3, depth: 'near', o: 1, rot: -4, vis: 'mobile' },
  { x: 78, y: 50, w: 52, img: 1, depth: 'far', o: 0.45, rot: 3, vis: 'desktop' },
  { x: 12, y: 82, w: 110, img: 0, depth: 'mid', o: 1, rot: 3, vis: 'mobile' },
  { x: 28, y: 73, w: 60, img: 5, depth: 'far', o: 0.55, rot: -2, vis: 'desktop' },
  { x: 44, y: 87, w: 84, img: 2, depth: 'mid', o: 1, rot: 2, vis: 'tablet' },
  { x: 57, y: 80, w: 46, img: 6, depth: 'far', o: 0.5, rot: -3, vis: 'desktop' },
  { x: 70, y: 84, w: 96, img: 7, depth: 'mid', o: 1, rot: -3, vis: 'tablet' },
  { x: 85, y: 76, w: 130, img: 1, depth: 'near', o: 1, rot: 4, vis: 'mobile' },
];

// Remembered for the session so the choice survives navigation without
// following the student across visits.
const PAUSE_KEY = 'ap.intro.paused';

const readPaused = () => {
  try {
    return sessionStorage.getItem(PAUSE_KEY) === '1';
  } catch {
    return false;
  }
};

export function IntroFloat() {
  // WCAG 2.2.2: ~20 photo tiles drift forever behind the headline. Honouring
  // prefers-reduced-motion is not enough on its own — an on-page control is
  // required, and this audience is often on school or library machines where
  // the OS flag cannot be set.
  const [paused, setPaused] = useState(readPaused);
  // Nothing to animate while the hero is scrolled past; --inward is a
  // registered custom property, so each frame invalidates style for every tile
  // on the main thread and cannot be composited.
  const [inView, setInView] = useState(true);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;
    const io = new IntersectionObserver((entries) => setInView(entries[0]?.isIntersecting ?? true));
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const togglePaused = () => {
    const next = !paused;
    setPaused(next);
    try {
      sessionStorage.setItem(PAUSE_KEY, next ? '1' : '0');
    } catch {
      // Storage blocked: the toggle still works for this page view.
    }
  };

  // The inward → outward drift is driven entirely by the CSS animation on
  // `.intro__stage` (animating the registered `--inward` custom property), so
  // it plays automatically without any scroll wiring.
  const stopped = paused || !inView;

  return (
    <section className="intro" aria-label="Intro" ref={sectionRef}>
      <div className={'intro__stage' + (stopped ? ' is-paused' : '')}>
        <div className="intro__field" aria-hidden="true">
          {TILES.map((t, i) => {
            const d = DEPTH[t.depth];
            // Unit vector from centre to the tile → outward/inward/load directions.
            const vx = t.x - 50;
            const vy = t.y - 50;
            const len = Math.hypot(vx, vy) || 1;
            const ux = vx / len;
            const uy = vy / len;
            const inDist = d.in + (i % 4) * 9;
            const outDist = d.out + (i % 3) * 14;
            const loadDist = outDist * 0.7 + 54;

            return (
              <div
                key={i}
                className={`itile itile--${t.depth} itile--${t.vis}`}
                style={
                  {
                    left: `${t.x}%`,
                    top: `${t.y}%`,
                    // Set --w, not width: the 82%/60% shrink rules in
                    // global.css read this property, and an inline width
                    // overrode them, so tiles rendered at full desktop size on
                    // phones and crowded the headline.
                    '--w': `${t.w}px`,
                    zIndex: d.z,
                    '--ox': `${(ux * outDist).toFixed(1)}px`,
                    '--oy': `${(uy * outDist).toFixed(1)}px`,
                    '--ix': `${(-ux * inDist).toFixed(1)}px`,
                    '--iy': `${(-uy * inDist).toFixed(1)}px`,
                    '--rot': `${t.rot}deg`,
                    '--o': t.o,
                    '--blur': `${d.blur}px`,
                  } as React.CSSProperties
                }
              >
                <div
                  className="itile__inner"
                  style={
                    {
                      '--fx': `${4 + (i % 5) * 2}px`,
                      '--fy': `${6 + (i % 4) * 2.5}px`,
                      '--fdur': `${5 + (i % 8)}s`,
                      '--fdelay': `${(-i * 0.6).toFixed(2)}s`,
                    } as React.CSSProperties
                  }
                >
                  <img
                    className="itile__media"
                    src={IMAGES[t.img]}
                    alt=""
                    width={t.w}
                    height={Math.round((t.w * 4) / 3)}
                    loading={t.depth === 'far' ? 'lazy' : undefined}
                    style={
                      {
                        '--lx': `${(ux * loadDist).toFixed(1)}px`,
                        '--ly': `${(uy * loadDist).toFixed(1)}px`,
                        '--ldelay': `${(i * 0.06).toFixed(2)}s`,
                      } as React.CSSProperties
                    }
                  />
                </div>
              </div>
            );
          })}
        </div>

        <h1 className="intro__title">
          <span>Impossible becomes</span>
          <span>Possible</span>
        </h1>

        <button type="button" className="intro__pause" onClick={togglePaused} aria-pressed={paused}>
          {paused ? 'Play motion' : 'Pause motion'}
        </button>
      </div>
    </section>
  );
}
