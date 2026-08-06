import { describe, it, expect, beforeEach } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../App';
import { computePlan } from '../data/plan';
import { saveIntake } from '../data/storage';
import { renderWithRouter } from '../test/utils';

describe('Plan', () => {
  beforeEach(() => sessionStorage.clear());

  it('redirects to the router when there is no intake', async () => {
    renderWithRouter(<App />, { route: '/plan' });
    expect(await screen.findByText('What grade are you in?')).toBeInTheDocument();
  });

  it('redirects to the router when the stored intake is malformed', async () => {
    sessionStorage.setItem('ap.intake', '{"plan":{}}');
    renderWithRouter(<App />, { route: '/plan' });
    expect(await screen.findByText('What grade are you in?')).toBeInTheDocument();
  });

  it('renders the computed plan and toggles the track', async () => {
    const user = userEvent.setup();
    saveIntake({ answers: {}, plan: computePlan({ firstgen: 'Yes', pell: 'Yes', gpa: '3.8–4.0, lots of rigor' }) });
    renderWithRouter(<App />, { route: '/plan' });

    expect(screen.getByText('QuestBridge + Common App')).toBeInTheDocument();
    expect(screen.getByText('Self-paced course')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /switch to 1:1 coaching/i }));
    expect(screen.getByText('1:1 Coaching')).toBeInTheDocument();
  });

  it('links the starter-list hint to the List Builder', () => {
    saveIntake({ answers: {}, plan: computePlan({}) });
    renderWithRouter(<App />, { route: '/plan' });
    expect(screen.getByRole('link', { name: 'List Builder' })).toHaveAttribute('href', '/list-builder');
  });
});
