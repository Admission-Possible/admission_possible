import { Wordmark } from './Wordmark';
import '../styles/opening-intro.css';

/** The opening title transforms into the real header's brand block. */
export function OpeningIntro({ onSkip }: { onSkip: () => void }) {
  return (
    <>
      <div className="opening-intro" aria-hidden="true">
        <div className="opening-intro__card">
          <span className="opening-intro__first">Admission</span>
          <span className="opening-intro__last">Possible</span>
          <div className="opening-intro__brand">
            <Wordmark />
          </div>
        </div>
      </div>
      <button className="opening-intro__skip" type="button" onClick={onSkip}>
        Skip intro <span aria-hidden="true">↗</span>
      </button>
    </>
  );
}
