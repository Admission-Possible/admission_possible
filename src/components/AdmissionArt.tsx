import { useEffect, useRef, useState } from 'react';
import { windowImages } from '../data/colleges';
import { DecorativeVideo } from './DecorativeVideo';
import '../styles/admission-art.css';

interface AdmissionArtProps {
  className?: string;
  opening?: boolean;
}

const FIELD = { poster: '/art/flower-pink.webp', src: '/art/flower-pink.mp4' };

// Collage windows over the botanical film. Each window steps through its own
// share of the campus photos, so every provided image appears in the hero.
const WINDOWS = ['first', 'story', 'chapter', 'possibility', 'college', 'fragment-top', 'fragment-right'];
const STEP_MS = 3200;

function CollegeWindow({ name, index, playing }: { name: string; index: number; playing: boolean }) {
  const images = windowImages(index, WINDOWS.length);
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (!playing || images.length < 2) return;
    // Offset each window so the photos never all change on the same beat.
    let interval: number | undefined;
    const start = window.setTimeout(
      () => {
        setStep((s) => s + 1);
        interval = window.setInterval(() => setStep((s) => s + 1), STEP_MS);
      },
      STEP_MS / 2 + index * 430,
    );
    return () => {
      window.clearTimeout(start);
      window.clearInterval(interval);
    };
  }, [playing, images.length, index]);

  const current = step % images.length;
  return (
    <div className={`admission-art__window admission-art__window--${name}`}>
      {images.map((src, i) => (
        <img
          key={src}
          src={src}
          alt=""
          decoding="async"
          draggable={false}
          // Only the first photo in each window is needed for the first paint.
          loading={i === 0 ? 'eager' : 'lazy'}
          data-active={i === current}
        />
      ))}
    </div>
  );
}

/**
 * The hero field: a looping botanical film with campus-photo windows drifting
 * over it. Motion runs on its own and stops only when the artwork is off
 * screen, the tab is hidden, or the visitor's system asks for reduced motion.
 */
export function AdmissionArt({ className = '', opening = false }: AdmissionArtProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

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
      className={`admission-art admission-art--hero ${className}`.trim()}
      data-visible={visible}
      data-opening={opening}
      aria-hidden="true"
    >
      <div className="admission-art__opening-field">
        <div className="admission-art__field">
          <DecorativeVideo
            className="admission-art__photograph"
            poster={FIELD.poster}
            src={FIELD.src}
            playing={visible}
            width={1920}
            height={1080}
            eager
          />
        </div>
      </div>
      <div className="admission-art__windows">
        {WINDOWS.map((name, index) => (
          <CollegeWindow key={name} name={name} index={index} playing={visible} />
        ))}
      </div>
    </div>
  );
}

export default AdmissionArt;
