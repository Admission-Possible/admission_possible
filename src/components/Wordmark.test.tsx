import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { Wordmark } from './Wordmark';

describe('Wordmark', () => {
  it('renders the logo image with accessible alt text', () => {
    const { container } = render(<Wordmark />);
    const img = container.querySelector('img.wordmark__img');
    expect(img?.getAttribute('src')).toBe('/logo.webp');
    expect(img?.getAttribute('alt')).toBe('Admission Possible');
  });

  it('applies the white modifier', () => {
    const { container } = render(<Wordmark white />);
    expect(container.querySelector('.wordmark')?.classList.contains('wordmark--white')).toBe(true);
  });
});
