import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { Icon } from './Icon';

describe('Icon', () => {
  it('renders an SVG icon for a vector name', () => {
    const { container } = render(<Icon name="bookmark" />);
    const wrapper = container.querySelector('.icon');
    expect(wrapper).not.toBeNull();
    expect(wrapper?.querySelector('svg')).not.toBeNull();
  });

  it('renders the writing symbol as a decorative vector', () => {
    const { container } = render(<Icon name="write" />);
    expect(container.querySelector('svg')).not.toBeNull();
    expect(container.querySelector('.icon')).toHaveAttribute('aria-hidden', 'true');
    expect(container.querySelector('img')).toBeNull();
  });

  it('passes the wrapper className through', () => {
    const { container } = render(<Icon name="calendar" className="row-icon" />);
    expect(container.querySelector('.icon')?.classList.contains('row-icon')).toBe(true);
  });
});
