import { describe, it, expect, beforeEach } from 'vitest';
import { screen } from '@testing-library/react';
import App from './App';
import { ALL_ROUTES } from './data/routes';
import { TEAM, hasStory } from './data/team';
import { renderWithRouter } from './test/utils';

// #47: every route App declares must render its own page, so a regression on
// any one of them fails the suite.
const ROUTES: [string, RegExp][] = [
  ['/', /Admission\s*Possible/],
  ['/about', /^About us$/],
  ['/how', /^How it works$/],
  ['/offer', /^What we offer$/],
  ['/join', /^Join us$/],
  ['/privacy', /^Privacy$/],
  ['/team/jose', /My story/],
];

const NOT_FOUND = 'This page doesn’t exist.';

// Routes removed in the content revision. They must fall through to the 404,
// not quietly render a stale page.
const REMOVED = ['/pathways', '/coaching', '/router', '/plan', '/dashboard', '/list-builder', '/writing-course'];

describe('every route renders', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  for (const [route, heading] of ROUTES) {
    it(`renders ${route}`, () => {
      renderWithRouter(<App />, { route });
      expect(screen.getByRole('heading', { level: 1, name: heading })).toBeInTheDocument();
    });
  }

  for (const route of ALL_ROUTES) {
    it(`serves real content, not the 404, at prerendered route ${route}`, () => {
      renderWithRouter(<App />, { route });
      expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1);
      expect(screen.queryByRole('heading', { level: 1, name: NOT_FOUND })).not.toBeInTheDocument();
    });
  }

  for (const route of REMOVED) {
    it(`serves the 404 at the removed route ${route}`, () => {
      renderWithRouter(<App />, { route });
      expect(screen.getByRole('heading', { level: 1, name: NOT_FOUND })).toBeInTheDocument();
    });
  }

  it('renders the 404 for an unknown route', () => {
    renderWithRouter(<App />, { route: '/nope' });
    expect(screen.getByRole('heading', { level: 1, name: NOT_FOUND })).toBeInTheDocument();
  });

  // Unknown slugs, and members without approved copy, are real 404s rather
  // than a redirect or an empty profile.
  it('serves the 404 for an unknown team slug', () => {
    renderWithRouter(<App />, { route: '/team/not-a-person' });
    expect(screen.getByRole('heading', { level: 1, name: NOT_FOUND })).toBeInTheDocument();
  });

  it('serves the 404 for a team member without an approved story', () => {
    const placeholder = TEAM.find((m) => !hasStory(m))!;
    renderWithRouter(<App />, { route: `/team/${placeholder.slug}` });
    expect(screen.getByRole('heading', { level: 1, name: NOT_FOUND })).toBeInTheDocument();
  });
});
