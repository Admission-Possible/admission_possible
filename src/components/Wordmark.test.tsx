import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { Wordmark } from './Wordmark';

describe('Wordmark', () => {
  it('renders the supplied logo with an accessible brand name', () => {
    const { container } = render(<Wordmark />);
    const mark = container.querySelector('.wordmark');
    expect(mark).toHaveAttribute('role', 'img');
    expect(mark).toHaveAttribute('aria-label', 'Admission Possible');
  });

  it('applies the white modifier', () => {
    const { container } = render(<Wordmark white />);
    expect(container.querySelector('.wordmark')?.classList.contains('wordmark--white')).toBe(true);
  });
});
