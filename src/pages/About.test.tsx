import { describe, it, expect, vi } from 'vitest';
import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../App';
import { renderWithRouter } from '../test/utils';

describe('About page', () => {
  it('renders the who-we-are intro at /about', () => {
    renderWithRouter(<App />, { route: '/about' });
    expect(screen.getByRole('heading', { level: 1, name: /who we are/i })).toBeInTheDocument();
  });

  it('expands a founder intro when their card is clicked', async () => {
    const user = userEvent.setup();
    renderWithRouter(<App />, { route: '/about' });

    const joseCard = screen.getByRole('button', { name: /hey, i'm jose/i });
    expect(joseCard).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByText(/translator in my family/)).not.toBeInTheDocument();

    await user.click(joseCard);
    expect(joseCard).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByText(/translator in my family/)).toBeInTheDocument();

    // Selecting another founder swaps the intro.
    await user.click(screen.getByRole('button', { name: /hey, i'm haolin/i }));
    expect(screen.queryByText(/translator in my family/)).not.toBeInTheDocument();
    expect(screen.getByText(/overcrowded classrooms/)).toBeInTheDocument();
  });

  it('links the expanded intro to the full story page', async () => {
    const user = userEvent.setup();
    renderWithRouter(<App />, { route: '/about' });
    await user.click(screen.getByRole('button', { name: /hey, i'm rehan/i }));
    expect(screen.getByRole('link', { name: /full story/i })).toHaveAttribute('href', '/team/rehan');
  });

  it('shows the selected founder roles in the expanded intro', async () => {
    const user = userEvent.setup();
    renderWithRouter(<App />, { route: '/about' });
    await user.click(screen.getByRole('button', { name: /hey, i'm rehan/i }));
    const panel = screen.getByRole('region', { name: /about rehan/i });
    expect(within(panel).getByText('Technical')).toBeInTheDocument();
    expect(within(panel).getByText('Counseling')).toBeInTheDocument();
    expect(within(panel).queryByText('Marketing')).not.toBeInTheDocument();
  });

  it('sets aria-controls only on the selected card, and only when its panel exists', async () => {
    const user = userEvent.setup();
    renderWithRouter(<App />, { route: '/about' });

    // Collapsed: no card references a panel id, so no dangling aria-controls.
    const cards = screen.getAllByRole('button', { name: /hey, i'm/i });
    expect(cards).toHaveLength(4);
    for (const card of cards) {
      expect(card).not.toHaveAttribute('aria-controls');
    }

    const jose = screen.getByRole('button', { name: /hey, i'm jose/i });
    await user.click(jose);

    // The selected card points at a panel that is really in the document.
    expect(jose).toHaveAttribute('aria-controls', 'about-member-panel');
    expect(document.getElementById('about-member-panel')).toBeInTheDocument();
    // Focus stays on the toggling button (disclosure pattern — not stolen by the panel).
    expect(jose).toHaveFocus();
    // The other cards don't claim to control Jose's panel.
    for (const card of cards.filter((c) => c !== jose)) {
      expect(card).not.toHaveAttribute('aria-controls');
    }
  });

  it('brings the intro panel into view when a card is selected', async () => {
    // jsdom has no scrollIntoView; install one so we can observe the call.
    const proto = window.HTMLElement.prototype as { scrollIntoView?: (opts?: ScrollIntoViewOptions) => void };
    const spy = vi.fn();
    proto.scrollIntoView = spy;
    try {
      const user = userEvent.setup();
      renderWithRouter(<App />, { route: '/about' });
      await user.click(screen.getByRole('button', { name: /hey, i'm jose/i }));
      // The matchMedia stub reports reduced motion, so the scroll must be instant.
      expect(spy).toHaveBeenCalledWith(expect.objectContaining({ behavior: 'auto' }));
    } finally {
      delete proto.scrollIntoView;
    }
  });
});
