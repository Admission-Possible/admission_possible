import { useEffect, useRef, useState } from 'react';
import { Circle } from '../components/Circle';
import { Crumbs } from '../components/Crumbs';
import { navCrumbs } from '../data/nav';

type JoinPayload = {
  first: string;
  last: string;
  email: string;
  grade: string;
  needs: string;
};

// A pragmatic "looks like an email" check — catches typos without rejecting
// valid-but-unusual addresses.
const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

export default function Join() {
  const [label, setLabel] = useState('Join');
  const [error, setError] = useState<string | null>(null);
  const [mailtoOpened, setMailtoOpened] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const labelTimer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(labelTimer.current), []);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const payload: JoinPayload = {
      first: String(data.get('first') ?? '').trim(),
      last: String(data.get('last') ?? '').trim(),
      email: String(data.get('email') ?? '').trim(),
      grade: String(data.get('grade') ?? '').trim(),
      needs: String(data.get('needs') ?? '').trim(),
    };

    // Validate before we celebrate: we need a name to greet you by and an email to reach you at.
    if (!payload.first) {
      setError('Please enter your first name so we know who to reach.');
      return;
    }
    if (!isValidEmail(payload.email)) {
      setError('Please enter a valid email address.');
      return;
    }
    setError(null);
    setMailtoOpened(false);

    // Celebrate only once the payload has actually been delivered.
    const succeed = () => {
      formRef.current?.reset();
      setError(null);
      setLabel('Thanks');
      window.clearTimeout(labelTimer.current);
      labelTimer.current = window.setTimeout(() => setLabel('Join'), 1800);
    };

    // Set VITE_JOIN_ENDPOINT to POST submissions to a backend; unset uses the mailto fallback below.
    // ⚠️ CSP: if this endpoint is CROSS-ORIGIN (e.g. a Formspree/Getform URL), you MUST add its origin
    // to `connect-src` in vercel.json's Content-Security-Policy or the browser will block this POST.
    // A same-origin endpoint (e.g. /api/join) works as-is. See README → Deployment → Security headers.
    const endpoint = import.meta.env.VITE_JOIN_ENDPOINT as string | undefined;

    // No backend configured? Hand the payload to the visitor's mail client.
    // We can't confirm delivery (or that a mail app even exists), so keep the
    // form intact and explain the handoff instead of claiming success.
    if (!endpoint) {
      const subject = `Join request — ${payload.first} ${payload.last}`.trim();
      const body = [
        `First name: ${payload.first}`,
        `Last name: ${payload.last}`,
        `Email: ${payload.email}`,
        `Grade level: ${payload.grade}`,
        `What they need help with: ${payload.needs}`,
      ].join('\n');
      window.location.href = `mailto:hello@admissionpossible.org?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      setMailtoOpened(true);
      return;
    }

    // Backend configured: POST the payload and only say "Thanks" on a real 2xx.
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(`Request failed with ${res.status}`);
      succeed();
    } catch {
      setLabel('Try again');
      setError("We couldn't send that just now. Please try again.");
    }
  };

  return (
    <main className="interior">
      <div className="rule" />
      <Crumbs crumbs={navCrumbs('join')} />
      <div className="rule rule--mb" />

      <div className="join__wrap">
        <form className="join__card" onSubmit={onSubmit} noValidate ref={formRef}>
          <div className="join__row3">
            <div className="field">
              <label htmlFor="first">First name</label>
              <input id="first" type="text" name="first" />
            </div>
            <div className="vrule" />
            <div className="field">
              <label htmlFor="last">Last name</label>
              <input id="last" type="text" name="last" />
            </div>
            <div className="vrule" />
            <div className="field">
              <label htmlFor="email">Email</label>
              <input id="email" type="email" name="email" />
            </div>
          </div>
          <div className="field field--mt">
            <label htmlFor="grade">Grade level</label>
            <input id="grade" type="text" name="grade" placeholder="e.g. 11th grade" />
          </div>
          <div className="field field--mt">
            <label htmlFor="needs">What do you need help with?</label>
            <textarea id="needs" name="needs" rows={3} />
          </div>
          {error && (
            <p className="join__error" role="alert" aria-live="polite">
              {error}
            </p>
          )}
          {mailtoOpened && (
            <p className="join__note" role="status">
              We started a draft in your email app — your message isn't sent until you hit Send there. Nothing opened?
              Email us directly at <a href="mailto:hello@admissionpossible.org">hello@admissionpossible.org</a>.
            </p>
          )}
          <Circle size="join" type="submit">
            {label}
          </Circle>
        </form>
      </div>
      <div className="join__email">
        <a href="mailto:hello@admissionpossible.org">hello@admissionpossible.org</a>
      </div>
    </main>
  );
}
