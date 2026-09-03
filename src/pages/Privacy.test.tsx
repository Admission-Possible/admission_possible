import { describe, it, expect } from 'vitest';
import { screen, within } from '@testing-library/react';
import App from '../App';
import { renderWithRouter } from '../test/utils';

// #50: the site collects PII from students as young as 9th grade, and shipped
// no privacy disclosure at all. School counselors and districts vet for exactly
// this before recommending a tool.
describe('Privacy', () => {
  it('renders at /privacy', () => {
    renderWithRouter(<App />, { route: '/privacy' });
    expect(screen.getByRole('heading', { level: 1, name: 'Privacy' })).toBeInTheDocument();
  });

  it('is reachable from the footer on every page', () => {
    renderWithRouter(<App />, { route: '/' });
    const footer = screen.getByRole('contentinfo');
    expect(within(footer).getByRole('link', { name: 'Privacy' })).toHaveAttribute('href', '/privacy');
  });

  // The project is not incorporated; the claim appeared on every page.
  it('makes no unsubstantiated nonprofit claim', () => {
    renderWithRouter(<App />, { route: '/' });
    expect(screen.getByRole('contentinfo').textContent).not.toMatch(/a nonprofit/i);
  });

  it('discloses the data the code actually handles', () => {
    renderWithRouter(<App />, { route: '/privacy' });
    const text = document.body.textContent ?? '';
    // Join fields that reach the operator.
    expect(text).toMatch(/grade level/i);
    // Intake stays on-device — the single most load-bearing claim on the page.
    expect(text).toMatch(/on your device/i);
    // Third parties are named honestly; #49 removed the last one.
    expect(text).toMatch(/nothing from anyone else's servers/i);
    // Minors are addressed explicitly.
    expect(text).toMatch(/under 18/i);
  });
});
