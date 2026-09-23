import { describe, it, expect, vi, afterEach } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { StepRail } from './StepRail';
import { HOW_STEPS } from '../data/content';
import { renderWithRouter } from '../test/utils';

const motion = (reduce: boolean) =>
  vi
    .spyOn(window, 'matchMedia')
    .mockImplementation((query: string) => ({ matches: reduce, media: query }) as unknown as MediaQueryList);

afterEach(() => vi.restoreAllMocks());

describe('StepRail', () => {
  it('shows every How it works step, in order, linking to /how', () => {
    renderWithRouter(<StepRail />);
    const titles = [...document.querySelectorAll('.step-card__title')].map((n) => n.textContent);
    expect(titles).toEqual(HOW_STEPS.map((s) => s.title));
    for (const link of document.querySelectorAll('.step-card__link')) expect(link).toHaveAttribute('href', '/how');
  });

  it('moves the rail one card at a time, smoothly unless reduced motion is on', async () => {
    const user = userEvent.setup();
    renderWithRouter(<StepRail />);
    const list = document.querySelector('.step-rail__list') as HTMLElement;
    const scrollBy = vi.fn();
    list.scrollBy = scrollBy as unknown as typeof list.scrollBy;

    motion(false);
    await user.click(screen.getByRole('button', { name: 'Next steps' }));
    expect(scrollBy).toHaveBeenLastCalledWith({ left: 16, behavior: 'smooth' });

    motion(true);
    await user.click(screen.getByRole('button', { name: 'Previous steps' }));
    expect(scrollBy).toHaveBeenLastCalledWith({ left: -16, behavior: 'instant' });
  });
});
