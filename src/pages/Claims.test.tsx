import { describe, it, expect, beforeEach } from 'vitest';
import { screen } from '@testing-library/react';
import App from '../App';
import { renderWithRouter } from '../test/utils';

// #31: the marketing pages claimed software that exists nowhere in src/ — an
// AI coach, in-browser exercises, calibrated peer review, progress tracking,
// and session booking. For a low-trust, first-gen audience, "is this real?" is
// a deciding question, so these assertions keep the copy honest as the product
// grows into it.
const UNBACKED = [
  /AI coach/i,
  /in-browser writing exercises/i,
  /calibrated peer review/i,
  /progress \+ completion tracking/i,
  /simple session booking/i,
];

describe('marketing copy makes no unbacked product claims', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  for (const route of ['/offer', '/writing-course', '/coaching', '/']) {
    it(`does not promise unbuilt features on ${route}`, () => {
      renderWithRouter(<App />, { route });
      const text = document.body.textContent ?? '';
      for (const claim of UNBACKED) {
        expect(text).not.toMatch(claim);
      }
    });
  }

  it('states one consistent pricing truth, with no sliding-scale contradiction', () => {
    renderWithRouter(<App />, { route: '/offer' });
    const text = document.body.textContent ?? '';
    expect(text).toMatch(/free/i);
    expect(text).not.toMatch(/sliding-scale/i);
  });

  // The product has no i18n path, so a lone Spanish garnish promised a
  // Spanish experience that does not exist.
  it('carries no decorative Spanish while the site is English-only', () => {
    for (const route of ['/', '/dashboard']) {
      renderWithRouter(<App />, { route });
      const text = document.body.textContent ?? '';
      expect(text).not.toMatch(/Para todos/i);
      expect(text).not.toMatch(/Buenos días/i);
    }
  });

  // Was /router, which dropped a student who had already finished the intake
  // back onto question 1.
  it('sends the writing-course CTA somewhere real instead of restarting the intake', () => {
    renderWithRouter(<App />, { route: '/writing-course' });
    expect(screen.getByRole('link', { name: 'Ask for a coach' })).toHaveAttribute('href', '/join');
  });
});
