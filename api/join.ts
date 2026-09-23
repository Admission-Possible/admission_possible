// Same-origin Join endpoint (Vercel Function, Node.js runtime).
//
// Why this exists: the deployed site had no backend, so Join fell back to a
// `mailto:` link. That silently lost submissions for students on school-managed
// Chromebooks with no configured mail client, and pointed at a domain the
// project does not own. This endpoint is same-origin, so the existing
// `connect-src 'self'` CSP in vercel.json covers it unchanged.
//
// Signature: the `fetch` Web Standard export, which is what Vercel's Node.js
// runtime expects for files in /api on a non-framework project.
// See https://vercel.com/docs/functions/runtimes/node-js
//
// Configuration (Vercel project env vars):
//   RESEND_API_KEY    — required to actually deliver mail.
//   JOIN_NOTIFY_EMAIL — required; the inbox that receives submissions.
//   JOIN_FROM_EMAIL   — optional; must be on a Resend-verified domain.
//
// With the mail vars unset the endpoint returns 503 so the client shows its
// copy-and-paste fallback instead of pretending the submission was delivered.

/** Field caps: generous for humans, bounded enough to blunt abusive payloads. */
const LIMITS = { first: 100, last: 100, email: 254, grade: 60, needs: 4000 } as const;

type JoinPayload = { first: string; last: string; email: string; grade: string; needs: string };

const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

const json = (body: unknown, status: number) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
  });

/** Coerce one unknown field to a trimmed, length-capped string. */
function field(value: unknown, max: number): string {
  return typeof value === 'string' ? value.trim().slice(0, max) : '';
}

/** Keep header injection out of the reply-to and subject lines. */
const singleLine = (value: string) => value.replace(/[\r\n]+/g, ' ').trim();

export async function handleJoin(request: Request): Promise<Response> {
  if (request.method !== 'POST') return json({ error: 'Method not allowed.' }, 405);

  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return json({ error: 'Expected a JSON body.' }, 400);
  }
  if (typeof raw !== 'object' || raw === null) {
    return json({ error: 'Expected a JSON object.' }, 400);
  }

  const body = raw as Record<string, unknown>;
  const payload: JoinPayload = {
    first: field(body.first, LIMITS.first),
    last: field(body.last, LIMITS.last),
    email: field(body.email, LIMITS.email),
    grade: field(body.grade, LIMITS.grade),
    needs: field(body.needs, LIMITS.needs),
  };

  // Mirror the client-side rules so a direct POST cannot bypass them.
  if (!payload.first) return json({ error: 'A first name is required.' }, 400);
  if (!isValidEmail(payload.email)) return json({ error: 'A valid email address is required.' }, 400);

  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.JOIN_NOTIFY_EMAIL;
  // 503, not 500: the request was fine, the server just isn't wired up yet. The
  // client reads this as "show the copyable fallback", not "you did this wrong".
  if (!apiKey || !to) return json({ error: 'Submissions are not configured yet.' }, 503);

  const name = singleLine(`${payload.first} ${payload.last}`.trim());
  const text = [
    `First name: ${payload.first}`,
    `Last name: ${payload.last}`,
    `Email: ${payload.email}`,
    `Grade level: ${payload.grade}`,
    '',
    'What they need help with:',
    payload.needs || '(not provided)',
  ].join('\n');

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: process.env.JOIN_FROM_EMAIL || 'onboarding@resend.dev',
        to: [to],
        reply_to: singleLine(payload.email),
        subject: `Join request — ${name}`,
        text,
      }),
    });
    if (!res.ok) {
      // Never echo the upstream body to the browser: it can carry key hints.
      console.error('[join] delivery failed', res.status, await res.text().catch(() => ''));
      return json({ error: 'We could not deliver that just now.' }, 502);
    }
  } catch (err) {
    console.error('[join] delivery threw', err);
    return json({ error: 'We could not deliver that just now.' }, 502);
  }

  return json({ ok: true }, 200);
}

export default { fetch: handleJoin };
