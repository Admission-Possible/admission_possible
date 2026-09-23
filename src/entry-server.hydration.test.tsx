import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderToString } from 'react-dom/server';
import { hydrateRoot } from 'react-dom/client';
import { act } from 'react';
import { StaticRouter, BrowserRouter } from 'react-router';
import App from './App';
import { ALL_ROUTES } from './data/routes';

// #45: routes are prerendered in Node and hydrated in the browser. Any render
// that differs between the two (browser-only state, storage, dates) makes React
// discard the prerendered tree. This hydrates the real server output and fails
// on any hydration complaint.
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
    it(`hydrates ${route} without a mismatch`, async () => {
      window.history.pushState({}, '', route);

      const html = renderToString(
        <StaticRouter location={route}>
          <App />
        </StaticRouter>,
      );

      const container = document.createElement('div');
      container.innerHTML = html;
      // Browsers initialize playback muting from parsed muted markup; jsdom
      // leaves this media property false. Model that browser initialization
      // without changing the server attributes or suppressing hydration errors.
      container.querySelectorAll('video').forEach((video) => {
        video.muted = video.defaultMuted;
      });
      document.body.appendChild(container);

      // Nothing on the site reads browser storage any more; a render that did
      // would be the likeliest source of a server/client divergence.
      const getItem = vi.spyOn(Storage.prototype, 'getItem');

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
      expect(getItem).not.toHaveBeenCalled();
      container.remove();
    });
  }
});
