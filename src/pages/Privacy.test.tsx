import { describe, it, expect } from 'vitest';
import { screen, within } from '@testing-library/react';
import App from '../App';
import { renderWithRouter } from '../test/utils';

// #50: the site collects PII from students as young as 9th grade. School
// counselors and districts vet for exactly this before recommending a tool.
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

  it('discloses every field the Join us form sends', () => {
    renderWithRouter(<App />, { route: '/privacy' });
    const text = document.querySelector('main')!.textContent ?? '';
    expect(text).toMatch(/Join us form/);
    for (const field of [/first name/i, /last name/i, /email address/i, /grade level/i, /first in your family/i]) {
      expect(text).toMatch(field);
    }
    expect(text).toMatch(/topics you tick/i);
    expect(text).toMatch(/anything else we should know/i);
    // Third parties are named honestly; #49 removed the last one.
    expect(text).toMatch(/nothing from anyone else's servers/i);
    // Minors are addressed explicitly.
    expect(text).toMatch(/under 18/i);
  });

  it('no longer describes the removed intake or plan', () => {
    renderWithRouter(<App />, { route: '/privacy' });
    const text = document.querySelector('main')!.textContent ?? '';
    expect(text).not.toMatch(/intake/i);
    expect(text).not.toMatch(/\bplan\b/i);
    expect(text).not.toMatch(/on your device/i);
  });

  // #51 requires whatever is added to be disclosed here.
  it('discloses the analytics and its limits', () => {
    renderWithRouter(<App />, { route: '/privacy' });
    const text = document.querySelector('main')!.textContent ?? '';
    expect(text).toMatch(/Vercel Web Analytics/i);
    expect(text).toMatch(/sets no cookies/i);
    expect(text).toMatch(/page views and whether a Join us form was sent/i);
    // The load-bearing promise: submissions are counted, their contents are not.
    expect(text).toMatch(/What you type into the form is never part of that/i);
  });
});
