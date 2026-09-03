import { describe, it, expect, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../App';
import { titleForPath } from '../data/titles';
import { renderWithRouter } from '../test/utils';

describe('document titles', () => {
  // #38: all 14 routes shared the one static marketing title (WCAG 2.4.2).
  it('gives every route a distinct title', () => {
    const paths = [
      '/',
      '/about',
      '/how',
      '/offer',
      '/writing-course',
      '/list-builder',
      '/pathways',
      '/coaching',
      '/join',
      '/router',
      '/plan',
      '/dashboard',
      '/privacy',
      '/team/jose',
    ];
    const titles = paths.map(titleForPath);
    expect(new Set(titles).size).toBe(paths.length);
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

describe('intake step focus', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  // #38: the focused Next button becomes disabled when the new unanswered
  // question renders, so focus silently dropped to <body> on every step.
  it('moves focus to the new question instead of losing it to the body', async () => {
    const user = userEvent.setup();
    renderWithRouter(<App />, { route: '/router' });

    await user.click(screen.getByText('11th grade'));
    await user.click(screen.getByRole('button', { name: /^next/i }));

    const question = await screen.findByRole('heading', { name: 'First in your family to go?' });
    await waitFor(() => expect(question).toHaveFocus());
    expect(document.body).not.toHaveFocus();
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
