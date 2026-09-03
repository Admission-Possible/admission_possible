import { useRef, useState } from 'react';
import { Link } from 'react-router';
import { Circle } from '../components/Circle';
import { NoPlan } from '../components/NoPlan';
import { planToText } from '../data/planText';
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
  const [intake, setIntake] = useState<Intake | null>(() => loadIntake());
  const [copied, setCopied] = useState(false);
  const copyTimer = useRef<number | undefined>(undefined);

  // No silent redirect: say what happened and offer the way back.
  if (!intake || !intake.plan) return <NoPlan />;

  const p = intake.plan;
  const activeTrack: TrackName = intake.trackOverride ?? p.trackName ?? 'Self-paced course';
  const other = activeTrack === 'Self-paced course' ? 'Switch to 1:1 coaching' : 'Switch to self-paced course';

  const toggleTrack = () => {
    const nextTrack: TrackName = activeTrack === 'Self-paced course' ? '1:1 Coaching' : 'Self-paced course';
    const updated: Intake = { ...intake, trackOverride: nextTrack };
    saveIntake(updated);
    setIntake(updated);
  };

  const copyPlan = async () => {
    try {
      await navigator.clipboard.writeText(planToText(p, activeTrack));
      setCopied(true);
      window.clearTimeout(copyTimer.current);
      copyTimer.current = window.setTimeout(() => setCopied(false), 1800);
    } catch {
      // Clipboard blocked (insecure context or denied permission) — the
      // download button below is the fallback, so fail quietly.
      setCopied(false);
    }
  };

  const downloadPlan = () => {
    const blob = new Blob([planToText(p, activeTrack)], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'admission-possible-plan.txt';
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
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
        <div className="ov-plan__hint">
          Refine this in the <Link to="/list-builder">List Builder</Link>.
        </div>
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
      {/* 'Not sure yet' used to collapse silently into self-paced. Say so. */}
      {p.trackChosen === false && !intake.trackOverride && (
        <p className="ov-plan__tracknote">
          You said you weren't sure yet, so we've started you on the self-paced course. Switch whenever you like —
          nothing is locked in.
        </p>
      )}

      {/* The plan is saved on this device only, so give it a way out of the tab. */}
      <div className="ov-plan__export">
        <button className="ov-plan__switch" onClick={copyPlan}>
          {copied ? 'Copied' : 'Copy my plan'}
        </button>
        <button className="ov-plan__switch" onClick={downloadPlan}>
          Download as text
        </button>
      </div>

      <div className="ov-plan__cta">
        <Circle size="plan" to="/dashboard">
          See my dashboard
        </Circle>
      </div>
    </main>
  );
}
