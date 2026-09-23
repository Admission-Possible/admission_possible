import type { CSSProperties } from 'react';
import { Link, useOutletContext } from 'react-router';
import { AdmissionArt } from '../components/AdmissionArt';
import { CampusCarousel } from '../components/CampusCarousel';
import { Counter } from '../components/Counter';
import { LetsMake } from '../components/LetsMake';
import { PathwayMarks } from '../components/PathwayMarks';
import { Plus } from '../components/Plus';
import { Possible } from '../components/Possible';
import { StepRail } from '../components/StepRail';
import { TeamStrip } from '../components/TeamStrip';
import { COLLEGE_IMAGES } from '../data/colleges';
import { CORE_MESSAGE, FIRST_GEN_LINE, MENTORSHIP_GOALS, MISSION, ORIGIN } from '../data/content';
import { getMember } from '../data/team';

const i = (n: number) => ({ '--i': n }) as CSSProperties;

// One journey, top to bottom: discover us, what we do, how we help, the path,
// the people, then Join us. Join is the only conversion on the page.
export default function Home() {
  const context = useOutletContext<{ opening: boolean } | undefined>();
  const jose = getMember('jose');

  return (
    <main className="home">
      {/* Discover Admission Possible */}
      <section className="home-hero" aria-labelledby="home-title">
        <div className="home-hero__art">
          <AdmissionArt opening={context?.opening} />
        </div>
        <div className="home-hero__copy">
          <p className="home-hero__intro" style={i(0)}>
            Impossible becomes <em>possible</em>.
          </p>
          <h1 id="home-title" style={i(1)}>
            Admission <br />
            Possible
          </h1>
          <p className="home-hero__credit" style={i(2)}>
            {FIRST_GEN_LINE[0]}
            <br />
            {FIRST_GEN_LINE[1]}
          </p>
          <a className="scroll-invite" href="#about" style={i(3)}>
            <span className="scroll-invite__track" aria-hidden="true">
              <span />
            </span>
            <span className="roll-label">
              <span>Scroll to explore</span>
              <span aria-hidden="true">Scroll to explore</span>
            </span>
          </a>
        </div>
      </section>

      {/* Understand what we do */}
      <section className="home-about" id="about" aria-labelledby="about-title">
        <div className="section-head" data-reveal="group">
          <span className="divider" />
          <span className="eyebrow">About us</span>
        </div>
        <h2 id="about-title" className="home-about__title" data-reveal="mask">
          {MISSION[0]} <br />
          {MISSION[1]}
        </h2>
        <span className="home-about__line" data-reveal="line" aria-hidden="true" />
        <div className="home-about__body" data-reveal="group">
          <h3 style={i(0)}>{ORIGIN}</h3>
          <p style={i(1)}>We built (Ad)mission Possible so the next student doesn’t have to figure it out alone.</p>
          <Link className="text-link" to="/about" style={i(2)}>
            Get to know us <Plus />
          </Link>
        </div>

        {/* Two images with facts arriving alongside them. */}
        <div className="home-facts" data-reveal="group">
          <figure className="home-facts__photo home-facts__photo--a" style={i(0)}>
            <img src={COLLEGE_IMAGES[30].src} alt="" loading="lazy" decoding="async" />
          </figure>
          <figure className="home-facts__photo home-facts__photo--b" style={i(1)}>
            <img src={COLLEGE_IMAGES[10].src} alt="" loading="lazy" decoding="async" />
          </figure>
          <dl className="home-facts__list">
            <div className="home-fact" style={i(2)}>
              <dt>
                <Counter prefix="$" value={0} />
              </dt>
              <dd>For the guidance you deserve. Always free.</dd>
            </div>
            <div className="home-fact" style={i(3)}>
              <dt>
                <Counter value={6} />
              </dt>
              <dd>Application pathways. A clearer way forward.</dd>
            </div>
            <div className="home-fact" style={i(4)}>
              <dt className="home-fact__word">Long-term</dt>
              <dd>Guided mentorship that can span months or years.</dd>
            </div>
          </dl>
        </div>
      </section>

      {/* The application systems students use, as a designed set of marks. */}
      <PathwayMarks />

      {/* See how we can help */}
      <section className="home-offer" aria-labelledby="offer-title">
        <div className="home-offer__head" data-reveal="group">
          <span className="divider divider--ink" />
          <span className="eyebrow">What we offer</span>
        </div>
        <div className="home-offer__grid">
          <div className="home-offer__message">
            <h2 id="offer-title" data-reveal="mask">
              {CORE_MESSAGE.lead}
            </h2>
            <div data-reveal="group">
              {CORE_MESSAGE.body.map((line, n) => (
                <p key={line} style={i(n)}>
                  {line}
                </p>
              ))}
            </div>
            <p className="home-offer__close" data-reveal="group">
              <span style={i(0)}>{CORE_MESSAGE.close[0]}</span>
              <span style={i(1)}>{CORE_MESSAGE.close[1]}</span>
              <span style={i(2)}>
                {CORE_MESSAGE.close[2]} <Possible />.
              </span>
            </p>
          </div>
          <div className="home-offer__detail" data-reveal="group">
            <span className="eyebrow" style={i(0)}>
              The goal is to help students
            </span>
            <ul>
              {MENTORSHIP_GOALS.map((goal, n) => (
                <li key={goal} style={i(n + 1)}>
                  {goal}
                </li>
              ))}
            </ul>
            <Link className="text-link" to="/offer" style={i(9)}>
              What we offer <Plus />
            </Link>
          </div>
        </div>
      </section>

      {/* Understand the journey */}
      <StepRail />
      <CampusCarousel />

      {/* The people behind it */}
      {jose?.belief && (
        <section className="home-quote" aria-label="A word from the founding team">
          <div className="home-quote__side" data-reveal="group">
            <span className="home-quote__mark" aria-hidden="true" style={i(0)}>
              “
            </span>
            <img src={jose.photo} alt={`${jose.fullName}`} loading="lazy" decoding="async" style={i(1)} />
            <div className="home-quote__who" style={i(2)}>
              <span>{jose.fullName}</span>
              <span className="eyebrow">Founding team</span>
            </div>
          </div>
          <blockquote className="home-quote__text" data-reveal="mask">
            <p>The plan is yours. We just hand you the map.</p>
          </blockquote>
        </section>
      )}
      <TeamStrip />

      {/* Join us */}
      <LetsMake />
    </main>
  );
}
