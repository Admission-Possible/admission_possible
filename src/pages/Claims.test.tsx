import { describe, it, expect, beforeEach } from 'vitest';
import App from '../App';
import { MARKETING_ROUTES } from '../data/routes';
import { renderWithRouter } from '../test/utils';

// #31: the marketing pages once claimed software that exists nowhere in src/ —
// an AI coach, in-browser exercises, calibrated peer review, progress tracking,
// and session booking. For a low-trust, first-gen audience, "is this real?" is
// a deciding question, so these assertions keep the copy honest.
const UNBACKED = [
  /AI coach/i,
  /in-browser writing exercises/i,
  /calibrated peer review/i,
  /progress \+ completion tracking/i,
  /simple session booking/i,
  // Outcome promises nobody can back.
  /guaranteed? (?:admission|acceptance)/i,
  /\d+% (?:acceptance|admit|success)/i,
];

const pageText = (route: string) => {
  const { unmount } = renderWithRouter(<App />, { route });
  const text = document.body.textContent ?? '';
  unmount();
  return text;
};

describe('marketing copy makes no unbacked product claims', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  for (const route of MARKETING_ROUTES) {
    it(`does not promise unbuilt features or outcomes on ${route}`, () => {
      const text = pageText(route);
      for (const claim of UNBACKED) {
        expect(text).not.toMatch(claim);
      }
    });
  }

  it('states one consistent pricing truth, with no sliding-scale contradiction', () => {
    expect(pageText('/')).toMatch(/always free/i);
    for (const route of MARKETING_ROUTES) {
      const text = pageText(route);
      expect(text, route).not.toMatch(/sliding[- ]scale/i);
      // No price other than the free one is quoted anywhere.
      expect(text.match(/\$\s?[1-9]/), route).toBeNull();
    }
  });

  // The product has no i18n path, so a lone Spanish garnish promised a
  // Spanish experience that does not exist.
  it('carries no decorative Spanish while the site is English-only', () => {
    for (const route of MARKETING_ROUTES) {
      const text = pageText(route);
      expect(text).not.toMatch(/Para todos/i);
      expect(text).not.toMatch(/Buenos días/i);
    }
  });

  it('makes no nonprofit or affiliation claim the project cannot back', () => {
    for (const route of MARKETING_ROUTES.filter((r) => r !== '/privacy')) {
      expect(pageText(route), route).not.toMatch(/\ba (?:registered )?nonprofit\b|501\(c\)/i);
    }
  });
});
