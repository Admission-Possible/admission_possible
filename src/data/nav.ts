import type { Crumb, NavItem } from '../types';

// Top-level navigation: header menu + inline-slash crumb bands.
export const NAV: NavItem[] = [
  { id: 'home', label: 'Home', path: '/' },
  { id: 'about', label: 'About us', path: '/about' },
  { id: 'how', label: 'How admissions works', path: '/how' },
  { id: 'offer', label: 'What we offer', path: '/offer' },
  { id: 'pathways', label: 'Pathways', path: '/pathways' },
  { id: 'coaching', label: 'Coaching', path: '/coaching' },
  { id: 'join', label: 'Join', path: '/join' },
];

// Shown in the menu and footer only once a plan exists. Deliberately kept out
// of NAV: NAV also drives the per-page crumb bands, which should not gain an
// entry that most visitors can't reach.
export const PLAN_NAV: NavItem = { id: 'plan', label: 'My plan', path: '/plan' };

/** Menu/footer link set: the standard nav, plus "My plan" once one exists. */
export function navLinks(hasPlan: boolean): NavItem[] {
  return hasPlan ? [...NAV, PLAN_NAV] : NAV;
}

// Build the full-nav crumb set for a top-level page, current item enlarged.
export function navCrumbs(currentId: string): Crumb[] {
  return NAV.map((n) => (n.id === currentId ? { label: n.label } : { label: n.label, to: n.path }));
}

// Single linked crumb for a top-level page (sub-page breadcrumbs) — label
// stays in sync with the menu instead of being re-hardcoded per page.
export function navCrumb(id: string): Crumb {
  const item = NAV.find((n) => n.id === id);
  if (!item) throw new Error(`Unknown nav id: ${id}`);
  return { label: item.label, to: item.path };
}
