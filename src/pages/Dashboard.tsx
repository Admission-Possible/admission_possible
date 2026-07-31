import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { Circle } from '../components/Circle';
import { Icon } from '../components/Icon';
import { loadIntake } from '../data/storage';
import type { Intake } from '../types';

const DEADLINES: { sys: string; date: string }[] = [
  { sys: 'QuestBridge', date: 'Sep 26' },
  { sys: 'Common App (EA)', date: 'Nov 1' },
  { sys: 'UC Application', date: 'Nov 30' },
];

export default function Dashboard() {
  const navigate = useNavigate();
  const [intake] = useState<Intake | null>(() => loadIntake());

  useEffect(() => {
    if (!intake || !intake.plan) navigate('/router', { replace: true });
  }, [intake, navigate]);

  if (!intake || !intake.plan) return null;

  const track = intake.trackOverride ?? intake.plan.trackName ?? 'Self-paced course';
  const coaching = track === '1:1 Coaching' ? 'Next session: Thu 4:00pm' : 'Get matched with a coach';

  return (
    <main className="ov-dash">
      <div className="label">Your dashboard</div>
      <h1 className="ov-dash__title">Buenos días. Let's keep moving.</h1>

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
          <div className="ov-dash__v">3 reach · 3 target · 3 likely</div>
        </div>
        <div className="ov-dash__row">
          <div className="ov-dash__k">
            <Icon name="calendar" className="row-icon" />
            Deadlines
          </div>
          <div className="ov-dash__deadlines">
            {DEADLINES.map((d) => (
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
