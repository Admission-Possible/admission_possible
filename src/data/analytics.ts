import { track } from '@vercel/analytics';

// Vercel Web Analytics: cookieless, collects no PII, and both the script and
// its beacons are served same-origin from /_vercel/insights/*, so the strict
// `script-src 'self'` / `connect-src 'self'` CSP already allows it with no edit.
//
// Everything goes through this module so there is exactly one place that
// decides what is measured — and so a future provider swap touches one file.

/**
 * The funnel, as events.
 *
 * Deliberately narrow: a step number and a route name, never an answer. The
 * intake holds first-gen status and Pell eligibility, and none of that belongs
 * in an analytics payload.
 */
export type FunnelEvent =
  | { name: 'intake_step'; step: number }
  | { name: 'plan_generated'; pathway: string }
  | { name: 'join_submitted' }
  | { name: 'join_failed' };

export function trackEvent(event: FunnelEvent): void {
  // In dev and under test the SDK would log rather than send; skip it entirely
  // so test output stays clean and nothing is recorded from a local run.
  if (!import.meta.env.PROD) return;
  const { name, ...properties } = event;
  try {
    track(name, properties as Record<string, string | number>);
  } catch {
    // Measurement must never break the funnel it is measuring.
  }
}
