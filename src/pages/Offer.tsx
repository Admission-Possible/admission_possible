import type { CSSProperties } from 'react';
import { EditorialHero } from '../components/EditorialHero';
import { Possible } from '../components/Possible';
import { CORE_MESSAGE, MENTORSHIP_GOALS } from '../data/content';

const i = (n: number) => ({ '--i': n }) as CSSProperties;

// Guided mentorship over months or years, not a college-application service.
export default function Offer() {
  return (
    <main className="interior offer">
      <EditorialHero kicker="(Ad)mission Possible" title="What we offer" tone="plum" />
      <section className="offer-message" aria-label="Our philosophy">
        <h2 className="offer-message__lead" data-reveal="mask">
          {CORE_MESSAGE.lead}
        </h2>
        <div className="offer-message__body" data-reveal="group">
          {CORE_MESSAGE.body.map((line, n) => (
            <p key={line} style={i(n)}>
              {line}
            </p>
          ))}
        </div>
        <p className="offer-message__close" data-reveal="group">
          <span style={i(0)}>{CORE_MESSAGE.close[0]}</span>
          <span style={i(1)}>{CORE_MESSAGE.close[1]}</span>
          <span style={i(2)}>
            {CORE_MESSAGE.close[2]} <Possible />.
          </span>
        </p>
      </section>
      <section className="offer-goals" aria-labelledby="offer-goals-title" data-reveal="group">
        <span className="divider" />
        <h2 className="eyebrow" id="offer-goals-title" style={i(0)}>
          The goal is to help students
        </h2>
        <ul>
          {MENTORSHIP_GOALS.map((goal, n) => (
            <li key={goal} style={i(n + 1)}>
              {goal}
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
