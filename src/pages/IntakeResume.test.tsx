import { describe, it, expect, beforeEach } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../App';
import { computePlan } from '../data/plan';
import { loadIntake, saveIntake } from '../data/storage';
import { renderWithRouter } from '../test/utils';

// #33: the persisted answers had zero readers. Re-entering the intake always
// started blank, and finishing again overwrote the plan and the chosen track.
const ANSWERS = {
  grade: '11th grade',
  firstgen: 'Yes',
  pell: 'Yes',
  gpa: '3.8–4.0, lots of rigor',
  colleges: ['Highly selective'],
  regions: ['West'],
  track: 'Self-paced',
};

describe('re-entering the intake', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  it('starts blank on a first run', () => {
    renderWithRouter(<App />, { route: '/router' });
    expect(screen.queryByText(/you already have a plan/i)).not.toBeInTheDocument();
  });

  it('seeds the answers and says so when a plan already exists', () => {
    saveIntake({ answers: ANSWERS, plan: computePlan(ANSWERS) });
    renderWithRouter(<App />, { route: '/router' });

    expect(screen.getByText(/you already have a plan/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'go back to your plan' })).toHaveAttribute('href', '/plan');
    // Question 1's stored answer is pre-selected, so Next is available immediately.
    expect(screen.getByRole('button', { name: /^next/i })).not.toBeDisabled();
  });

  it('keeps the track the student switched to when the track answer is unchanged', async () => {
    const user = userEvent.setup();
    saveIntake({ answers: ANSWERS, plan: computePlan(ANSWERS), trackOverride: '1:1 Coaching' });
    renderWithRouter(<App />, { route: '/router' });

    // Walk straight through on the seeded answers.
    for (let i = 0; i < 6; i++) await user.click(screen.getByRole('button', { name: /^next/i }));
    await user.click(screen.getByRole('button', { name: /see my plan/i }));

    expect(await screen.findByRole('heading', { name: 'Your plan' })).toBeInTheDocument();
    expect(loadIntake()?.trackOverride).toBe('1:1 Coaching');
  });
});

describe('plan-aware CTAs', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  it('shows the real starter list on the List Builder once a plan exists', () => {
    const plan = computePlan(ANSWERS);
    saveIntake({ answers: ANSWERS, plan });
    renderWithRouter(<App />, { route: '/list-builder' });

    expect(screen.getByText('Your starter list')).toBeInTheDocument();
    expect(screen.getByText(plan.reach[0].name)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Copy my list' })).toBeInTheDocument();
  });

  it('keeps the List Builder a brochure when there is no plan', () => {
    renderWithRouter(<App />, { route: '/list-builder' });
    expect(screen.queryByText('Your starter list')).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Build my list' })).toHaveAttribute('href', '/router');
  });

  it('points Pathways at the existing plan instead of restarting the intake', () => {
    saveIntake({ answers: ANSWERS, plan: computePlan(ANSWERS) });
    renderWithRouter(<App />, { route: '/pathways' });
    expect(screen.getByRole('link', { name: 'See my pathway' })).toHaveAttribute('href', '/plan');
  });

  it('points Pathways at the intake when there is no plan', () => {
    renderWithRouter(<App />, { route: '/pathways' });
    expect(screen.getByRole('link', { name: 'See my pathway' })).toHaveAttribute('href', '/router');
  });
});
