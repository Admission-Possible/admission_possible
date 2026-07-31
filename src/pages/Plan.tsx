import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { Circle } from '../components/Circle';
import { loadIntake, saveIntake } from '../data/storage';
import type { Intake, School, TrackName } from '../types';

function SchoolCol({ title, list }: { title: string; list: School[] }) {
  return (
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
}

export default function Plan() {
  const navigate = useNavigate();
  const [intake, setIntake] = useState<Intake | null>(() => loadIntake());

  useEffect(() => {
    if (!intake || !intake.plan) navigate('/router', { replace: true });
  }, [intake, navigate]);

  if (!intake || !intake.plan) return null;

  const p = intake.plan;
  const activeTrack: TrackName = intake.trackOverride ?? p.trackName ?? 'Self-paced course';
  const other = activeTrack === 'Self-paced course' ? 'Switch to 1:1 coaching' : 'Switch to self-paced course';
  const cta = activeTrack === 'Self-paced course' ? 'Start my course' : 'Match me with a coach';

  const toggleTrack = () => {
    const nextTrack: TrackName = activeTrack === 'Self-paced course' ? '1:1 Coaching' : 'Self-paced course';
    const updated: Intake = { ...intake, trackOverride: nextTrack };
    saveIntake(updated);
    setIntake(updated);
  };

  return (
    <main className="ov-plan">
      <h1 className="ov-plan__title">Your plan</h1>
      <p className="ov-plan__lede">Here's where to start.</p>

      <div className="ov-plan__sec">
        <div className="label">A — Your pathway</div>
        <div className="ov-plan__pathway">{p.pathway}</div>
        <p className="ov-plan__why">{p.why}</p>
      </div>

      <div className="ov-plan__sec">
        <div className="label ov-plan__sublabel">B — Your starter list</div>
        <div className="ov-plan__cols">
          <SchoolCol title="Reach" list={p.reach} />
          <SchoolCol title="Target" list={p.target} />
          <SchoolCol title="Likely" list={p.likely} />
        </div>
        <div className="ov-plan__hint">Refine this in the List Builder.</div>
      </div>

      <div className="ov-plan__track">
        <div>
          <div className="label">C — Your track</div>
          <div className="ov-plan__trackname">{activeTrack}</div>
        </div>
        <button className="ov-plan__switch" onClick={toggleTrack}>
          {other}
        </button>
      </div>

      <div className="ov-plan__cta">
        <Circle size="plan" to="/dashboard">
          {cta}
        </Circle>
      </div>
    </main>
  );
}
