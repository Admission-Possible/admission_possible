import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import App from '../App';
import { HOW_STEPS } from '../data/content';
import { renderWithRouter } from '../test/utils';

describe('How it works page', () => {
  it('is titled "How it works"', () => {
    renderWithRouter(<App />, { route: '/how' });
    expect(screen.getByRole('heading', { level: 1, name: 'How it works' })).toBeInTheDocument();
  });

  it('orders the steps route → build your list → learn & write → apply → submit', () => {
    renderWithRouter(<App />, { route: '/how' });
    const titles = screen.getAllByRole('heading', { level: 2 }).map((h) => h.textContent);
    expect(titles).toEqual(['Route', 'Build your list', 'Learn & write', 'Apply', 'Submit']);
    expect(HOW_STEPS.map((s) => s.title)).toEqual(titles);
  });

  it('numbers the steps in an ordered list', () => {
    renderWithRouter(<App />, { route: '/how' });
    const list = document.querySelector('ol.how-steps')!;
    expect(list.querySelectorAll(':scope > li')).toHaveLength(5);
  });

  it('shows every approved point for each step', () => {
    renderWithRouter(<App />, { route: '/how' });
    for (const step of HOW_STEPS) {
      for (const point of step.points) {
        expect(screen.getByText(point)).toBeInTheDocument();
      }
    }
    expect(screen.getByText(/QuestBridge, UC, Common App, etc\./)).toBeInTheDocument();
  });
});
