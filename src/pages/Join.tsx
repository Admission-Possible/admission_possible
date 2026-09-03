import { useEffect, useRef, useState } from 'react';
import { Circle } from '../components/Circle';
import { Crumbs } from '../components/Crumbs';
import { navCrumbs } from '../data/nav';
import { loadIntake } from '../data/storage';

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

// Submissions POST to a same-origin Vercel Function by default (see api/join.ts),
// which the existing `connect-src 'self'` CSP already allows. Override only to
// point at a different backend; a CROSS-ORIGIN value must also be added to
// `connect-src` in vercel.json or the browser will block the POST.
const endpoint = () => (import.meta.env.VITE_JOIN_ENDPOINT ?? '').trim() || '/api/join';

// The address shown as a manual fallback. Deliberately unset by default: it must
// be a mailbox the project verifiably controls, so when it is unset we show the
// copyable message rather than inventing an address on someone else's domain.
const contactEmail = () => (import.meta.env.VITE_CONTACT_EMAIL ?? '').trim();

/** Abandon a hung endpoint rather than leaving the student on a dead spinner. */
const TIMEOUT_MS = 15000;

/** The submission rendered as plain text, for the copy-and-paste fallback. */
function composeMessage(p: JoinPayload): string {
  return [
    `First name: ${p.first}`,
    `Last name: ${p.last}`,
    `Email: ${p.email}`,
    `Grade level: ${p.grade}`,
    '',
    'What I need help with:',
    p.needs || '(not provided)',
  ].join('\n');
}

export default function Join() {
  const [label, setLabel] = useState('Join');
  const [error, setError] = useState<string | null>(null);
  // Which field the error belongs to, so it can be announced on that input
  // rather than as a loose paragraph the user has to hunt for.
  const [errorField, setErrorField] = useState<'first' | 'email' | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [fallback, setFallback] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [intake] = useState(() => loadIntake());
  const formRef = useRef<HTMLFormElement>(null);
  const labelTimer = useRef<number | undefined>(undefined);
  const copyTimer = useRef<number | undefined>(undefined);

  useEffect(
    () => () => {
      window.clearTimeout(labelTimer.current);
      window.clearTimeout(copyTimer.current);
    },
    [],
  );

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Guard re-entry: a double-click must not send two submissions.
    if (submitting) return;

    const data = new FormData(e.currentTarget);
    const payload: JoinPayload = {
      first: String(data.get('first') ?? '').trim(),
      last: String(data.get('last') ?? '').trim(),
      email: String(data.get('email') ?? '').trim(),
      grade: String(data.get('grade') ?? '').trim(),
      needs: String(data.get('needs') ?? '').trim(),
    };

    // Validate before we celebrate: we need a name to greet you by and an email to reach you at.
    const fail = (field: 'first' | 'email', message: string) => {
      setError(message);
      setErrorField(field);
      // Move to the offending input: a screen-reader user otherwise hears a
      // generic error and has to hunt across five fields for the one to fix.
      formRef.current?.querySelector<HTMLInputElement>(`#${field}`)?.focus();
    };
    if (!payload.first) {
      fail('first', 'Please enter your first name so we know who to reach.');
      return;
    }
    if (!isValidEmail(payload.email)) {
      fail('email', 'Please enter a valid email address.');
      return;
    }
    setError(null);
    setErrorField(null);
    setFallback(null);
    setCopied(false);
    setSubmitting(true);

    const controller = new AbortController();
    const timer = window.setTimeout(() => controller.abort(), TIMEOUT_MS);

    try {
      const res = await fetch(endpoint(), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });
      if (!res.ok) throw new Error(`Request failed with ${res.status}`);

      // Celebrate only once the payload has actually been delivered.
      formRef.current?.reset();
      setLabel('Thanks');
      window.clearTimeout(labelTimer.current);
      labelTimer.current = window.setTimeout(() => setLabel('Join'), 1800);
    } catch {
      // Delivery failed. Keep every typed answer and hand the student something
      // they can actually use, rather than asking them to retype it into email.
      setLabel('Try again');
      setError("We couldn't send that just now — here's your message so nothing is lost.");
      setErrorField(null);
      setFallback(composeMessage(payload));
    } finally {
      window.clearTimeout(timer);
      setSubmitting(false);
    }
  };

  const copyFallback = async () => {
    if (!fallback) return;
    try {
      await navigator.clipboard.writeText(fallback);
      setCopied(true);
      window.clearTimeout(copyTimer.current);
      copyTimer.current = window.setTimeout(() => setCopied(false), 1800);
    } catch {
      // Clipboard blocked (insecure context, or permission denied): the text is
      // already on screen and selectable, so there is nothing further to do.
      setCopied(false);
    }
  };

  const contact = contactEmail();
  // The intake already asked for grade; don't make the student answer twice.
  const knownGrade = typeof intake?.plan.grade === 'string' ? intake.plan.grade : '';

  return (
    <main className="interior">
      <div className="rule" />
      <Crumbs crumbs={navCrumbs('join')} />
      <div className="rule rule--mb" />

      <div className="join__wrap">
        <form className="join__card" onSubmit={onSubmit} noValidate ref={formRef}>
          <div className="join__row3">
            <div className="field">
              <label htmlFor="first">
                First name <span className="field__req">(required)</span>
              </label>
              <input
                id="first"
                type="text"
                name="first"
                autoComplete="given-name"
                required
                aria-required="true"
                aria-invalid={errorField === 'first' || undefined}
                aria-describedby={errorField === 'first' ? 'join-error' : undefined}
              />
            </div>
            <div className="vrule" />
            <div className="field">
              <label htmlFor="last">Last name</label>
              <input id="last" type="text" name="last" autoComplete="family-name" />
            </div>
            <div className="vrule" />
            <div className="field">
              <label htmlFor="email">
                Email <span className="field__req">(required)</span>
              </label>
              <input
                id="email"
                type="email"
                name="email"
                autoComplete="email"
                required
                aria-required="true"
                aria-invalid={errorField === 'email' || undefined}
                aria-describedby={errorField === 'email' ? 'join-error' : undefined}
              />
            </div>
          </div>
          <div className="field field--mt">
            <label htmlFor="grade">Grade level</label>
            <input
              id="grade"
              type="text"
              name="grade"
              placeholder="e.g. 11th grade"
              defaultValue={knownGrade}
              autoComplete="off"
            />
          </div>
          <div className="field field--mt">
            <label htmlFor="needs">What do you need help with?</label>
            <textarea id="needs" name="needs" rows={3} />
          </div>
          {error && (
            <p className="join__error" id="join-error" role="alert" aria-live="polite">
              {error}
            </p>
          )}
          {fallback && (
            <div className="join__fallback" role="status">
              <label htmlFor="join-fallback">Copy this and send it to us:</label>
              <textarea id="join-fallback" className="join__fallback-text" readOnly rows={8} value={fallback} />
              <div className="join__fallback-actions">
                <button type="button" className="ov-back" onClick={copyFallback}>
                  {copied ? 'Copied' : 'Copy message'}
                </button>
                {contact && <a href={`mailto:${contact}?subject=${encodeURIComponent('Join request')}`}>{contact}</a>}
              </div>
            </div>
          )}
          <Circle size="join" type="submit" disabled={submitting}>
            {submitting ? 'Sending' : label}
          </Circle>
        </form>
      </div>
      {contact && (
        <div className="join__email">
          <a href={`mailto:${contact}`}>{contact}</a>
        </div>
      )}
    </main>
  );
}
