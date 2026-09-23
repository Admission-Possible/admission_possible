import { describe, it, expect, vi, afterEach } from 'vitest';
import { act, render } from '@testing-library/react';
import { Counter } from './Counter';

let trigger: ((entries: Partial<IntersectionObserverEntry>[]) => void) | null = null;

class FakeObserver {
  constructor(cb: (entries: Partial<IntersectionObserverEntry>[]) => void) {
    trigger = cb;
  }
  observe() {}
  disconnect() {}
}

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
  trigger = null;
});

const shown = (container: HTMLElement) => container.querySelector('[aria-hidden="true"]')?.textContent;

describe('Counter', () => {
  it('renders the real value first, and always exposes it to assistive tech', () => {
    const { container } = render(<Counter prefix="$" value={6} />);
    expect(shown(container)).toBe('$6');
    expect(container.querySelector('.visually-hidden')).toHaveTextContent('$6');
  });

  it('counts up from zero to the value once scrolled into view', () => {
    vi.spyOn(window, 'matchMedia').mockImplementation(
      (q: string) => ({ matches: false, media: q }) as unknown as MediaQueryList,
    );
    vi.stubGlobal('IntersectionObserver', FakeObserver);
    const frames: FrameRequestCallback[] = [];
    vi.stubGlobal('requestAnimationFrame', (cb: FrameRequestCallback) => frames.push(cb));
    vi.stubGlobal('cancelAnimationFrame', () => {});
    vi.spyOn(performance, 'now').mockReturnValue(0);

    const { container } = render(<Counter value={6} duration={1000} />);
    act(() => trigger?.([{ isIntersecting: false }]));
    expect(shown(container)).toBe('6');

    act(() => trigger?.([{ isIntersecting: true }]));
    expect(shown(container)).toBe('0');
    act(() => frames.shift()?.(500));
    expect(Number(shown(container))).toBeGreaterThan(0);
    act(() => frames.shift()?.(1000));
    expect(shown(container)).toBe('6');
    expect(frames).toHaveLength(0);
  });

  it('does not animate under reduced motion', () => {
    vi.stubGlobal('IntersectionObserver', FakeObserver);
    const { container } = render(<Counter value={6} />);
    expect(trigger).toBeNull();
    expect(shown(container)).toBe('6');
  });
});
