import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Circle } from '../components/Circle';
import { Slash } from '../components/Slash';
import { QUESTIONS } from '../data/questions';
import { computePlan } from '../data/plan';
import { saveIntake } from '../data/storage';
import type { Answers } from '../types';

// The 7-step intake. Computes the plan and hands off via sessionStorage.
export default function Router() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});
  const [saveError, setSaveError] = useState(false);

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
      if (!saveIntake({ answers, plan })) {
        setSaveError(true);
        return;
      }
      navigate('/plan');
    }
  };

  const back = () => {
    if (step > 0) {
      setStep(step - 1);
      window.scrollTo({ top: 0 });
    } else {
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
