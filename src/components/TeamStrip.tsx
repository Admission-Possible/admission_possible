import type { CSSProperties } from 'react';
import { Link } from 'react-router';
import { TEAM, hasStory } from '../data/team';
import { Plus } from './Plus';

/**
 * The founding team: name and photograph only, with the links set beside the
 * people as the reference does. Used on Home and About.
 */
export function TeamStrip({ heading = 'Founding team', headingLevel = 2 }: { heading?: string; headingLevel?: 1 | 2 }) {
  const Heading = headingLevel === 1 ? 'h1' : 'h2';
  const links = TEAM.filter(hasStory);
  return (
    <section className="team-strip" aria-labelledby="team-title">
      <div className="section-head" data-reveal="group">
        <span className="divider" />
        <Heading className="eyebrow" id="team-title">
          {heading}
        </Heading>
      </div>
      <div className="team-strip__grid">
        <ul className="team-strip__people" data-reveal="group">
          {TEAM.map((m, n) => (
            <li key={m.slug} className="team-person" style={{ '--i': n } as CSSProperties}>
              <span className="team-person__photo">
                <img src={m.photo} alt="" loading="lazy" decoding="async" />
              </span>
              <span className="team-person__name">{m.fullName}</span>
            </li>
          ))}
        </ul>
        <nav className="team-strip__links" aria-label="Founding team links" data-reveal="group">
          {links.map((m, n) => (
            <Link key={m.slug} className="side-link" to={`/team/${m.slug}`} style={{ '--i': n } as CSSProperties}>
              <span>{m.fullName}’s story</span>
              <Plus />
            </Link>
          ))}
          <Link className="side-link" to="/about" style={{ '--i': links.length } as CSSProperties}>
            <span>About us</span>
            <Plus />
          </Link>
        </nav>
      </div>
    </section>
  );
}
