import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import App from '../App';
import { ALL_ROUTES } from '../data/routes';
import { renderWithRouter } from '../test/utils';

// #42: markup-semantics sweep (WCAG 1.3.1, 2.4.6).
describe('heading hierarchy', () => {
  for (const route of [...ALL_ROUTES, '/does-not-exist']) {
    it(`gives ${route} exactly one h1`, () => {
      renderWithRouter(<App />, { route });
      expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1);
    });
  }

  for (const route of ALL_ROUTES) {
    it(`never skips from h1 straight to h3 on ${route}`, () => {
      renderWithRouter(<App />, { route });
      const levels = [...document.querySelectorAll('main h1, main h2, main h3, main h4')].map((h) =>
        Number(h.tagName[1]),
      );
      for (let n = 1; n < levels.length; n++) {
        expect(levels[n] - levels[n - 1], `${route}: h${levels[n - 1]} → h${levels[n]}`).toBeLessThanOrEqual(1);
      }
    });
  }
});

describe('landmarks', () => {
  it('exposes the header link row as a labelled nav', () => {
    renderWithRouter(<App />, { route: '/' });
    expect(screen.getByRole('navigation', { name: 'Main' })).toBeInTheDocument();
  });

  it('exposes the footer link column as a labelled nav', () => {
    renderWithRouter(<App />, { route: '/' });
    expect(screen.getByRole('navigation', { name: 'Footer' })).toBeInTheDocument();
  });

  it('exposes the founding team links as a labelled nav', () => {
    renderWithRouter(<App />, { route: '/about' });
    expect(screen.getByRole('navigation', { name: 'Founding team links' })).toBeInTheDocument();
  });

  it('renders one main landmark per page', () => {
    for (const route of ALL_ROUTES) {
      const { unmount } = renderWithRouter(<App />, { route });
      expect(screen.getAllByRole('main'), route).toHaveLength(1);
      unmount();
    }
  });
});
