import { describe, it, expect } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../App';
import { ALL_ROUTES } from '../data/routes';
import { titleForPath } from '../data/titles';
import { renderWithRouter } from '../test/utils';

describe('document titles', () => {
  // #38: every route shared the one static marketing title (WCAG 2.4.2).
  it('gives every route a distinct title', () => {
    const paths = [...ALL_ROUTES, '/does-not-exist'];
    const titles = paths.map(titleForPath);
    expect(new Set(titles).size).toBe(paths.length);
  });

  it('titles the pages after their navigation labels', () => {
    expect(titleForPath('/about')).toMatch(/^About us —/);
    expect(titleForPath('/how')).toMatch(/^How it works —/);
    expect(titleForPath('/offer')).toMatch(/^What we offer —/);
    expect(titleForPath('/join')).toMatch(/^Join us —/);
    expect(titleForPath('/privacy')).toMatch(/^Privacy —/);
  });

  it('treats removed routes as not found', () => {
    for (const path of [
      '/pathways',
      '/coaching',
      '/router',
      '/plan',
      '/dashboard',
      '/list-builder',
      '/writing-course',
    ]) {
      expect(titleForPath(path), path).toMatch(/page not found/i);
    }
  });

  it('gives the 404 its own title rather than the marketing one', () => {
    expect(titleForPath('/does-not-exist')).toMatch(/page not found/i);
    expect(titleForPath('/team/nobody')).toMatch(/page not found/i);
  });

  it('sets document.title on navigation', async () => {
    const user = userEvent.setup();
    renderWithRouter(<App />, { route: '/' });
    await waitFor(() => expect(document.title).toBe(titleForPath('/')));

    await user.click(screen.getByRole('contentinfo').querySelector('a[href="/about"]')!);
    await waitFor(() => expect(document.title).toBe(titleForPath('/about')));
  });
});

describe('route change focus', () => {
  // #38: activating a nav link gave a screen-reader user no signal at all.
  it('moves focus into the main content on navigation', async () => {
    const user = userEvent.setup();
    renderWithRouter(<App />, { route: '/' });
    const main = document.getElementById('main-content')!;
    expect(main).not.toHaveFocus();

    await user.click(screen.getByRole('contentinfo').querySelector('a[href="/about"]')!);
    await waitFor(() => expect(main).toHaveFocus());
  });
});

describe('menu focus containment', () => {
  // #41: the trap was bound to the dialog, so clicking a dead overlay area
  // moved focus to <body> and Tab then walked into the obscured page.
  it('marks the page behind the open menu inert', async () => {
    const user = userEvent.setup();
    renderWithRouter(<App />, { route: '/' });

    const behind = document.getElementById('main-content')!.parentElement!;
    expect(behind).not.toHaveAttribute('inert');

    await user.click(screen.getByRole('button', { name: /menu/i }));
    expect(behind).toHaveAttribute('inert');
  });

  it('pulls Tab back into the dialog when focus has escaped to the body', async () => {
    const user = userEvent.setup();
    renderWithRouter(<App />, { route: '/' });
    await user.click(screen.getByRole('button', { name: /menu/i }));

    // Reproduce the reported state: a click on a dead overlay area.
    (document.activeElement as HTMLElement | null)?.blur();
    expect(document.body).toHaveFocus();

    await user.tab();
    const dialog = screen.getByRole('dialog');
    expect(dialog.contains(document.activeElement)).toBe(true);
  });
});
