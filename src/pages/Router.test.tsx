import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../App';
import { renderWithRouter } from '../test/utils';

// Answer all 7 questions, stopping just before "See my plan".
const walkToLastStep = async (user: ReturnType<typeof userEvent.setup>) => {
  const next = () => user.click(screen.getByRole('button', { name: /^next/i }));
  await user.click(screen.getByText('11th grade'));
  await next();
  await user.click(screen.getByText('Yes'));
  await next();
  await user.click(screen.getByText('Yes'));
  await next();
  await user.click(screen.getByText(/3\.8–4\.0/));
  await next();
  await user.click(screen.getByText('Highly selective'));
  await next();
  await user.click(screen.getByText('West'));
  await next();
  await user.click(screen.getByText('With a coach'));
};

describe('intake flow', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
  });
  afterEach(() => vi.restoreAllMocks());

  it('walks the 7-step router through to a computed plan', async () => {
    const user = userEvent.setup();
    renderWithRouter(<App />, { route: '/router' });

    expect(screen.getByText('What grade are you in?')).toBeInTheDocument();

    await walkToLastStep(user);
    await user.click(screen.getByRole('button', { name: /see my plan/i }));

    expect(await screen.findByText('QuestBridge + Common App')).toBeInTheDocument();
    expect(screen.getByText('1:1 Coaching')).toBeInTheDocument();
  });

  it('shows a visible error and keeps the answers when storage is blocked', async () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('storage blocked');
    });
    const user = userEvent.setup();
    renderWithRouter(<App />, { route: '/router' });

    await walkToLastStep(user);
    await user.click(screen.getByRole('button', { name: /see my plan/i }));

    expect(screen.getByRole('alert')).toHaveTextContent(/browser.*storage|private browsing/i);
    // Still on the last intake step — not bounced to a broken plan or back to question 1.
    expect(screen.getByText('On your own, or with a coach?')).toBeInTheDocument();
    expect(screen.queryByText('QuestBridge + Common App')).not.toBeInTheDocument();
  });

  it('disables the advance button until a valid option is selected', async () => {
    const user = userEvent.setup();
    renderWithRouter(<App />, { route: '/router' });

    expect(screen.getByRole('button', { name: /next/i })).toBeDisabled();

    await user.click(screen.getByText('11th grade'));

    expect(screen.getByRole('button', { name: /next/i })).toBeEnabled();
  });

  it('cancels back to home from the first step', async () => {
    const user = userEvent.setup();
    renderWithRouter(<App />, { route: '/router' });
    await user.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(await screen.findByText('Impossible becomes')).toBeInTheDocument();
  });

  // #32: pull-to-refresh and gesture-back are reflexes on mobile, and they used
  // to discard every answer given on steps 2-7.
  it('restores mid-quiz answers after a remount', async () => {
    const user = userEvent.setup();
    const { unmount } = renderWithRouter(<App />, { route: '/router' });

    await user.click(screen.getByText('11th grade'));
    await user.click(screen.getByRole('button', { name: /^next/i }));
    expect(screen.getByText('2 / 7')).toBeInTheDocument();

    // Simulate a refresh: the component remounts with no React state.
    unmount();
    renderWithRouter(<App />, { route: '/router' });

    expect(await screen.findByText('2 / 7')).toBeInTheDocument();
  });

  it('drops the draft when the intake is abandoned from step 1', async () => {
    const user = userEvent.setup();
    const { unmount } = renderWithRouter(<App />, { route: '/router' });

    await user.click(screen.getByText('11th grade'));
    await user.click(screen.getByRole('button', { name: 'Cancel' }));
    unmount();

    renderWithRouter(<App />, { route: '/router' });
    expect(await screen.findByText('1 / 7')).toBeInTheDocument();
  });

  it('clears the draft once the plan is saved', async () => {
    const user = userEvent.setup();
    renderWithRouter(<App />, { route: '/router' });
    await walkToLastStep(user);
    await user.click(screen.getByRole('button', { name: /see my plan/i }));

    expect(await screen.findByRole('heading', { name: 'Your plan' })).toBeInTheDocument();
    expect(sessionStorage.getItem('ap.intake.draft')).toBeNull();
  });
});
