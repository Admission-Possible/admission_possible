import type { CSSProperties } from 'react';
import { APPLICATION_PATHWAYS } from '../data/content';

/**
 * The application pathways as a branded set, laid out like the reference's
 * partner marks: a ruled head, then a grid where each system shows its
 * official logo (once supplied) above its name set in the Admission Possible
 * wordmark's type.
 */
export function PathwayMarks() {
  return (
    <section className="pathway-marks" aria-labelledby="pathways-title">
      <div className="section-head" data-reveal="group">
        <span className="divider" />
        <h2 className="eyebrow" id="pathways-title">
          Application pathways
        </h2>
      </div>
      <ul className="pathway-marks__grid" data-reveal="group">
        {APPLICATION_PATHWAYS.map((p, n) => (
          <li key={p.slug} className="pathway-mark" style={{ '--i': n } as CSSProperties}>
            {p.logo && <img className="pathway-mark__logo" src={p.logo} alt="" loading="lazy" decoding="async" />}
            <span className="pathway-mark__name">{p.name}</span>
          </li>
        ))}
      </ul>
      <p className="pathway-marks__note" data-reveal="">
        Guidance across the systems you’ll use.
      </p>
    </section>
  );
}
