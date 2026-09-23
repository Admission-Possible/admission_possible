import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ErrorBoundary } from './ErrorBoundary';

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

  it('sends "Start over" to the home page and leaves browser storage alone', async () => {
    const user = userEvent.setup();
    localStorage.setItem('unrelated', 'kept');
    render(
      <ErrorBoundary>
        <Boom />
      </ErrorBoundary>,
    );

    const link = screen.getByRole('link', { name: /start over/i });
    expect(link).toHaveAttribute('href', '/');

    // "Start over" is an <a href="/">; stop jsdom from attempting a real
    // navigation (which it cannot do, and logs about).
    const swallow = (e: Event) => e.preventDefault();
    document.addEventListener('click', swallow);
    try {
      await user.click(link);
    } finally {
      document.removeEventListener('click', swallow);
    }

    // The site keeps no state in storage, so recovery has nothing to clear.
    expect(localStorage.getItem('unrelated')).toBe('kept');
  });
});
