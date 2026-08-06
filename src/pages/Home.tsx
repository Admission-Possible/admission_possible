import { Circle } from '../components/Circle';
import { IntroFloat } from '../components/IntroFloat';

export default function Home() {
  return (
    <main>
      {/* INTRO — floating-tiles scroll story */}
      <IntroFloat />

      {/* HERO */}
      <section id="hero" className="hero">
        <div className="rule rule--mt" />
        <div className="hero__lead">
          <div className="label">Start here</div>
          <p className="hero__blurb">
            The college application, demystified. Where to apply, how to apply, and how to write the essays that get you
            in. Free, and built for the first in their family. Para todos.
          </p>
        </div>
      </section>

      {/* TRUST STRIP */}
      <section className="strip">
        <div className="rule" />
        <div className="strip__grid">
          <div className="label">Built around</div>
          <div className="strip__logos">
            <span>QuestBridge</span>
            <span>Common App</span>
            <span>UC Application</span>
            <span>Coalition</span>
            <span>ApplyTexas</span>
            <span>CBCA</span>
          </div>
        </div>
        <div className="rule" />
      </section>

      {/* MANIFESTO */}
      <section className="manifesto">
        <div className="manifesto__grid">
          <div className="label">Manifesto</div>
          <div className="vrule" />
          <div className="manifesto__lines">
            <div data-reveal="">Your dreams feel impossible on your own</div>
            <div data-reveal="">We are here to help make them possible</div>
          </div>
          <div />
        </div>
      </section>

      {/* CLOSING CTA */}
      <section className="cta">
        <div className="rule" />
        <div className="cta__inner">
          <h2 data-reveal="" className="cta__head">
            Let's make admission possible.
          </h2>
          <Circle to="/router" reveal>
            Start
          </Circle>
        </div>
        <div className="rule" />
      </section>
    </main>
  );
}
