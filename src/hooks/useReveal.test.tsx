import { describe, it, expect, afterEach, vi } from 'vitest';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { useReveal } from './useReveal';

// #47: setup.ts stubs matchMedia to always report reduced motion, and useReveal
// early-returns on that — so its IntersectionObserver/rAF wiring and cleanup
// never executed in any test. This overrides the stub to reach that path.
function Host() {
  useReveal();
  return <div data-reveal="" />;
}

const renderHost = () =>
  render(
    <MemoryRouter>
      <Host />
    </MemoryRouter>,
  );

afterEach(() => vi.restoreAllMocks());

function allowMotion() {
  vi.spyOn(window, 'matchMedia').mockImplementation(
    (query: string) => ({ matches: false, media: query, addEventListener() {}, removeEventListener() {} }) as never,
  );
}

describe('useReveal', () => {
  it('does nothing when the user asks for reduced motion', () => {
    // The default setup stub reports matches: true.
    const observe = vi.fn();
    vi.stubGlobal(
      'IntersectionObserver',
      class {
        observe = observe;
        unobserve = vi.fn();
        disconnect = vi.fn();
      },
    );
    renderHost();
    expect(observe).not.toHaveBeenCalled();
    vi.unstubAllGlobals();
  });

  it('observes revealable nodes and disconnects on unmount', () => {
    allowMotion();
    const disconnect = vi.fn();
    const observe = vi.fn();
    vi.stubGlobal(
      'IntersectionObserver',
      class {
        observe = observe;
        unobserve = vi.fn();
        disconnect = disconnect;
      },
    );

    const { unmount } = renderHost();
    expect(observe).toHaveBeenCalled();
    expect(document.documentElement).toHaveClass('is-animated');

    unmount();
    expect(disconnect).toHaveBeenCalled();
    vi.unstubAllGlobals();
  });

  it('removes its scroll and resize listeners on unmount', () => {
    allowMotion();
    const add = vi.spyOn(window, 'addEventListener');
    const remove = vi.spyOn(window, 'removeEventListener');

    const { unmount } = renderHost();
    expect(add.mock.calls.some(([e]) => e === 'scroll')).toBe(true);

    unmount();
    expect(remove.mock.calls.some(([e]) => e === 'scroll')).toBe(true);
    expect(remove.mock.calls.some(([e]) => e === 'resize')).toBe(true);
  });
});
