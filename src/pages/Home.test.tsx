import { describe, it, expect } from 'vitest';
import { screen, within } from '@testing-library/react';
import Home from './Home';
import App from '../App';
import { APPLICATION_PATHWAYS, CORE_MESSAGE, MENTORSHIP_GOALS } from '../data/content';
import { renderWithRouter } from '../test/utils';

const main = () => document.querySelector('main.home') as HTMLElement;

describe('Home', () => {
  it('renders the hero headline "Admission Possible"', () => {
    renderWithRouter(<Home />);
    const h1 = screen.getByRole('heading', { level: 1 });
    expect(h1.textContent?.replace(/\s+/g, ' ').trim()).toBe('Admission Possible');
    expect(screen.getByText(/Impossible becomes/)).toBeInTheDocument();
  });

  it('has a single Join us conversion: "Let’s make admission possible" linking to /join', () => {
    renderWithRouter(<Home />);
    const joinLinks = within(main())
      .getAllByRole('link')
      .filter((a) => a.getAttribute('href') === '/join');
    expect(joinLinks).toHaveLength(1);
    expect(joinLinks[0]).toHaveAccessibleName(/Let’s make admission possible\. Join us/);
  });

  it('offers no legacy intake entry points or motion toggles', () => {
    renderWithRouter(<App />, { route: '/' });
    expect(screen.queryByRole('link', { name: /^start$/i })).not.toBeInTheDocument();
    expect(screen.queryByText(/pick your starting point/i)).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /pause|play/i })).not.toBeInTheDocument();
    expect(document.body.textContent).not.toMatch(/my plan/i);
  });

  it('presents the approved core message and mentorship goals', () => {
    renderWithRouter(<Home />);
    expect(screen.getByRole('heading', { level: 2, name: CORE_MESSAGE.lead })).toBeInTheDocument();
    for (const goal of MENTORSHIP_GOALS) {
      expect(screen.getByText(goal)).toBeInTheDocument();
    }
  });

  it('lists every application pathway', () => {
    renderWithRouter(<Home />);
    for (const pathway of APPLICATION_PATHWAYS) {
      expect(screen.getByText(pathway.name)).toBeInTheDocument();
    }
  });
});
