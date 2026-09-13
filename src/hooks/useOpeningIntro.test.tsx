import { StrictMode } from 'react';
import { act, cleanup, fireEvent, render, renderHook, screen } from '@testing-library/react';
import { renderToString } from 'react-dom/server';
import { Link, MemoryRouter, Route, Routes } from 'react-router';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Chrome } from '../components/Chrome';
import { OPENING_DURATION_MS, useOpeningIntro } from './useOpeningIntro';

let media: MediaQueryList;
let motionChanged: () => void;
const removeMotionListener = vi.fn();

beforeEach(() => {
  vi.useFakeTimers();
  sessionStorage.clear();
  history.replaceState(null, '', '/');
  document.body.style.overflow = '';
  media = {
    matches: false,
    addEventListener: vi.fn((_event, listener) => {
      motionChanged = listener as () => void;
    }),
    removeEventListener: removeMotionListener,
  } as unknown as MediaQueryList;
  vi.spyOn(window, 'matchMedia').mockReturnValue(media);
});

afterEach(() => {
  cleanup();
  vi.useRealTimers();
  vi.restoreAllMocks();
  vi.clearAllMocks();
  sessionStorage.clear();
  history.replaceState(null, '', '/');
  document.body.style.overflow = '';
});

describe('useOpeningIntro lifecycle', () => {
  it('does not access browser APIs during server rendering', () => {
    const storage = vi.spyOn(Storage.prototype, 'getItem');
    function ServerHost() {
      const { opening } = useOpeningIntro('/');
      return <div data-opening={opening} />;
    }
    expect(renderToString(<ServerHost />)).toContain('data-opening="true"');
    expect(window.matchMedia).not.toHaveBeenCalled();
    expect(storage).not.toHaveBeenCalled();
    expect(document.body.style.overflow).toBe('');
  });

  it('plays on an initial home visit and restores the existing scroll style when completed', () => {
    document.body.style.overflow = 'auto';
    const { result } = renderHook(() => useOpeningIntro('/'));
    expect(result.current.opening).toBe(true);
    expect(document.body.style.overflow).toBe('hidden');
    act(() => vi.advanceTimersByTime(OPENING_DURATION_MS - 1));
    expect(result.current.opening).toBe(true);
    act(() => vi.runOnlyPendingTimers());
    expect(result.current.opening).toBe(false);
    expect(document.body.style.overflow).toBe('auto');
    expect(vi.getTimerCount()).toBe(0);
  });

  it('ends an interrupted intro on navigation and never replays when returning home', () => {
    const { result, rerender } = renderHook(({ path }) => useOpeningIntro(path), { initialProps: { path: '/' } });
    act(() => vi.advanceTimersByTime(500));
    rerender({ path: '/about' });
    expect(result.current.opening).toBe(false);
    expect(document.body.style.overflow).toBe('');
    expect(vi.getTimerCount()).toBe(0);
    rerender({ path: '/' });
    expect(result.current.opening).toBe(false);
  });

  it('does not start an intro when entering home through an in-app navigation', () => {
    const { result, rerender } = renderHook(({ path }) => useOpeningIntro(path), {
      initialProps: { path: '/coaching' },
    });
    expect(result.current.opening).toBe(false);
    rerender({ path: '/' });
    expect(result.current.opening).toBe(false);
    expect(document.body.style.overflow).toBe('');
    expect(window.matchMedia).not.toHaveBeenCalled();
  });

  it('allows a fresh document mount to replay without storing a completed-intro preference', () => {
    const save = vi.spyOn(Storage.prototype, 'setItem');
    const first = renderHook(() => useOpeningIntro('/'));
    act(() => first.result.current.finish());
    expect(first.result.current.opening).toBe(false);
    first.unmount();
    const second = renderHook(() => useOpeningIntro('/'));
    expect(second.result.current.opening).toBe(true);
    expect(save).not.toHaveBeenCalled();
  });

  it('skips reduced motion without locking scrolling', () => {
    Object.defineProperty(media, 'matches', { value: true });
    const { result } = renderHook(() => useOpeningIntro('/'));
    expect(document.body.style.overflow).toBe('');
    act(() => vi.advanceTimersToNextFrame());
    expect(result.current.opening).toBe(false);
    expect(media.addEventListener).not.toHaveBeenCalled();
  });

  it.each(['paused artwork', 'anchor link'])('skips an initial visit with %s', (condition) => {
    if (condition === 'paused artwork') sessionStorage.setItem('admission-art-motion-paused', 'true');
    else history.replaceState(null, '', '/#start-here');
    const { result } = renderHook(() => useOpeningIntro('/'));
    expect(document.body.style.overflow).toBe('');
    act(() => vi.advanceTimersToNextFrame());
    expect(result.current.opening).toBe(false);
  });

  it('still completes when browser storage is unavailable', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('Storage unavailable');
    });
    const { result } = renderHook(() => useOpeningIntro('/'));
    expect(result.current.opening).toBe(true);
    act(() => vi.runOnlyPendingTimers());
    expect(result.current.opening).toBe(false);
    expect(document.body.style.overflow).toBe('');
  });

  it.each(['Escape', 'Tab'])('immediately reveals the page on %s without consuming the keyboard event', (key) => {
    const { result } = renderHook(() => useOpeningIntro('/'));
    const event = new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true });
    fireEvent(document, event);
    expect(result.current.opening).toBe(false);
    expect(document.body.style.overflow).toBe('');
    expect(event.defaultPrevented).toBe(false);
    expect(vi.getTimerCount()).toBe(0);
  });

  it('stops for a new reduced-motion preference and does not resume when motion is enabled again', () => {
    const { result } = renderHook(() => useOpeningIntro('/'));
    Object.defineProperty(media, 'matches', { value: true, configurable: true });
    act(() => motionChanged());
    expect(result.current.opening).toBe(false);
    expect(document.body.style.overflow).toBe('');
    Object.defineProperty(media, 'matches', { value: false, configurable: true });
    act(() => motionChanged());
    expect(result.current.opening).toBe(false);
  });

  it('finishes before the document enters the back-forward cache', () => {
    const { result } = renderHook(() => useOpeningIntro('/'));
    fireEvent(window, new Event('pagehide'));
    expect(result.current.opening).toBe(false);
    expect(document.body.style.overflow).toBe('');
    expect(vi.getTimerCount()).toBe(0);
  });

  it('cancels deferred preference handling when unmounted before the first animation frame', () => {
    Object.defineProperty(media, 'matches', { value: true });
    const cancel = vi.spyOn(window, 'cancelAnimationFrame');
    const { unmount } = renderHook(() => useOpeningIntro('/'));
    unmount();
    expect(cancel).toHaveBeenCalledOnce();
    expect(vi.getTimerCount()).toBe(0);
    expect(document.body.style.overflow).toBe('');
  });

  it('restores scrolling and removes active listeners even during Strict Mode cleanup', () => {
    document.body.style.overflow = 'scroll';
    const removeDocument = vi.spyOn(document, 'removeEventListener');
    const removeWindow = vi.spyOn(window, 'removeEventListener');
    const { result, unmount } = renderHook(() => useOpeningIntro('/'), { wrapper: StrictMode });
    expect(result.current.opening).toBe(true);
    expect(document.body.style.overflow).toBe('hidden');
    unmount();
    expect(document.body.style.overflow).toBe('scroll');
    expect(removeDocument).toHaveBeenCalledWith('keydown', expect.any(Function));
    expect(removeWindow).toHaveBeenCalledWith('pagehide', expect.any(Function));
    expect(removeMotionListener).toHaveBeenCalledWith('change', expect.any(Function));
    expect(vi.getTimerCount()).toBe(0);
  });
});

describe('opening intro with the shared layout', () => {
  function renderChrome() {
    return render(
      <StrictMode>
        <MemoryRouter>
          <Routes>
            <Route element={<Chrome />}>
              <Route index element={<Link to="/about">Go to about</Link>} />
              <Route path="/about" element={<Link to="/">Return home</Link>} />
            </Route>
          </Routes>
        </MemoryRouter>
      </StrictMode>,
    );
  }

  it('keeps the intro playing through Strict Mode effect replay and only focuses after real navigation', () => {
    const { container } = renderChrome();
    expect(container.querySelector('.site-chrome')).toHaveAttribute('data-opening', 'playing');
    expect(document.activeElement).not.toBe(container.querySelector('#main-content'));
    // jsdom does not evaluate the no-preference CSS media query that displays this button.
    expect(container.querySelector('.opening-intro__skip')).toHaveTextContent('Skip intro');
    act(() => vi.advanceTimersByTime(500));
    expect(container.querySelector('.site-chrome')).toHaveAttribute('data-opening', 'playing');

    fireEvent.click(screen.getByRole('link', { name: 'Go to about' }));
    expect(container.querySelector('.site-chrome')).toHaveAttribute('data-opening', 'complete');
    expect(container.querySelector('#main-content')).toHaveFocus();
    expect(document.body.style.overflow).toBe('');
    fireEvent.click(screen.getByRole('link', { name: 'Return home' }));
    expect(container.querySelector('.site-chrome')).toHaveAttribute('data-opening', 'complete');
  });

  it('reveals controls on focus without leaving an intro scroll lock underneath the menu', () => {
    const { container } = renderChrome();
    const openMenu = screen.getByRole('button', { name: 'Open menu' });
    act(() => openMenu.focus());
    expect(container.querySelector('.site-chrome')).toHaveAttribute('data-opening', 'complete');
    expect(document.body.style.overflow).toBe('');
    fireEvent.click(openMenu);
    expect(document.body.style.overflow).toBe('hidden');
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(document.body.style.overflow).toBe('');
  });
});
