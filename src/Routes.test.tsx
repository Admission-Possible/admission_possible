import { describe, it, expect, beforeEach } from 'vitest';
import { screen } from '@testing-library/react';
import App from './App';
import { computePlan } from './data/plan';
import { saveIntake } from './data/storage';
import { renderWithRouter } from './test/utils';

// #47: App.tsx defines 14 routes and only 4 were rendered by any test —
// Offer, WritingCourse, ListBuilder, Coaching and TeamMember appeared in none,
// so a regression on five pages would have shipped with a green suite.
const ROUTES: [string, RegExp][] = [
  ['/', /Impossible becomes/],
  ['/about', /who we are/i],
  ['/how', /How admissions works/],
  ['/offer', /What we offer/],
  ['/writing-course', /Show me you can write/],
  ['/list-builder', /A list built on fit/],
  ['/pathways', /Application pathways/],
  ['/coaching', /A coach who was a first-gen applicant/],
  ['/join', /^Join$/],
  ['/router', /Your 2-minute intake/],
  ['/privacy', /^Privacy$/],
  ['/team/jose', /My story/],
  ['/team/haolin', /Haolin Feng/],
];

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

  // These two need an intake or they render the missing-plan interstitial.
  for (const route of ['/plan', '/dashboard']) {
    it(`renders ${route} with a stored plan`, () => {
      saveIntake({ answers: {}, plan: computePlan({}) });
      renderWithRouter(<App />, { route });
      expect(screen.queryByRole('heading', { name: /couldn't find your plan/i })).not.toBeInTheDocument();
    });
  }

  it('renders the 404 for an unknown route', () => {
    renderWithRouter(<App />, { route: '/nope' });
    expect(screen.getByText("This page didn't make the cut.")).toBeInTheDocument();
  });

  // TeamMember's only branch: an unknown slug redirects home.
  it('redirects an unknown team slug to the home page', () => {
    renderWithRouter(<App />, { route: '/team/not-a-person' });
    expect(screen.getByRole('heading', { level: 1, name: /Impossible becomes/ })).toBeInTheDocument();
  });
});
