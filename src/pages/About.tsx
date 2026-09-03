import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router';
import { Crumbs } from '../components/Crumbs';
import { TeamCard } from '../components/TeamCard';
import { navCrumbs } from '../data/nav';
import { TEAM, getMember, hasStory } from '../data/team';

// Directory chip palette (mirrors the planning doc's tag colors).
// Dark chips get cream text; light chips inherit ink.
const ROLE_STYLES: Record<string, { background: string; color?: string }> = {
  'Founding Team': { background: '#D9C8F0' },
  Operational: { background: '#BBD9F2' },
  Technical: { background: '#BFE3C0' },
  Counseling: { background: '#6E5F26', color: '#FBFAF1' },
  Marketing: { background: '#A93529', color: '#FBFAF1' },
  Outreach: { background: '#2E64A8', color: '#FBFAF1' },
};

export default function About() {
  const [selected, setSelected] = useState<string | null>(null);
  const open = getMember(selected ?? undefined);
  const panelRef = useRef<HTMLDivElement | null>(null);

  // The panel mounts below the card grid, so on the single-column mobile layout
  // it can open entirely offscreen — bring it into view on selection. Focus stays
  // on the toggling button (disclosure pattern; aria-expanded announces the state).
  // Optional call: jsdom doesn't implement scrollIntoView.
  useEffect(() => {
    if (!selected) return;
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    panelRef.current?.scrollIntoView?.({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'nearest' });
  }, [selected]);

  return (
    <main className="interior about">
      <div className="rule" />
      <Crumbs crumbs={navCrumbs('about')} />
      <div className="rule rule--mb" />

      {/* WHO WE ARE */}
      <section className="about__intro">
        <div className="about__grid">
          <div className="label">About us</div>
          <div className="vrule" />
          <div>
            <h1 className="about__title" data-reveal="">
              Who we are
            </h1>
            <p className="about__lede" data-reveal="">
              We're first-gen students who walked this road without a map — the forms, the essays, the deadlines nobody
              at home could explain. We built (Ad)mission Possible so the next student doesn't have to figure it out
              alone: every pathway, every list, every essay, demystified and free.
            </p>
          </div>
        </div>
      </section>

      {/* FOUNDING TEAM — click a card to open an intro */}
      <section className="about__team">
        <div className="rule" />
        <div className="team__head">
          <div className="label">Founding team</div>
          <p className="team__intro">Built by first-gen students who walked this road. Click a card to meet us.</p>
        </div>
        <div className="team__cards">
          {TEAM.map((m) => (
            <TeamCard
              key={m.slug}
              name={m.name}
              photo={m.photo}
              tilt={m.tilt}
              onSelect={() => setSelected(selected === m.slug ? null : m.slug)}
              selected={selected === m.slug}
              panelId="about-member-panel"
              hasStory={hasStory(m)}
            />
          ))}
        </div>

        {open && (
          <div
            className="about__panel"
            id="about-member-panel"
            role="region"
            aria-label={`About ${open.name}`}
            ref={panelRef}
          >
            <div className="about__panel-head">
              <span className="about__panel-name">{open.fullName}</span>
              {open.path && <span className="about__panel-path">{open.path}</span>}
            </div>
            <div className="about__panel-cols">
              <p className="about__panel-bio">
                {open.bio ?? `${open.name} is on the founding team. Their profile isn't written yet.`}
              </p>
              <div>
                {open.belief && <p className="about__panel-belief">{open.belief}</p>}
                <ul className="about__panel-roles" aria-label="Roles">
                  {open.roles.map((role) => (
                    <li key={role} className="dir__chip" style={ROLE_STYLES[role] ?? { background: '#DCD6CE' }}>
                      {role}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            {/* Only promise a story where one exists. */}
            {hasStory(open) && (
              <Link className="about__panel-more" to={`/team/${open.slug}`}>
                Read my full story &rarr;
              </Link>
            )}
          </div>
        )}
      </section>
    </main>
  );
}
