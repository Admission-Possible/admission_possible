import { describe, it, expect } from 'vitest';
import { screen, within } from '@testing-library/react';
import App from '../App';
import { PATHWAYS } from '../data/pathways';
import { renderWithRouter } from '../test/utils';

// #42: markup-semantics sweep (WCAG 1.3.1, 2.4.6).
describe('Pathways comparison', () => {
  it('is a real table with named column headers', () => {
    renderWithRouter(<App />, { route: '/pathways' });
    const table = screen.getByRole('table');
    for (const header of ['Pathway', 'Best for', 'Key fact', 'Money']) {
      expect(within(table).getByRole('columnheader', { name: header })).toBeInTheDocument();
    }
  });

  it('exposes one row per pathway, keyed by a row header', () => {
    renderWithRouter(<App />, { route: '/pathways' });
    const table = screen.getByRole('table');
    for (const row of PATHWAYS) {
      expect(within(table).getByRole('rowheader', { name: row.name })).toBeInTheDocument();
    }
  });

  it('keeps non-cost facts out of the money column', () => {
    // These were sitting under "Money" while describing essays and supplements.
    const money = PATHWAYS.map((p) => p.money);
    expect(money).not.toContain('No separate supplements');
    expect(money).not.toContain('Its own essays');
  });

  it('carries a per-cell label for the stacked mobile view', () => {
    renderWithRouter(<App />, { route: '/pathways' });
    const cells = screen.getByRole('table').querySelectorAll('td');
    expect(cells.length).toBeGreaterThan(0);
    for (const cell of cells) expect(cell).toHaveAttribute('data-label');
  });
});

describe('heading hierarchy', () => {
  // Offer started at h3; Router had only the h2 question.
  for (const route of ['/', '/about', '/how', '/offer', '/pathways', '/coaching', '/join', '/router', '/privacy']) {
    it(`gives ${route} exactly one h1`, () => {
      renderWithRouter(<App />, { route });
      expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1);
    });
  }
});

describe('landmarks', () => {
  it('exposes the crumb band as a labelled nav', () => {
    renderWithRouter(<App />, { route: '/pathways' });
    expect(screen.getByRole('navigation', { name: 'Breadcrumb' })).toBeInTheDocument();
  });

  it('exposes the footer link column as a labelled nav', () => {
    renderWithRouter(<App />, { route: '/' });
    expect(screen.getByRole('navigation', { name: 'Footer' })).toBeInTheDocument();
  });

  it('marks the current crumb', () => {
    renderWithRouter(<App />, { route: '/pathways' });
    const nav = screen.getByRole('navigation', { name: 'Breadcrumb' });
    expect(within(nav).getByText('Pathways')).toHaveAttribute('aria-current', 'page');
  });
});
