import { TEAM, hasStory } from './team';

export const SITE_ORIGIN = 'https://admission-possible.vercel.app';

/**
 * Routes with real content to serve.
 *
 * These are prerendered to their own HTML files at build time, so a crawler (or
 * a link-preview bot, or a reader with JS disabled) gets actual text instead of
 * an empty root div. Kept beside App.tsx's <Route> list, and a test asserts the
 * two stay in step — a route missing here would 404 once the catch-all rewrite
 * is narrowed.
 */
export const MARKETING_ROUTES = ['/', '/about', '/how', '/offer', '/join', '/privacy'];

// Only members with approved copy get a page; the rest are named on About.
export const TEAM_ROUTES = TEAM.filter(hasStory).map((m) => `/team/${m.slug}`);

export const ALL_ROUTES = [...MARKETING_ROUTES, ...TEAM_ROUTES];

/** Per-route description; falls back to the site-level one. */
export const ROUTE_DESCRIPTIONS: Record<string, string> = {
  '/': 'Your future is more than a college acceptance letter. Guided mentorship, by first-gen students, for the next ones.',
  '/about': 'The founding team behind (Ad)mission Possible.',
  '/how': 'How it works: five steps from where you are to where you’re going.',
  '/offer':
    'Guided mentorship that can span months or years, helping students find their direction and carve their path.',
  '/join': 'Join us. Tell us about yourself and what you need help with, and we’ll email you back.',
  '/privacy': 'What we collect, where it goes, and how long we keep it.',
};
