import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import App from '../App';
import { renderWithRouter } from '../test/utils';

describe('How admissions works page', () => {
  it('titles the page after the admissions process, not the product', () => {
    renderWithRouter(<App />, { route: '/how' });
    expect(screen.getByRole('heading', { level: 1, name: /how admissions works/i })).toBeInTheDocument();
  });

  it('orders the steps route → build your list → learn & write → apply → submit', () => {
    renderWithRouter(<App />, { route: '/how' });
    const titles = Array.from(document.querySelectorAll('.how__step-title')).map((el) => el.textContent);
    expect(titles).toEqual(['Route', 'Build your list', 'Learn & write', 'Apply', 'Submit']);
  });

  it('describes apply as flowing from the college list, not as our routing moment', () => {
    renderWithRouter(<App />, { route: '/how' });
    expect(screen.queryByText('We route you to QuestBridge, UC, Common App, and more.')).not.toBeInTheDocument();
    expect(screen.getByText(/your list decides the portals/i)).toBeInTheDocument();
  });

  it('explains each phase in a detail section further down the page', () => {
    renderWithRouter(<App />, { route: '/how' });
    expect(screen.getByText(/provide details about your background/i)).toBeInTheDocument();
    expect(screen.getByText(/balanced across preference and financials/i)).toBeInTheDocument();
    expect(screen.getByText(/one-on-one peer coaching/i)).toBeInTheDocument();
    expect(screen.getByText(/QuestBridge, UC, Common App, etc\./)).toBeInTheDocument();
    expect(screen.getByText(/all in one calm place/i)).toBeInTheDocument();
  });
});
