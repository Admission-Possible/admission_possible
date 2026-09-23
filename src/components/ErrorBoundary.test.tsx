import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ErrorBoundary } from './ErrorBoundary';
import { computePlan } from '../data/plan';
import { loadIntake, saveIntake } from '../data/storage';

// #47: the boundary is only imported by main.tsx, and tests render <App />
// *below* it — so the fallback and the Start-over handler, the crash-recovery
// code that exists precisely for when things are already wrong, never ran.

function Boom(): never {
  throw new Error('render exploded');
}

describe('ErrorBoundary', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    // React logs the caught error; keep the suite output readable.
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });
  afterEach(() => vi.restoreAllMocks());

  it('leaves a healthy tree alone', () => {
    render(
      <ErrorBoundary>
        <p>all good</p>
      </ErrorBoundary>,
    );
    expect(screen.getByText('all good')).toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('shows an announced fallback instead of a blank screen', () => {
    render(
      <ErrorBoundary>
        <Boom />
      </ErrorBoundary>,
    );
    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /start over/i })).toBeInTheDocument();
  });

  it('clears a corrupt intake so a reload cannot wedge on it again', async () => {
    const user = userEvent.setup();
    saveIntake({ answers: {}, plan: computePlan({}) });
    expect(loadIntake()).not.toBeNull();

    render(
      <ErrorBoundary>
        <Boom />
      </ErrorBoundary>,
    );

    // "Start over" is an <a href="/">; let its handler run but stop jsdom from
    // attempting a real navigation (which it cannot do, and logs about).
    const swallow = (e: Event) => e.preventDefault();
    document.addEventListener('click', swallow);
    try {
      await user.click(screen.getByRole('link', { name: /start over/i }));
    } finally {
      document.removeEventListener('click', swallow);
    }

    expect(loadIntake()).toBeNull();
  });
});
