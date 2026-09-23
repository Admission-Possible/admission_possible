import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import App from './App';
import { renderWithRouter } from './test/utils';

describe('App routing', () => {
  it('renders Home at /', () => {
    renderWithRouter(<App />, { route: '/' });
    expect(screen.getByRole('heading', { level: 1, name: /Admission\s*Possible/ })).toBeInTheDocument();
  });

  it('renders How it works at /how', () => {
    renderWithRouter(<App />, { route: '/how' });
    expect(screen.getByRole('heading', { level: 1, name: 'How it works' })).toBeInTheDocument();
  });

  it('renders the Join us form at /join', () => {
    renderWithRouter(<App />, { route: '/join' });
    expect(screen.getByLabelText(/^first name/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Join us' })).toBeInTheDocument();
  });

  it('renders the NotFound page for unknown routes', () => {
    renderWithRouter(<App />, { route: '/does-not-exist' });
    expect(screen.getByRole('heading', { level: 1, name: 'This page doesn’t exist.' })).toBeInTheDocument();
  });
});
