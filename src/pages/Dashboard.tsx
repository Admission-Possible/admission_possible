import { useState } from 'react';
import { Link } from 'react-router';
import { Circle } from '../components/Circle';
import { Icon } from '../components/Icon';
import { NoPlan } from '../components/NoPlan';
import { loadIntake } from '../data/storage';
import type { Intake } from '../types';

// Typical fall-cycle dates; `match` keys a row to the recommended pathway
// (empty = always shown). Exact dates shift every year — the sample-data
// note tells students to confirm on each system's official site.
const DEADLINES: { sys: string; date: string; match: string }[] = [
  { sys: 'QuestBridge', date: 'Sep 26', match: 'QuestBridge' },
  { sys: 'Common App (EA)', date: 'Nov 1', match: '' },
  { sys: 'UC Application', date: 'Nov 30', match: 'UC Application' },
  { sys: 'ApplyTexas (priority)', date: 'Dec 1', match: 'ApplyTexas' },
  { sys: 'CBCA', date: 'Rolling', match: 'CBCA' },
];

export default function Dashboard() {
  const [intake] = useState<Intake | null>(() => loadIntake());

  // No silent redirect: say what happened and offer the way back.
  if (!intake || !intake.plan) return <NoPlan />;

  const plan = intake.plan;
  const track = intake.trackOverride ?? plan.trackName ?? 'Self-paced course';
  const coaching =
    track === '1:1 Coaching' ? (
      <Link to="/join">Share your contact info to schedule your first session</Link>
    ) : (
      <Link to="/join">Get matched with a coach</Link>
    );
  const deadlines = DEADLINES.filter((d) => !d.match || plan.pathway.indexOf(d.match) >= 0);

  return (
    <main className="ov-dash">
      <div className="label">Your dashboard</div>
      <h1 className="ov-dash__title">Buenos días. Let's keep moving.</h1>
      <p className="ov-dash__sample" role="note">
        This is a preview with sample progress data. Deadlines are typical fall dates — confirm each on the official
        site.
      </p>

      <div className="ov-dash__next">
        <div>
          <div className="label">Next step</div>
          <div className="ov-dash__step">Finish Lesson 2</div>
        </div>
        <Circle size="dash" to="/writing-course">
          Continue
        </Circle>
      </div>

      <div className="ov-dash__rows">
        <div className="ov-dash__row">
          <div className="ov-dash__k">
            <Icon name="course" className="row-icon" />
            Course progress
          </div>
          <div>
            <div className="ov-dash__sub">Module 2 of 8</div>
            <div className="ov-bar">
              <div className="ov-bar__fill" style={{ width: '25%' }} />
            </div>
          </div>
        </div>
        <div className="ov-dash__row">
          <div className="ov-dash__k">
            <Icon name="bookmark" className="row-icon" />
            Your list
          </div>
          <div className="ov-dash__v">
            {plan.reach.length} reach · {plan.target.length} target · {plan.likely.length} likely
          </div>
        </div>
        <div className="ov-dash__row">
          <div className="ov-dash__k">
            <Icon name="calendar" className="row-icon" />
            Deadlines
          </div>
          <div className="ov-dash__deadlines">
            {deadlines.map((d) => (
              <div className="ov-dl" key={d.sys}>
                <span>{d.sys}</span>
                <span className="ov-dl__date">{d.date}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="ov-dash__row">
          <div className="ov-dash__k">
            <Icon name="coaching" className="row-icon" />
            Coaching
          </div>
          <div className="ov-dash__v">{coaching}</div>
        </div>
      </div>
    </main>
  );
}
