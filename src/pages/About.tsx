import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router';
import { Crumbs } from '../components/Crumbs';
import { TeamCard } from '../components/TeamCard';
import { navCrumbs } from '../data/nav';
import { TEAM, getMember, hasStory } from '../data/team';
import { EditorialHero } from '../components/EditorialHero';

// Directory chip palette (mirrors the planning doc's tag colors).
// Dark chips get cream text; light chips inherit ink.
const ROLE_STYLES: Record<string, { background: string; color?: string }> = {
  'Founding Team': { background: '#B388EB' },
  Operational: { background: '#72DDF7' },
  Technical: { background: '#8093F1' },
  Counseling: { background: '#FDC5F5' },
  Marketing: { background: '#F7AEF8' },
  Outreach: { background: '#111111', color: '#FFFFFF' },
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
      <EditorialHero
        kicker="About us / The people behind the project"
        title="Who we are"
        tone="lavender"
        note="Built by first-gen students"
        description="We're first-gen students who walked this road without a map — the forms, the essays, the deadlines nobody at home could explain. We built (Ad)mission Possible so the next student doesn't have to figure it out alone: every pathway, every list, every essay, demystified and free."
      />
      <Crumbs crumbs={navCrumbs('about')} />

      {/* FOUNDING TEAM — click a card to open an intro */}
      <section className="about__team">
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
