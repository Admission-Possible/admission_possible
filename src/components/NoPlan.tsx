import { Circle } from './Circle';

// Shown when /plan or /dashboard is opened without a stored intake.
//
// These pages used to `navigate('/router', { replace: true })` silently, which
// dropped the student back onto a blank question 1 with no explanation — it
// read as though their plan had been deleted. Saying so plainly is kinder, and
// it distinguishes "you haven't done this yet" from "we lost your work".
export function NoPlan() {
  return (
    <main className="ov-noplan">
      <h1 className="ov-noplan__title">We couldn't find your plan</h1>
      <p className="ov-noplan__body">
        Your plan is saved on this device. If you're on a different browser or device — or you cleared your browsing
        data — it won't be here. The intake takes about two minutes.
      </p>
      <div className="ov-noplan__cta">
        <Circle size="plan" to="/router">
          Take the intake
        </Circle>
      </div>
    </main>
  );
}
