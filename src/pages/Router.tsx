import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { Circle } from '../components/Circle';
import { Slash } from '../components/Slash';
import { QUESTIONS } from '../data/questions';
import { computePlan } from '../data/plan';
import { clearDraft, loadDraft, loadIntake, saveDraft, saveIntake } from '../data/storage';
import type { Answers, Intake } from '../types';

// The 7-step intake. Computes the plan and hands off via storage.
export default function Router() {
  const navigate = useNavigate();
  // Rehydrate from the per-tab draft so pull-to-refresh or a gesture-back on
  // steps 2-7 doesn't silently discard every answer.
  const [draft] = useState(loadDraft);
  // A completed intake seeds the questions so re-entry isn't seven questions
  // from memory. The answers were already persisted; nothing read them.
  const [prior] = useState<Intake | null>(loadIntake);
  const [step, setStep] = useState(() => {
    const restored = draft?.step ?? 0;
    // Clamp: a stale draft from a shorter/longer question set must not index out.
    return Math.min(Math.max(restored, 0), QUESTIONS.length - 1);
  });
  const [answers, setAnswers] = useState<Answers>(() => draft?.answers ?? prior?.answers ?? {});
  // Only announce the reseed when it actually happened — an in-progress draft
  // takes precedence, and there is nothing to say on a first run.
  const resumed = !draft && !!prior;
  const [saveError, setSaveError] = useState(false);

  // Persist progress on every change, so there is no window where an answer is
  // only in React state.
  useEffect(() => {
    saveDraft(step, answers);
  }, [step, answers]);

  const total = QUESTIONS.length;
  const q = QUESTIONS[step];
  const sel = answers[q.key];
  const isLast = step === total - 1;
  const canNext = q.multi ? Array.isArray(sel) && sel.length > 0 : !!sel;

  const isSelected = (opt: string) => (q.multi ? Array.isArray(sel) && sel.indexOf(opt) >= 0 : sel === opt);

  const select = (opt: string) => {
    setAnswers((prev) => {
      const a: Answers = { ...prev };
      if (q.multi) {
        const cur = Array.isArray(a[q.key]) ? [...(a[q.key] as string[])] : [];
        const i = cur.indexOf(opt);
        if (i >= 0) cur.splice(i, 1);
        else cur.push(opt);
        a[q.key] = cur;
      } else {
        a[q.key] = opt;
      }
      return a;
    });
  };

  const next = () => {
    if (!canNext) return;
    if (step < total - 1) {
      setStep(step + 1);
      window.scrollTo({ top: 0 });
    } else {
      const plan = computePlan(answers);
      // Redoing the intake used to discard the track the student had switched
      // to on the plan page. Carry it forward when they didn't change their
      // answer to the track question.
      const keepOverride = prior?.trackOverride && prior.answers.track === answers.track;
      const next: Intake = keepOverride ? { answers, plan, trackOverride: prior.trackOverride } : { answers, plan };
      if (!saveIntake(next)) {
        setSaveError(true);
        return;
      }
      clearDraft();
      // `replace`, so Back from the freshly generated plan doesn't remount a
      // blank question 1 — which reads as though the plan was deleted.
      navigate('/plan', { replace: true });
    }
  };

  const back = () => {
    if (step > 0) {
      setStep(step - 1);
      window.scrollTo({ top: 0 });
    } else {
      // Leaving the intake from step 1 abandons it; don't resurrect the draft.
      clearDraft();
      navigate('/');
    }
  };

  return (
    <main>
      <div
        className="ov-progress"
        role="progressbar"
        aria-label="Intake progress"
        aria-valuemin={1}
        aria-valuemax={total}
        aria-valuenow={step + 1}
      >
        {QUESTIONS.map((_, i) => (
          <div key={i} className="ov-seg" style={{ background: i <= step ? 'var(--accent)' : 'var(--hairline)' }} />
        ))}
      </div>
      <div className="ov-router">
        <div className="ov-router__meta">
          {step + 1} / {total}
          {q.multi && <span className="ov-router__hint">Select all that apply</span>}
        </div>
        {resumed && step === 0 && (
          <p className="ov-router__resume">
            You already have a plan — your answers are filled in below. Change anything and we'll rebuild it, or{' '}
            <Link to="/plan">go back to your plan</Link>.
          </p>
        )}
        <h2 className="ov-router__q" id="router-question">
          {q.q}
        </h2>
        <div className="ov-ans__list" role="group" aria-labelledby="router-question">
          {q.options.map((opt) => {
            const on = isSelected(opt);
            return (
              <button type="button" className="ov-ans" key={opt} onClick={() => select(opt)} aria-pressed={on}>
                <span className={'ov-ans__mark' + (on ? ' is-on' : '')} aria-hidden="true" />
                <span className={'ov-ans__label' + (on ? ' is-on' : '')}>{opt}</span>
              </button>
            );
          })}
        </div>
        {saveError && (
          <p className="ov-router__error" role="alert">
            We couldn't save your plan — your browser is blocking site storage (this can happen in private browsing).
            Allow storage for this site, or leave private mode, and press the button again.
          </p>
        )}
        <div className="ov-router__foot">
          <button className="ov-back" onClick={back}>
            {step === 0 ? 'Cancel' : 'Back'}
          </button>
          {isLast ? (
            <Circle size="router" onClick={next} disabled={!canNext} style={{ opacity: canNext ? 1 : 0.35 }}>
              See my plan
            </Circle>
          ) : (
            <button className="ov-next" onClick={next} disabled={!canNext} style={{ opacity: canNext ? 1 : 0.35 }}>
              Next
              <Slash variant="inline" />
            </button>
          )}
        </div>
      </div>
    </main>
  );
}
