import { describe, it, expect } from 'vitest';
import { screen, within } from '@testing-library/react';
import App from '../App';
import { TEAM, hasStory } from '../data/team';
import { renderWithRouter } from '../test/utils';

describe('About page', () => {
  it('renders "About us" at /about', () => {
    renderWithRouter(<App />, { route: '/about' });
    expect(screen.getByRole('heading', { level: 1, name: 'About us' })).toBeInTheDocument();
  });

  it('shows every founding team member by name', () => {
    renderWithRouter(<App />, { route: '/about' });
    for (const member of TEAM) {
      expect(screen.getByText(member.fullName)).toBeInTheDocument();
    }
  });

  it('links to a story only for members who have one', () => {
    renderWithRouter(<App />, { route: '/about' });
    const nav = screen.getByRole('navigation', { name: 'Founding team links' });
    const hrefs = within(nav)
      .getAllByRole('link')
      .map((a) => a.getAttribute('href'));
    for (const member of TEAM) {
      if (hasStory(member)) expect(hrefs).toContain(`/team/${member.slug}`);
      else expect(hrefs).not.toContain(`/team/${member.slug}`);
    }
  });

  it('has no expandable founder cards or intro panels', () => {
    renderWithRouter(<App />, { route: '/about' });
    expect(screen.queryByRole('button', { name: /hey, i'm/i })).not.toBeInTheDocument();
    expect(document.querySelector('[aria-expanded]')).toBeNull();
    expect(document.body.textContent).not.toMatch(/hey, i'm/i);
  });
});
