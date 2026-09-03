import { TEAM } from './team';

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
export const MARKETING_ROUTES = [
  '/',
  '/about',
  '/how',
  '/offer',
  '/writing-course',
  '/list-builder',
  '/pathways',
  '/coaching',
  '/join',
  '/privacy',
];

/** Client-state routes. Prerendered as their empty state, then hydrated. */
export const APP_ROUTES = ['/router', '/plan', '/dashboard'];

export const TEAM_ROUTES = TEAM.map((m) => `/team/${m.slug}`);

export const ALL_ROUTES = [...MARKETING_ROUTES, ...APP_ROUTES, ...TEAM_ROUTES];

/** Per-route description; falls back to the site-level one. */
export const ROUTE_DESCRIPTIONS: Record<string, string> = {
  '/': 'The college application, demystified. Where to apply, how to apply, and how to write the essays that get you in. Free, and built for the first in their family.',
  '/about': 'The founding team behind (Ad)mission Possible.',
  '/how': 'How college admissions actually works, phase by phase — from building a list to submitting.',
  '/offer': 'A self-paced path through the essays, or a coach who was a first-gen applicant two years ago. Free.',
  '/writing-course': 'Eight modules from picking a topic to the last short answer.',
  '/list-builder': 'How to build a college list balanced on fit and finances, not luck.',
  '/pathways': 'Common App, UC, QuestBridge, Coalition, ApplyTexas and CBCA — every application system side by side.',
  '/coaching': 'Get matched with a coach who was a first-gen applicant two years ago.',
  '/join': 'Tell us about yourself and we will email you back.',
  '/privacy': 'What we collect, where it goes, and how long we keep it.',
};
