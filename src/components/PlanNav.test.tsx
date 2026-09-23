import { describe, it, expect, beforeEach } from 'vitest';
import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../App';
import { computePlan } from '../data/plan';
import { saveIntake } from '../data/storage';
import { renderWithRouter } from '../test/utils';

// #32: the plan was unreachable from any navigation — a student who tapped
// Home after seeing it had no UI route back short of retyping the URL.
describe('"My plan" navigation', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  it('is absent from the footer before an intake exists', () => {
    renderWithRouter(<App />, { route: '/' });
    expect(screen.queryByRole('link', { name: 'My plan' })).not.toBeInTheDocument();
  });

  it('appears in the footer once a plan exists', () => {
    saveIntake({ answers: {}, plan: computePlan({}) });
    renderWithRouter(<App />, { route: '/' });
    expect(screen.getByRole('link', { name: 'My plan' })).toHaveAttribute('href', '/plan');
  });

  it('appears in the overlay menu once a plan exists', async () => {
    const user = userEvent.setup();
    saveIntake({ answers: {}, plan: computePlan({}) });
    renderWithRouter(<App />, { route: '/' });

    await user.click(screen.getByRole('button', { name: /menu/i }));
    const dialog = screen.getByRole('dialog');
    expect(within(dialog).getByRole('link', { name: 'My plan' })).toHaveAttribute('href', '/plan');
  });
});
