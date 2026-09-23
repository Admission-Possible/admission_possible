import { describe, it, expect, beforeEach } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../App';
import { renderWithRouter } from '../test/utils';

// #52: the lock had no cleanup, so a throw while the menu was open left the
// ErrorBoundary fallback rendering on an unscrollable body.
describe('body scroll lock', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    document.body.style.overflow = '';
  });

  it('locks while the menu is open and restores when it closes', async () => {
    const user = userEvent.setup();
    renderWithRouter(<App />, { route: '/' });
    expect(document.body.style.overflow).toBe('');

    await user.click(screen.getByRole('button', { name: /menu/i }));
    expect(document.body.style.overflow).toBe('hidden');

    await user.click(screen.getByRole('button', { name: /close menu/i }));
    expect(document.body.style.overflow).toBe('');
  });

  it('restores overflow when the tree unmounts with the menu open', async () => {
    const user = userEvent.setup();
    const { unmount } = renderWithRouter(<App />, { route: '/' });

    await user.click(screen.getByRole('button', { name: /menu/i }));
    expect(document.body.style.overflow).toBe('hidden');

    unmount();
    expect(document.body.style.overflow).toBe('');
  });
});
