import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { Link } from 'react-router';
import { trackEvent } from '../data/analytics';
import { EditorialHero } from '../components/EditorialHero';
import { Plus } from '../components/Plus';
import { FIRST_GEN_OPTIONS, GRADES, INTERESTS, type JoinPayload } from '../data/join';

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
    `First in family to go to college: ${p.firstGen}`,
    `Looking for help with: ${p.interests.join(', ') || '(not provided)'}`,
    '',
    'Anything else:',
    p.needs || '(not provided)',
  ].join('\n');
}

const stagger = (n: number) => ({ '--i': n }) as CSSProperties;

// Join us is the student sign-up: one form, grouped so what arrives is
// organized — who you are, where you're starting from, and what you want help
// with. It replaces the separate seven-question "Start" flow.
export default function Join() {
  const [label, setLabel] = useState('Join us');
  const [error, setError] = useState<string | null>(null);
  // Which field the error belongs to, so it can be announced on that input
  // rather than as a loose paragraph the user has to hunt for.
  const [errorField, setErrorField] = useState<'first' | 'email' | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [fallback, setFallback] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
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
    const text = (name: string) => String(data.get(name) ?? '').trim();
    const payload: JoinPayload = {
      first: text('first'),
      last: text('last'),
      email: text('email'),
      grade: text('grade'),
      firstGen: text('firstGen'),
      interests: data.getAll('interests').map(String),
      needs: text('needs'),
    };

    // Validate before we celebrate: we need a name to greet you by and an email to reach you at.
    const fail = (field: 'first' | 'email', message: string) => {
      setError(message);
      setErrorField(field);
      // Move to the offending input: a screen-reader user otherwise hears a
      // generic error and has to hunt across the form for the one to fix.
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
      trackEvent({ name: 'join_submitted' });
      formRef.current?.reset();
      setLabel('Thanks');
      window.clearTimeout(labelTimer.current);
      labelTimer.current = window.setTimeout(() => setLabel('Join us'), 1800);
    } catch {
      // Delivery failed. Keep every typed answer and hand the student something
      // they can actually use, rather than asking them to retype it into email.
      trackEvent({ name: 'join_failed' });
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

  return (
    <main className="interior join">
      <EditorialHero kicker="Let’s make admission possible" title="Join us" tone="lavender" />

      <div className="join__wrap">
        <div className="join__intro" data-reveal="group">
          <h2 style={stagger(0)}>
            Tell us where
            <br />
            you are.
          </h2>
          <p style={stagger(1)}>Tell us about yourself and what you need help with. We’ll email you back.</p>
        </div>

        <form className="join__form" onSubmit={onSubmit} noValidate ref={formRef}>
          <fieldset className="join__group" data-reveal="group">
            <span className="divider" />
            <legend className="eyebrow">01 · About you</legend>
            <div className="join__row">
              <div className="field" style={stagger(0)}>
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
              <div className="field" style={stagger(1)}>
                <label htmlFor="last">Last name</label>
                <input id="last" type="text" name="last" autoComplete="family-name" />
              </div>
            </div>
            <div className="field" style={stagger(2)}>
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
          </fieldset>

          <fieldset className="join__group" data-reveal="group">
            <span className="divider" />
            <legend className="eyebrow">02 · Where you’re starting</legend>
            <div className="field" style={stagger(0)}>
              <label htmlFor="grade">Grade level</label>
              <select id="grade" name="grade" defaultValue="">
                <option value="">Choose one</option>
                {GRADES.map((g) => (
                  <option key={g}>{g}</option>
                ))}
              </select>
            </div>
            <div className="choice-group" role="radiogroup" aria-labelledby="firstgen-label" style={stagger(1)}>
              <span id="firstgen-label" className="choice-group__label">
                First in your family to go to college?
              </span>
              <div className="choice-group__options">
                {FIRST_GEN_OPTIONS.map((option) => (
                  <label key={option} className="choice">
                    <input type="radio" name="firstGen" value={option} />
                    <span>{option}</span>
                  </label>
                ))}
              </div>
            </div>
          </fieldset>

          <fieldset className="join__group" data-reveal="group">
            <span className="divider" />
            <legend className="eyebrow">03 · What you want help with</legend>
            <div className="choice-group" style={stagger(0)}>
              <span className="choice-group__label" id="interests-label">
                Choose any that fit
              </span>
              <div className="choice-group__options" role="group" aria-labelledby="interests-label">
                {INTERESTS.map((option) => (
                  <label key={option} className="choice">
                    <input type="checkbox" name="interests" value={option} />
                    <span>{option}</span>
                  </label>
                ))}
              </div>
            </div>
            <div className="field" style={stagger(1)}>
              <label htmlFor="needs">Anything else we should know?</label>
              <textarea id="needs" name="needs" rows={4} />
            </div>
          </fieldset>

          {error && (
            <p className="join__error" id="join-error" role="alert" aria-live="polite">
              {error}
            </p>
          )}
          {fallback && (
            <div className="join__fallback" role="status">
              <label htmlFor="join-fallback">Copy this and send it to us:</label>
              <textarea id="join-fallback" className="join__fallback-text" readOnly rows={10} value={fallback} />
              <div className="join__fallback-actions">
                <button type="button" className="join__copy" onClick={copyFallback}>
                  {copied ? 'Copied' : 'Copy message'}
                </button>
                {contact && <a href={`mailto:${contact}?subject=${encodeURIComponent('Join request')}`}>{contact}</a>}
              </div>
            </div>
          )}
          <button className="join__submit" type="submit" disabled={submitting} aria-disabled={submitting}>
            <span>{submitting ? 'Sending' : label}</span>
            <Plus />
          </button>
          <p className="join__privacy">
            We only use this to write back to you. <Link to="/privacy">How we handle it</Link>.
          </p>
        </form>
      </div>
    </main>
  );
}
