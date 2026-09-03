import { useRef, useState } from 'react';
import { Link } from 'react-router';
import { Circle } from '../components/Circle';
import { Crumbs } from '../components/Crumbs';
import { navCrumb } from '../data/nav';
import { loadIntake } from '../data/storage';
import type { School } from '../types';

const FACTORS: [string, string][] = [
  ['Academic', 'Programs, rigor, admit range vs your profile'],
  ['Financial', 'Net price not sticker, aid generosity, no-loan policies'],
  ['Social', 'Size, culture, first-gen support'],
  ['Geographic', 'Distance, urban/rural, in-state systems'],
  ['Cultural', 'Belonging, HBCU/HSI options'],
];

/** The student's three columns as plain text, for copying somewhere useful. */
function listToText(reach: School[], target: School[], likely: School[]): string {
  const col = (title: string, list: School[]) =>
    [`${title}:`, ...(list.length ? list.map((s) => `  - ${s.name} (${s.tag})`) : ['  (none)'])].join('\n');
  return ['My college list', '', col('Reach', reach), col('Target', target), col('Likely', likely)].join('\n');
}

function YourList({ reach, target, likely }: { reach: School[]; target: School[]; likely: School[] }) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<number | undefined>(undefined);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(listToText(reach, target, likely));
      setCopied(true);
      window.clearTimeout(timer.current);
      timer.current = window.setTimeout(() => setCopied(false), 1800);
    } catch {
      // Clipboard unavailable; the list is on screen and selectable.
      setCopied(false);
    }
  };

  const col = (title: string, list: School[]) => (
    <div>
      <div className="ov-school__head">{title}</div>
      {list.map((s) => (
        <div className="ov-school" key={s.name}>
          <div className="ov-school__name">{s.name}</div>
          <div className="ov-school__tag">{s.tag}</div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="listbuilder__yours">
      <div className="label">Your starter list</div>
      <div className="ov-plan__cols">
        {col('Reach', reach)}
        {col('Target', target)}
        {col('Likely', likely)}
      </div>
      <div className="ov-plan__export">
        <button className="ov-plan__switch" onClick={copy}>
          {copied ? 'Copied' : 'Copy my list'}
        </button>
        <Link className="ov-plan__switch" to="/plan">
          Back to my plan
        </Link>
      </div>
    </div>
  );
}

export default function ListBuilder() {
  // The page promised a tool and rendered a brochure — it imported no storage
  // at all, so it could never show the list it offered to refine.
  const [intake] = useState(() => loadIntake());
  const plan = intake?.plan;

  return (
    <main className="interior">
      <div className="rule" />
      <Crumbs crumbs={[navCrumb('how'), { label: 'College list builder' }]} />
      <div className="rule" />

      <div className="page-intro">
        <h1 className="subhead" data-reveal="">
          A list built on fit and finances, not luck.
        </h1>
        <p className="page-intro__lede" data-reveal="">
          Balance is the whole game. We help you spread your list so an acceptance is likely and an affordable
          acceptance is likely too.
        </p>
      </div>

      {plan && <YourList reach={plan.reach} target={plan.target} likely={plan.likely} />}

      <div className="triband">
        <div className="triband__col">
          <div className="triband__k">
            <span className="accent">Reach</span>
          </div>
          <div className="triband__v">Ambitious, but worth the shot — especially where aid is strong.</div>
        </div>
        <div className="triband__slash" />
        <div className="triband__col">
          <div className="triband__k">
            <span className="accent">Target</span>
          </div>
          <div className="triband__v">Your profile lines up with their admitted range.</div>
        </div>
        <div className="triband__slash" />
        <div className="triband__col">
          <div className="triband__k">
            <span className="accent">Likely</span>
          </div>
          <div className="triband__v">A confident yes, and a price you can actually pay.</div>
        </div>
      </div>

      <div className="label" style={{ margin: '50px 0 0' }}>
        Fit, made concrete
      </div>
      <div className="feature-rows">
        {FACTORS.map(([k, v]) => (
          <div className="feature-row" key={k}>
            <div className="feature-row__k">{k}</div>
            <div className="feature-row__v">{v}</div>
          </div>
        ))}
      </div>

      <p className="callout" data-reveal="">
        Money decides where you can actually enroll. We teach FAFSA vs CSS, fee waivers, and the QuestBridge path as we
        go.
      </p>

      <div className="section-cta">
        {/* Plan-aware: sending a student who already answered seven questions
            back to question 1 wiped the plan they came here to refine. */}
        {plan ? <Circle to="/router">Change my answers</Circle> : <Circle to="/router">Build my list</Circle>}
      </div>
    </main>
  );
}
