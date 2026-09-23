import { Wordmark } from './Wordmark';
import '../styles/opening-intro.css';

/**
 * "Impossible Becomes Possible" resolves into "Admission Possible", then the
 * title card docks into the header's brand block and the hero takes over.
 *
 * The transformation is a line swap, not a letter morph: "Possible" stays put
 * and gains its underline, while "Impossible Becomes" rolls out of the first
 * line as "Admission" rolls in. The heading text is exposed to assistive tech
 * by the page's own h1, so this layer is decorative.
 */
export function OpeningIntro({ onSkip }: { onSkip: () => void }) {
  return (
    <>
      <div className="opening-intro" aria-hidden="true">
        <div className="opening-intro__card">
          <p className="opening-intro__title">
            <span className="opening-intro__line opening-intro__line--first">
              <span className="opening-intro__from">
                <span>Impossible</span> <span>Becomes</span>
              </span>
              <span className="opening-intro__to">Admission</span>
            </span>
            <span className="opening-intro__line opening-intro__line--last">
              <span className="opening-intro__possible">Possible</span>
            </span>
          </p>
          <div className="opening-intro__brand">
            <Wordmark white />
          </div>
        </div>
      </div>
      <button className="opening-intro__skip" type="button" onClick={onSkip}>
        Skip intro <span aria-hidden="true">+</span>
      </button>
    </>
  );
}
