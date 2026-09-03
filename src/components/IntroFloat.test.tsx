import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { IntroFloat } from './IntroFloat';

describe('IntroFloat', () => {
  beforeEach(() => sessionStorage.clear());

  // #40 / WCAG 2.2.2: ~20 tiles drift forever behind the headline, and this
  // audience is often on machines where the OS reduced-motion flag can't be set.
  it('offers a visible pause control', () => {
    render(<IntroFloat />);
    expect(screen.getByRole('button', { name: 'Pause motion' })).toBeInTheDocument();
  });

  it('stops the motion and reports its state when pressed', async () => {
    const user = userEvent.setup();
    const { container } = render(<IntroFloat />);
    const stage = container.querySelector('.intro__stage')!;
    expect(stage).not.toHaveClass('is-paused');

    const button = screen.getByRole('button', { name: 'Pause motion' });
    expect(button).toHaveAttribute('aria-pressed', 'false');
    await user.click(button);

    expect(stage).toHaveClass('is-paused');
    expect(screen.getByRole('button', { name: 'Play motion' })).toHaveAttribute('aria-pressed', 'true');
  });

  it('remembers the choice for the session', async () => {
    const user = userEvent.setup();
    const { unmount } = render(<IntroFloat />);
    await user.click(screen.getByRole('button', { name: 'Pause motion' }));
    unmount();

    render(<IntroFloat />);
    expect(screen.getByRole('button', { name: 'Play motion' })).toBeInTheDocument();
  });

  // #40: the shrink rules read --w, but an inline width overrode them, so
  // phones rendered full desktop-size tiles over the headline.
  it('sets tile size via --w so the responsive shrink rules apply', () => {
    const { container } = render(<IntroFloat />);
    const tile = container.querySelector<HTMLElement>('.itile')!;
    expect(tile.style.getPropertyValue('--w')).toMatch(/^\d+px$/);
    expect(tile.style.width).toBe('');
  });
});
