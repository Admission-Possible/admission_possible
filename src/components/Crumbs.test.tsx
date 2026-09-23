import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import { Crumbs } from './Crumbs';
import { navCrumbs } from '../data/nav';
import { renderWithRouter } from '../test/utils';

describe('Crumbs', () => {
  it('renders the current item as a non-link and the rest as links', () => {
    renderWithRouter(<Crumbs crumbs={navCrumbs('how')} />);

    // The current page is enlarged, not a link.
    const current = screen.getByText('How admissions works');
    expect(current.classList.contains('crumbs__current')).toBe(true);
    expect(current.closest('a')).toBeNull();

    // Another nav item is a link to its path.
    const pathways = screen.getByRole('link', { name: 'Pathways' });
    expect(pathways.getAttribute('href')).toBe('/pathways');
  });

  it('supports custom crumb entries (sub-pages)', () => {
    renderWithRouter(<Crumbs crumbs={[{ label: 'What we offer', to: '/offer' }, { label: 'The writing course' }]} />);
    expect(screen.getByRole('link', { name: 'What we offer' }).getAttribute('href')).toBe('/offer');
    expect(screen.getByText('The writing course').classList.contains('crumbs__current')).toBe(true);
  });
});
