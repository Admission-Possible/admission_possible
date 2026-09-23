import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { DecorativeVideo } from './DecorativeVideo';
import '../styles/admission-art.css';

type ArtVariant = 'hero' | 'pathways' | 'writing' | 'support' | 'mission';

interface AdmissionArtProps {
  variant?: ArtVariant;
  className?: string;
  opening?: boolean;
}

const FLOWERS = {
  pink: { poster: '/art/flower-pink.webp', src: '/art/flower-pink.mp4' },
  blue: { poster: '/art/flower-blue.webp', src: '/art/flower-blue.mp4' },
  duet: { poster: '/art/flower-duet.webp' },
};
const PALETTE = ['#FDC5F5', '#F7AEF8', '#B388EB', '#8093F1', '#72DDF7'];
const WINDOWS: { label?: string; className: string; flower: { poster: string; src?: string } }[] = [
  { label: 'FIRST-GEN STUDENT', className: 'first', flower: FLOWERS.blue },
  { label: 'YOUR STORY', className: 'story', flower: FLOWERS.pink },
  { label: 'YOUR NEXT CHAPTER', className: 'chapter', flower: FLOWERS.duet },
  { label: 'POSSIBILITY', className: 'possibility', flower: FLOWERS.duet },
  { label: 'COLLEGE-BOUND', className: 'college', flower: FLOWERS.blue },
  { className: 'fragment-top', flower: FLOWERS.duet },
  { className: 'fragment-right', flower: { poster: FLOWERS.pink.poster } },
];

const MOTION_STORAGE_KEY = 'admission-art-motion-paused';
const motionListeners = new Set<() => void>();
let motionPaused = false;
let motionPreferenceLoaded = false;

function subscribeToMotion(listener: () => void) {
  // Subscriptions begin after hydration, keeping the first client render identical to SSR.
  if (!motionPreferenceLoaded) {
    motionPreferenceLoaded = true;
    try {
      motionPaused = window.sessionStorage.getItem(MOTION_STORAGE_KEY) === 'true';
    } catch {
      // The shared in-memory preference still works when browser storage is unavailable.
    }
  }
  motionListeners.add(listener);
  return () => {
    motionListeners.delete(listener);
  };
}

function getMotionPaused() {
  return motionPaused;
}
function getServerMotionPaused() {
  return false;
}

function toggleMotion() {
  motionPaused = !motionPaused;
  try {
    window.sessionStorage.setItem(MOTION_STORAGE_KEY, String(motionPaused));
  } catch {
    // Browsing with storage disabled should not prevent pausing the artwork.
  }
  motionListeners.forEach((listener) => listener());
}

function ChapterScene({ variant }: { variant: 'pathways' | 'support' }) {
  if (variant === 'pathways') {
    return (
      <g>
        <rect width="800" height="900" fill="#B388EB" />
        <g className="admission-art__chapter-turn">
          {Array.from({ length: 20 }, (_, index) => (
            <path
              key={index}
              d="M400 450L284-330 565-330Z"
              fill={index % 2 === 0 ? '#72DDF7' : '#FDC5F5'}
              transform={`rotate(${index * 18} 400 450)`}
            />
          ))}
        </g>
        <circle cx="400" cy="450" r="147" fill="#8093F1" />
        <circle cx="400" cy="450" r="89" fill="#F7AEF8" />
        <circle cx="400" cy="450" r="35" fill="#B388EB" />
      </g>
    );
  }

  return (
    <g>
      <rect width="800" height="900" fill="#72DDF7" />
      <g className="admission-art__chapter-breathe">
        {Array.from({ length: 12 }, (_, index) => (
          <path
            key={index}
            d="M400 449C160 166 75 220 51 363 18 542 250 554 400 449Z"
            fill={PALETTE[index % 5]}
            transform={`rotate(${index * 30} 400 450)`}
          />
        ))}
        <circle cx="400" cy="450" r="52" fill="#8093F1" />
      </g>
    </g>
  );
}

export function AdmissionArt({ variant = 'hero', className = '', opening = false }: AdmissionArtProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const paused = useSyncExternalStore(subscribeToMotion, getMotionPaused, getServerMotionPaused);
  const photographic = variant === 'hero' || variant === 'mission' || variant === 'writing';
  const flower = variant === 'writing' ? FLOWERS.blue : FLOWERS.pink;
  const playing = visible && !paused;

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    let intersects = false;
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const updateVisibility = () => setVisible(intersects && !document.hidden && !motionQuery.matches);
    document.addEventListener('visibilitychange', updateVisibility);
    motionQuery.addEventListener('change', updateVisibility);

    if (typeof IntersectionObserver === 'undefined') {
      const frame = window.requestAnimationFrame(() => {
        intersects = true;
        updateVisibility();
      });
      return () => {
        window.cancelAnimationFrame(frame);
        document.removeEventListener('visibilitychange', updateVisibility);
        motionQuery.removeEventListener('change', updateVisibility);
      };
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        intersects = entry.isIntersecting;
        updateVisibility();
      },
      { threshold: 0 },
    );
    observer.observe(root);
    return () => {
      observer.disconnect();
      document.removeEventListener('visibilitychange', updateVisibility);
      motionQuery.removeEventListener('change', updateVisibility);
    };
  }, []);

  return (
    <div
      ref={rootRef}
      className={`admission-art admission-art--${variant} ${className}`.trim()}
      data-motion={paused ? 'paused' : 'playing'}
      data-visible={visible}
      data-opening={opening && variant === 'hero'}
    >
      {photographic ? (
        <div className="admission-art__opening-field" aria-hidden="true">
          <div className="admission-art__field">
            <DecorativeVideo
              className="admission-art__photograph"
              poster={flower.poster}
              src={flower.src}
              playing={playing}
              width={1920}
              height={1080}
              eager={variant === 'hero'}
            />
          </div>
        </div>
      ) : (
        <>
          <svg
            className="admission-art__canvas"
            viewBox="0 0 800 900"
            preserveAspectRatio="xMidYMid slice"
            aria-hidden="true"
          >
            <ChapterScene variant={variant} />
          </svg>
          <div className="admission-art__print-grain" aria-hidden="true" />
          <span className="admission-art__registration admission-art__registration--top" aria-hidden="true">
            +
          </span>
          <span className="admission-art__registration admission-art__registration--bottom" aria-hidden="true">
            +
          </span>
        </>
      )}
      {variant === 'hero' ? (
        <>
          <div className="admission-art__windows" aria-hidden="true">
            {WINDOWS.map((window) => (
              <div
                key={window.className}
                className={`admission-art__window admission-art__window--${window.className}`}
              >
                {window.flower.src ? (
                  <DecorativeVideo
                    poster={window.flower.poster}
                    src={window.flower.src.replace('.mp4', '-detail.mp4')}
                    playing={playing}
                    width={960}
                    height={540}
                    eager
                  />
                ) : (
                  <img
                    src={window.flower.poster}
                    width="1920"
                    height="1080"
                    alt=""
                    decoding="async"
                    draggable={false}
                  />
                )}
                {window.label ? <span className="admission-art__window-label">{window.label}</span> : null}
              </div>
            ))}
          </div>
          <span className="admission-art__coordinate" aria-hidden="true">
            AP — A WORLD OF POSSIBILITY
          </span>
        </>
      ) : null}
      <button
        className="admission-art__motion-toggle"
        type="button"
        aria-label={paused ? 'Play artwork animation' : 'Pause artwork animation'}
        aria-pressed={paused}
        onClick={toggleMotion}
      >
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
          {paused ? (
            <path d="M3 1.5L10 6 3 10.5Z" fill="currentColor" />
          ) : (
            <path d="M3 2V10M9 2V10" stroke="currentColor" strokeWidth="2" />
          )}
        </svg>
        <span>{paused ? 'Play motion' : 'Pause motion'}</span>
      </button>
    </div>
  );
}

export default AdmissionArt;
