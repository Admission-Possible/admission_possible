import { useRef, type CSSProperties } from 'react';
import { Link } from 'react-router';
import { COLLEGE_IMAGES } from '../data/colleges';
import { HOW_STEPS } from '../data/content';

// One campus photo per step, none repeated from the facts section.
const STEP_IMAGES = [0, 3, 6, 21, 27].map((n) => COLLEGE_IMAGES[n].src);

/**
 * The steps as a card rail, after the reference's case-study row: image, a
 * purple rule that grows on hover, then the name and what happens there.
 */
export function StepRail() {
  const rail = useRef<HTMLOListElement>(null);
  const move = (direction: number) => {
    const el = rail.current;
    if (!el) return;
    const card = el.querySelector('li');
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    el.scrollBy({
      left: direction * ((card?.getBoundingClientRect().width ?? el.clientWidth * 0.3) + 16),
      behavior: reduce ? 'instant' : 'smooth',
    });
  };

  return (
    <section className="step-rail" aria-labelledby="steps-title">
      <div className="section-head" data-reveal="group">
        <span className="divider" />
        <span className="eyebrow">How it works</span>
      </div>
      <div className="step-rail__head">
        <h2 id="steps-title" data-reveal="mask">
          Five steps from where you are to where you’re going.
        </h2>
        <div className="rail-controls">
          <button type="button" onClick={() => move(-1)} aria-label="Previous steps">
            ←
          </button>
          <button type="button" onClick={() => move(1)} aria-label="Next steps">
            →
          </button>
        </div>
      </div>
      <ol className="step-rail__list" ref={rail} data-reveal="group">
        {HOW_STEPS.map((step, n) => (
          <li key={step.title} className="step-card" style={{ '--i': n } as CSSProperties}>
            <Link to="/how" className="step-card__link">
              <span className="step-card__media">
                <img src={STEP_IMAGES[n]} alt="" loading="lazy" decoding="async" />
              </span>
              <span className="step-card__bar" aria-hidden="true" />
              <span className="step-card__num" aria-hidden="true">
                {String(n + 1).padStart(2, '0')}
              </span>
              <span className="step-card__title">{step.title}</span>
              <span className="step-card__points">{step.points.join(' · ')}</span>
            </Link>
          </li>
        ))}
      </ol>
    </section>
  );
}
