import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import App from '../App';
import { TEAM, getMember, hasStory } from '../data/team';
import { renderWithRouter } from '../test/utils';

// #46: three of four members shipped invented first-person life stories and
// belief statements under their real full names, beside monogram placeholders.
describe('team content integrity', () => {
  it('publishes first-person testimony only where copy exists', () => {
    for (const member of TEAM) {
      if (!hasStory(member)) {
        expect(member.bio).toBeUndefined();
        expect(member.belief).toBeUndefined();
        expect(member.path).toBeUndefined();
      }
    }
  });

  it('carries no invented schooling claims for placeholder members', () => {
    const placeholders = TEAM.filter((m) => !hasStory(m));
    expect(placeholders.length).toBeGreaterThan(0);
    for (const m of placeholders) {
      expect(JSON.stringify(m)).not.toMatch(/Berkeley|Art school|Immigrant household/i);
    }
  });

  it('serves a 404 instead of an empty profile for members without copy', () => {
    const placeholder = TEAM.find((m) => !hasStory(m))!;
    renderWithRouter(<App />, { route: `/team/${placeholder.slug}` });
    expect(screen.getByRole('heading', { level: 1, name: 'This page doesn’t exist.' })).toBeInTheDocument();
    expect(screen.queryByText(placeholder.fullName)).not.toBeInTheDocument();
  });

  it('still renders the approved profile in full', () => {
    renderWithRouter(<App />, { route: '/team/jose' });
    expect(screen.getByRole('heading', { level: 1, name: 'My story' })).toBeInTheDocument();
    expect(screen.getByText(/translator in my family/)).toBeInTheDocument();
  });
});

describe('the misspelled slug', () => {
  it('reads haolin, matching the name', () => {
    expect(getMember('haolin')?.fullName).toBe('Haolin Feng');
    expect(getMember('hoalin')).toBeUndefined();
  });

  it('points at asset paths that match the slug', () => {
    const m = getMember('haolin')!;
    expect(m.photo).toContain('haolin');
    expect(m.storyPhoto).toContain('haolin');
  });

  it('names Haolin on About, where the founding team is listed', () => {
    renderWithRouter(<App />, { route: '/about' });
    expect(screen.getByText('Haolin Feng')).toBeInTheDocument();
  });
});
