import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import App from './App';
import { renderWithRouter } from './test/utils';

describe('App routing', () => {
  it('renders Home at /', () => {
    renderWithRouter(<App />, { route: '/' });
    expect(screen.getByText('Impossible becomes')).toBeInTheDocument();
  });

  it('renders How admissions works at /how', () => {
    renderWithRouter(<App />, { route: '/how' });
    expect(screen.getByRole('heading', { level: 1, name: 'How admissions works' })).toBeInTheDocument();
  });

  it('renders the Join form at /join', () => {
    renderWithRouter(<App />, { route: '/join' });
    expect(screen.getByLabelText('First name')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Join' })).toBeInTheDocument();
  });

  it('renders the NotFound page for unknown routes', () => {
    renderWithRouter(<App />, { route: '/does-not-exist' });
    expect(screen.getByText("This page didn't make the cut.")).toBeInTheDocument();
  });
});
