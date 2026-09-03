import { describe, it, expect, beforeEach } from 'vitest';
import { screen } from '@testing-library/react';
import App from '../App';
import { computePlan } from '../data/plan';
import { saveIntake } from '../data/storage';
import { renderWithRouter } from '../test/utils';

describe('Dashboard', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  // #32: this used to silently redirect to a blank question 1, which read as
  // though the student's plan had been deleted.
  it('explains the missing plan instead of silently restarting the intake', async () => {
    renderWithRouter(<App />, { route: '/dashboard' });
    expect(await screen.findByRole('heading', { name: "We couldn't find your plan" })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Take the intake' })).toHaveAttribute('href', '/router');
    expect(screen.queryByText('What grade are you in?')).not.toBeInTheDocument();
  });

  it('explains the missing plan when the stored intake is malformed', async () => {
    localStorage.setItem('ap.intake', '{"plan":{}}');
    renderWithRouter(<App />, { route: '/dashboard' });
    expect(await screen.findByRole('heading', { name: "We couldn't find your plan" })).toBeInTheDocument();
  });

  it('links to the contact form instead of promising outreach on the 1:1 coaching track', () => {
    saveIntake({ answers: {}, plan: computePlan({}), trackOverride: '1:1 Coaching' });
    renderWithRouter(<App />, { route: '/dashboard' });
    expect(screen.queryByText(/Next session:/)).not.toBeInTheDocument();
    expect(screen.queryByText(/We'll reach out/)).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: /schedule your first session/i })).toHaveAttribute('href', '/join');
  });

  it('links to the contact form to get matched when the track is self-paced', () => {
    saveIntake({ answers: {}, plan: computePlan({}) });
    renderWithRouter(<App />, { route: '/dashboard' });
    expect(screen.getByRole('link', { name: 'Get matched with a coach' })).toHaveAttribute('href', '/join');
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
