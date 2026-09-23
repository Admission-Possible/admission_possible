import { COLLEGE_IMAGES } from '../data/colleges';

// Split the photos across two rows that travel in opposite directions.
const ROWS = [COLLEGE_IMAGES.filter((_, n) => n % 2 === 0), COLLEGE_IMAGES.filter((_, n) => n % 2 === 1)];

/**
 * Every campus photo in one continuous sequence. Each row is rendered twice
 * back to back and translated by exactly one copy's width, so the loop never
 * jumps. Frames share one aspect ratio and crop with object-fit, so nothing
 * is stretched. Decorative: the second copy is hidden from assistive tech.
 */
export function CampusCarousel() {
  return (
    <section className="campus-carousel" aria-label="Campus photographs">
      {ROWS.map((row, r) => (
        <div key={r} className={`campus-carousel__row campus-carousel__row--${r ? 'reverse' : 'forward'}`}>
          <div className="campus-carousel__track">
            {[0, 1].map((copy) =>
              row.map((image) => (
                <figure className="campus-carousel__frame" key={`${copy}-${image.src}`} aria-hidden={copy === 1}>
                  <img
                    src={image.src}
                    alt=""
                    loading="lazy"
                    decoding="async"
                    width={image.width}
                    height={image.height}
                  />
                </figure>
              )),
            )}
          </div>
        </div>
      ))}
    </section>
  );
}
