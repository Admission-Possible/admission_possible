import { useRef } from 'react';
import { Link, useOutletContext } from 'react-router';
import { AdmissionArt } from '../components/AdmissionArt';

const CHAPTERS = [
  {
    number: '01',
    name: 'Pathways',
    title: 'A way forward, built around you.',
    description:
      'Where to apply, how to apply, and what it will cost. Make sense of the application systems, then build a balanced college list around fit and finances.',
    topics: [
      'Find your application pathway',
      'Build a reach, target, and likely list',
      'Understand fit and financial aid',
      'Make sense of the application portals',
      'Know your next step',
    ],
    to: '/pathways',
    action: 'Explore the pathways',
    art: 'pathways' as const,
  },
  {
    number: '02',
    name: 'Your story',
    title: 'The best essay sounds like you.',
    description:
      'An eight-module path from picking a topic to the last short answer. The syllabus is ready; in-browser lessons are still being built. In the meantime, a coach can work through it with you over email. Free.',
    topics: [
      'Find a story only you can tell',
      'Research the details that matter',
      'Choose a structure and write a draft',
      'Shape your personal statement',
      'Tackle supplementals and short answers',
    ],
    to: '/writing-course',
    action: 'Explore the writing course',
    art: 'writing' as const,
  },
  {
    number: '03',
    name: 'Your people',
    title: 'You don’t have to do this alone.',
    description:
      'Get matched with a near-peer coach who remembers what it felt like to be a first-gen applicant. A real person to read your drafts, talk through the process, and help you take the next step.',
    topics: [
      'A near-peer coach match',
      'One-on-one draft review',
      'Accountability and check-ins',
      'Guidance in plain language',
      'Ask for a coach. We’ll email you back.',
    ],
    to: '/coaching',
    action: 'Meet your support system',
    art: 'support' as const,
  },
];

const GUIDES = [
  {
    number: '01',
    title: 'Find your route',
    subtitle: 'Seven questions. A place to start.',
    to: '/router',
    mark: '↗',
    tone: 'blue',
  },
  {
    number: '02',
    title: 'Build your list',
    subtitle: 'Fit and finances, together.',
    to: '/list-builder',
    mark: '↔',
    tone: 'pink',
  },
  {
    number: '03',
    title: 'Tell your story',
    subtitle: 'From the first idea to the final draft.',
    to: '/writing-course',
    mark: '✳',
    tone: 'plum',
  },
  {
    number: '04',
    title: 'Find your people',
    subtitle: 'A little help from someone who gets it.',
    to: '/coaching',
    mark: '↗',
    tone: 'sky',
  },
];

export default function Home() {
  const context = useOutletContext<{ opening: boolean } | undefined>();
  const rail = useRef<HTMLDivElement>(null);
  const moveRail = (direction: number) => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    rail.current?.scrollBy({
      left: direction * rail.current.clientWidth * 0.65,
      behavior: reduce ? 'instant' : 'smooth',
    });
  };

  return (
    <main className="report-home">
      <div className="report-art">
        <AdmissionArt variant="hero" opening={context?.opening} />
      </div>
      <section className="report-hero" aria-labelledby="home-title">
        <p className="report-hero__intro">
          The college application, demystified.
          <br />
          Free, and built for the first in their family.
        </p>
        <h1 id="home-title">
          Admission <br />
          Possible
        </h1>
        <p className="report-hero__credit">
          By first-gen students.
          <br />
          For the next ones.
        </p>
        <a className="report-hero__scroll" href="#start-here">
          <span>Scroll to explore</span>
          <span aria-hidden="true">↓</span>
        </a>
      </section>

      <section className="report-systems" id="start-here" aria-label="Application systems">
        <div className="eyebrow">Your application. Your way.</div>
        <div className="report-systems__names">
          <span>QuestBridge</span>
          <span>Common App</span>
          <span>UC Application</span>
          <span>Coalition</span>
          <span>ApplyTexas</span>
          <span>CBCA</span>
        </div>
        <p className="report-systems__note">Guidance across the systems you’ll use.</p>
      </section>

      <section className="report-mission">
        <div className="eyebrow">Impossible becomes</div>
        <h2 data-reveal="">
          Your dreams feel impossible on your own.
          <br />
          We are here to help make them possible.
        </h2>
        <div className="report-mission__visual">
          <div className="report-mission__art">
            <AdmissionArt variant="mission" />
            <span className="report-mission__word" aria-hidden="true">
              A future.
              <br />
              Yours.
            </span>
          </div>
          <div className="report-mission__facts">
            <div className="report-fact">
              <span className="report-fact__number">$0</span>
              <p>
                For the guidance you deserve.
                <br />
                Always free.
              </p>
            </div>
            <div className="report-fact">
              <span className="report-fact__number">6</span>
              <p>
                Application pathways.
                <br />A clearer way forward.
              </p>
            </div>
          </div>
        </div>
        <div className="report-introduction">
          <span className="eyebrow">A map for the next chapter</span>
          <div>
            <h3 data-reveal="">The college application shouldn’t be a test of who your family knows.</h3>
            <p>
              We’re first-gen students who walked this road without a map — the forms, the essays, the deadlines nobody
              at home could explain.
            </p>
            <p>
              We built (Ad)mission Possible so the next student doesn’t have to figure it out alone. Where to apply, how
              to apply, and how to write the essays that get you in. Every pathway, every list, every essay, demystified
              and free.
            </p>
            <Link className="text-link" to="/about">
              Get to know us <span aria-hidden="true">↗</span>
            </Link>
          </div>
        </div>
      </section>

      <section className="report-belief">
        <div className="report-belief__identity">
          <span className="report-belief__asterisk" aria-hidden="true">
            ✳
          </span>
          <span className="eyebrow">
            First-gen access.
            <br />
            That’s the whole idea.
          </span>
        </div>
        <div>
          <h2 data-reveal="">
            Work independently.
            <br />
            Not alone.
          </h2>
          <p>A plan for where to apply. A path through the essays. A person in your corner.</p>
        </div>
      </section>

      <div className="report-chapters" aria-label="Explore our three chapters">
        {CHAPTERS.map((chapter) => (
          <section className={`report-chapter report-chapter--${chapter.art}`} key={chapter.number}>
            <div className="report-chapter__name">
              <span>{chapter.number}</span>
              <h2>{chapter.name}</h2>
            </div>
            <div className="report-chapter__intro">
              <h3>{chapter.title}</h3>
              <p>{chapter.description}</p>
            </div>
            <div className="report-chapter__art">
              <AdmissionArt variant={chapter.art} />
            </div>
            <div className="report-chapter__details">
              <span className="eyebrow">In this chapter</span>
              <ul>
                {chapter.topics.map((topic) => (
                  <li key={topic}>{topic}</li>
                ))}
              </ul>
              <Link className="bar-link" to={chapter.to}>
                <span>{chapter.action}</span>
                <span aria-hidden="true">↗</span>
              </Link>
            </div>
          </section>
        ))}
      </div>

      <section className="report-guides">
        <div className="report-guides__head">
          <div>
            <span className="eyebrow">Pick your starting point</span>
            <h2 data-reveal="">
              Big questions.
              <br />
              Clear next steps.
            </h2>
          </div>
          <div className="rail-controls">
            <button type="button" onClick={() => moveRail(-1)} aria-label="Previous guides">
              ←
            </button>
            <button type="button" onClick={() => moveRail(1)} aria-label="Next guides">
              →
            </button>
          </div>
        </div>
        <div className="guide-rail" ref={rail}>
          {GUIDES.map((guide) => (
            <Link className={`guide-card guide-card--${guide.tone}`} to={guide.to} key={guide.number}>
              <div className="guide-card__art" aria-hidden="true">
                <span>{guide.mark}</span>
                <span className="guide-card__index">{guide.number}</span>
              </div>
              <div className="guide-card__body">
                <h3>{guide.title}</h3>
                <span aria-hidden="true">↗</span>
                <p>{guide.subtitle}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="report-story">
        <Link to="/team/jose" className="report-story__photo" aria-label="Read Jose’s story">
          <img src="/team/jose-story.webp" alt="Jose Cruz, Admission Possible founder" loading="lazy" />
          <span className="report-story__photo-label">
            Jose Cruz <span aria-hidden="true">↗</span>
          </span>
        </Link>
        <div className="report-story__copy">
          <span className="eyebrow">Built by someone who’s been there</span>
          <h2 data-reveal="">
            “The plan is yours.
            <br />
            We just hand you the map.”
          </h2>
          <p>
            From translating forms for his family to building the map he wished he’d had at seventeen. Meet Jose, one of
            the first-gen students behind Admission Possible.
          </p>
          <Link className="text-link" to="/team/jose">
            Read Jose’s story <span aria-hidden="true">↗</span>
          </Link>
        </div>
      </section>

      <section className="report-start">
        <span className="eyebrow">Your future starts with a first step</span>
        <h2 data-reveal="">
          Let’s make
          <br />
          admission possible.
        </h2>
        <Link className="bar-link" to="/router">
          <span>Start</span>
          <span aria-hidden="true">↗</span>
        </Link>
        <p>Seven questions. Your own starting plan. No account needed.</p>
      </section>
    </main>
  );
}
