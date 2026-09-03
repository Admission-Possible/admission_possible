import { describe, it, expect, beforeEach, vi } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../App';
import { computePlan } from '../data/plan';
import { saveIntake } from '../data/storage';
import { planToText } from '../data/planText';
import { renderWithRouter } from '../test/utils';

describe('Plan', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  // #32: this used to silently redirect to a blank question 1, which read as
  // though the student's plan had been deleted.
  it('explains the missing plan instead of silently restarting the intake', async () => {
    renderWithRouter(<App />, { route: '/plan' });
    expect(await screen.findByRole('heading', { name: "We couldn't find your plan" })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Take the intake' })).toHaveAttribute('href', '/router');
    expect(screen.queryByText('What grade are you in?')).not.toBeInTheDocument();
  });

  it('explains the missing plan when the stored intake is malformed', async () => {
    localStorage.setItem('ap.intake', '{"plan":{}}');
    renderWithRouter(<App />, { route: '/plan' });
    expect(await screen.findByRole('heading', { name: "We couldn't find your plan" })).toBeInTheDocument();
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

  // #32: the plan is stored on this device only, so it needs a way out of the tab.
  it('renders the plan as copyable text with every school on the list', () => {
    const plan = computePlan({ firstgen: 'Yes', pell: 'Yes', gpa: '3.8-4.0, lots of rigor' });
    const text = planToText(plan, 'Self-paced course');
    expect(text).toContain(plan.pathway);
    expect(text).toContain('Self-paced course');
    for (const s of [...plan.reach, ...plan.target, ...plan.likely]) {
      expect(text).toContain(s.name);
    }
  });

  it('copies the plan to the clipboard', async () => {
    const user = userEvent.setup();
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', { value: { writeText }, configurable: true });
    saveIntake({ answers: {}, plan: computePlan({}) });
    renderWithRouter(<App />, { route: '/plan' });

    await user.click(screen.getByRole('button', { name: 'Copy my plan' }));
    expect(writeText).toHaveBeenCalledTimes(1);
    expect(writeText.mock.calls[0][0]).toContain('Your pathway');
    expect(await screen.findByRole('button', { name: 'Copied' })).toBeInTheDocument();
  });

  it('offers a download of the plan', () => {
    saveIntake({ answers: {}, plan: computePlan({}) });
    renderWithRouter(<App />, { route: '/plan' });
    expect(screen.getByRole('button', { name: 'Download as text' })).toBeInTheDocument();
  });
});
