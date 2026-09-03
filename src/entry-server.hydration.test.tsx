import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderToString } from 'react-dom/server';
import { hydrateRoot } from 'react-dom/client';
import { act } from 'react';
import { StaticRouter, BrowserRouter } from 'react-router';
import App from './App';
import { computePlan } from './data/plan';
import { saveIntake } from './data/storage';
import { ALL_ROUTES } from './data/routes';

// #45: routes are prerendered in Node, where there is no localStorage. Anything
// reading storage during render would produce different markup on a returning
// student's first paint — a mismatch that makes React discard the prerendered
// tree, losing the whole point of prerendering. This hydrates the real server
// output and fails on any hydration complaint.
describe('prerendered routes hydrate cleanly', () => {
  let errors: string[];

  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    errors = [];
    vi.spyOn(console, 'error').mockImplementation((...args: unknown[]) => {
      errors.push(args.map(String).join(' '));
    });
  });
  afterEach(() => vi.restoreAllMocks());

  for (const route of ALL_ROUTES) {
    it(`hydrates ${route} with a stored plan`, async () => {
      // Simulate production faithfully: the prerender runs in Node with NO
      // storage, then a returning student's browser hydrates it WITH storage.
      // jsdom gives both sides localStorage, so without clearing here the test
      // would be vacuous — it would never reproduce the divergence.
      localStorage.clear();
      sessionStorage.clear();
      window.history.pushState({}, '', route);

      const html = renderToString(
        <StaticRouter location={route}>
          <App />
        </StaticRouter>,
      );

      saveIntake({ answers: { grade: '11th grade' }, plan: computePlan({ grade: '11th grade' }) });

      const container = document.createElement('div');
      container.innerHTML = html;
      document.body.appendChild(container);

      await act(async () => {
        hydrateRoot(
          container,
          <BrowserRouter>
            <App />
          </BrowserRouter>,
        );
      });

      const hydrationErrors = errors.filter((e) => /hydrat|did not match|server (?:HTML|rendered)/i.test(e));
      expect(hydrationErrors, hydrationErrors[0]).toHaveLength(0);
      container.remove();
    });
  }
});
