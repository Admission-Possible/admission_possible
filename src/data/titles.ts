import { NAV } from './nav';
import { getMember } from './team';

const SITE = '(Ad)mission Possible';

// Routes outside NAV. NAV supplies the rest so a renamed menu item can't drift
// from its page title.
const EXTRA: Record<string, string> = {
  '/writing-course': 'The writing course',
  '/list-builder': 'College list builder',
  '/router': 'Your 2-minute intake',
  '/plan': 'Your plan',
  '/dashboard': 'Your dashboard',
  '/privacy': 'Privacy',
};

/**
 * The document title for a path.
 *
 * Every route previously shared the single marketing title from index.html, so
 * tabs, history and bookmarks were indistinguishable, no page could rank on its
 * own query, and the 404 carried the marketing title — reinforcing soft-404
 * signals. Fails WCAG 2.4.2 (Page Titled).
 */
export function titleForPath(pathname: string): string {
  if (pathname === '/') return `${SITE} — The college application, demystified`;

  const nav = NAV.find((n) => n.path === pathname);
  if (nav) return `${nav.label} — ${SITE}`;

  const extra = EXTRA[pathname];
  if (extra) return `${extra} — ${SITE}`;

  const teamMatch = /^\/team\/([^/]+)$/.exec(pathname);
  if (teamMatch) {
    const member = getMember(teamMatch[1]);
    if (member) return `${member.name} — ${SITE}`;
  }

  return `Page not found — ${SITE}`;
}
