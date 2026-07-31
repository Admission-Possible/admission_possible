import { describe, it, expect, beforeEach } from 'vitest';
import { screen } from '@testing-library/react';
import App from '../App';
import { computePlan } from '../data/plan';
import { saveIntake } from '../data/storage';
import { renderWithRouter } from '../test/utils';

describe('Dashboard', () => {
  beforeEach(() => sessionStorage.clear());

  it('redirects to the router when there is no intake', async () => {
    renderWithRouter(<App />, { route: '/dashboard' });
    expect(await screen.findByText('What grade are you in?')).toBeInTheDocument();
  });

  it('redirects to the router when the stored intake is malformed', async () => {
    sessionStorage.setItem('ap.intake', '{"plan":{}}');
    renderWithRouter(<App />, { route: '/dashboard' });
    expect(await screen.findByText('What grade are you in?')).toBeInTheDocument();
  });

  it('does not fabricate a session time on the 1:1 coaching track', () => {
    saveIntake({ answers: {}, plan: computePlan({}), trackOverride: '1:1 Coaching' });
    renderWithRouter(<App />, { route: '/dashboard' });
    expect(screen.queryByText(/Next session:/)).not.toBeInTheDocument();
    expect(screen.getByText("We'll reach out to schedule your first session")).toBeInTheDocument();
  });

  it('prompts to get matched when the track is self-paced', () => {
    saveIntake({ answers: {}, plan: computePlan({}) });
    renderWithRouter(<App />, { route: '/dashboard' });
    expect(screen.getByText('Get matched with a coach')).toBeInTheDocument();
  });

  it('labels the fabricated progress as sample data', () => {
    saveIntake({ answers: {}, plan: computePlan({}) });
    renderWithRouter(<App />, { route: '/dashboard' });
    expect(screen.getByRole('note')).toHaveTextContent(/sample/i);
  });

  it('shows only the deadlines for the recommended pathway', () => {
    saveIntake({ answers: {}, plan: computePlan({}) }); // Common App fallback
    renderWithRouter(<App />, { route: '/dashboard' });
    expect(screen.getByText('Common App (EA)')).toBeInTheDocument();
    expect(screen.queryByText('QuestBridge')).not.toBeInTheDocument();
    expect(screen.queryByText('UC Application')).not.toBeInTheDocument();
  });

  it('includes the UC deadline for a UC-pathway plan', () => {
    saveIntake({ answers: { regions: ['West'] }, plan: computePlan({ regions: ['West'] }) });
    renderWithRouter(<App />, { route: '/dashboard' });
    expect(screen.getByText('UC Application')).toBeInTheDocument();
  });
});
