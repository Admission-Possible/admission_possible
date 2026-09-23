import { act, cleanup, fireEvent, render } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { COLLEGE_IMAGES, windowImages } from '../data/colleges';

type ArtComponent = typeof import('./AdmissionArt').AdmissionArt;
let AdmissionArt: ArtComponent;
let observerCallback: IntersectionObserverCallback;
let mediaChanged: () => void;
let mediaQuery: MediaQueryList;
const disconnect = vi.fn();
const observe = vi.fn();
const removeMediaListener = vi.fn();

beforeEach(async () => {
  vi.resetModules();
  // Keep playback pending until a test fires the browser's playing event.
  vi.spyOn(HTMLMediaElement.prototype, 'play').mockImplementation(() => new Promise<void>(() => {}));
  vi.spyOn(HTMLMediaElement.prototype, 'pause').mockImplementation(() => {});
  vi.spyOn(HTMLMediaElement.prototype, 'load').mockImplementation(() => {});
  vi.spyOn(document, 'hidden', 'get').mockReturnValue(false);
  mediaQuery = {
    matches: false,
    addEventListener: vi.fn((_event, listener) => {
      mediaChanged = listener as () => void;
    }),
    removeEventListener: removeMediaListener,
  } as unknown as MediaQueryList;
  vi.spyOn(window, 'matchMedia').mockReturnValue(mediaQuery);
  vi.stubGlobal(
    'IntersectionObserver',
    class {
      constructor(callback: IntersectionObserverCallback) {
        observerCallback = callback;
      }
      observe = observe;
      disconnect = disconnect;
    },
  );
  ({ AdmissionArt } = await import('./AdmissionArt'));
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  vi.clearAllMocks();
});

function setIntersecting(value: boolean) {
  act(() => observerCallback([{ isIntersecting: value } as IntersectionObserverEntry], {} as IntersectionObserver));
}

function expectEveryVideoPaused(container: HTMLElement) {
  const pausedVideos = vi.mocked(HTMLMediaElement.prototype.pause).mock.contexts;
  container.querySelectorAll('video').forEach((video) => expect(pausedVideos).toContain(video));
}

describe('AdmissionArt motion lifecycle', () => {
  it('only downloads films when visible and pauses playback after leaving the viewport', () => {
    const { container } = render(<AdmissionArt />);
    const art = container.querySelector('.admission-art');
    expect(art).toHaveAttribute('data-visible', 'false');
    container.querySelectorAll('video').forEach((video) => expect(video).not.toHaveAttribute('src'));
    expect(HTMLMediaElement.prototype.play).not.toHaveBeenCalled();
    expect(HTMLMediaElement.prototype.load).not.toHaveBeenCalled();
    expect(observe).toHaveBeenCalledWith(art);
    setIntersecting(true);
    expect(art).toHaveAttribute('data-visible', 'true');
    container.querySelectorAll('video').forEach((video) => expect(video).toHaveAttribute('src'));
    expect(HTMLMediaElement.prototype.load).toHaveBeenCalledTimes(container.querySelectorAll('video').length);
    vi.mocked(HTMLMediaElement.prototype.pause).mockClear();
    setIntersecting(false);
    expect(art).toHaveAttribute('data-visible', 'false');
    expectEveryVideoPaused(container);
  });

  it('stops animation in a hidden browser tab and resumes when the tab returns', () => {
    const { container } = render(<AdmissionArt />);
    const art = container.querySelector('.admission-art');
    setIntersecting(true);
    vi.mocked(HTMLMediaElement.prototype.pause).mockClear();
    vi.spyOn(document, 'hidden', 'get').mockReturnValue(true);
    fireEvent(document, new Event('visibilitychange'));
    expect(art).toHaveAttribute('data-visible', 'false');
    expectEveryVideoPaused(container);
    vi.mocked(HTMLMediaElement.prototype.play).mockClear();
    vi.spyOn(document, 'hidden', 'get').mockReturnValue(false);
    fireEvent(document, new Event('visibilitychange'));
    expect(art).toHaveAttribute('data-visible', 'true');
    container
      .querySelectorAll('video')
      .forEach((video) => expect(vi.mocked(HTMLMediaElement.prototype.play).mock.contexts).toContain(video));
  });

  it('respects reduced motion and reacts when the OS preference changes', () => {
    Object.defineProperty(mediaQuery, 'matches', { value: true, configurable: true });
    const { container } = render(<AdmissionArt />);
    const art = container.querySelector('.admission-art');
    setIntersecting(true);
    expect(art).toHaveAttribute('data-visible', 'false');
    container.querySelectorAll('video').forEach((video) => expect(video).not.toHaveAttribute('src'));
    expect(HTMLMediaElement.prototype.load).not.toHaveBeenCalled();
    expect(HTMLMediaElement.prototype.play).not.toHaveBeenCalled();
    Object.defineProperty(mediaQuery, 'matches', { value: false, configurable: true });
    act(() => mediaChanged());
    expect(art).toHaveAttribute('data-visible', 'true');
    container.querySelectorAll('video').forEach((video) => expect(video).toHaveAttribute('src'));
    vi.mocked(HTMLMediaElement.prototype.pause).mockClear();
    Object.defineProperty(mediaQuery, 'matches', { value: true, configurable: true });
    act(() => mediaChanged());
    expect(art).toHaveAttribute('data-visible', 'false');
    expectEveryVideoPaused(container);
  });

  it('disconnects the observer and removes browser listeners on unmount', () => {
    const removeDocumentListener = vi.spyOn(document, 'removeEventListener');
    const { unmount } = render(<AdmissionArt />);
    unmount();
    expect(disconnect).toHaveBeenCalledOnce();
    expect(removeDocumentListener).toHaveBeenCalledWith('visibilitychange', expect.any(Function));
    expect(removeMediaListener).toHaveBeenCalledWith('change', expect.any(Function));
  });

  it('supports browsers without IntersectionObserver and cancels the pending frame on cleanup', () => {
    vi.stubGlobal('IntersectionObserver', undefined);
    let frameCallback: FrameRequestCallback = () => {};
    vi.spyOn(window, 'requestAnimationFrame').mockImplementation((callback) => {
      frameCallback = callback;
      return 42;
    });
    const cancelFrame = vi.spyOn(window, 'cancelAnimationFrame');
    const { container, unmount } = render(<AdmissionArt />);
    act(() => frameCallback(0));
    expect(container.querySelector('.admission-art')).toHaveAttribute('data-visible', 'true');
    unmount();
    expect(cancelFrame).toHaveBeenCalledWith(42);
    expect(removeMediaListener).toHaveBeenCalledWith('change', expect.any(Function));
  });

  it('renders one hero film and seven college-photo windows, with no controls', () => {
    const { container } = render(<AdmissionArt />);
    const art = container.querySelector('.admission-art')!;
    expect(art).toHaveClass('admission-art--hero');
    expect(art).toHaveAttribute('aria-hidden', 'true');
    const poster = container.querySelector('.admission-art__photograph .decorative-video__poster');
    expect(poster).toHaveAttribute('src', '/art/flower-pink.webp');
    expect(poster).toHaveAttribute('fetchpriority', 'high');
    expect(container.querySelectorAll('video')).toHaveLength(1);
    expect(container.querySelectorAll('.admission-art__window')).toHaveLength(7);
    // Motion is governed by visibility and the OS preference, not a toggle.
    expect(container.querySelectorAll('button')).toHaveLength(0);
    expect(container.querySelector('[data-motion]')).toBeNull();
  });

  it('shows every college photo across the windows, each exactly once', () => {
    const { container } = render(<AdmissionArt />);
    const shown = [...container.querySelectorAll('.admission-art__window img')].map((img) => img.getAttribute('src'));
    expect(shown).toHaveLength(COLLEGE_IMAGES.length);
    expect(new Set(shown)).toEqual(new Set(COLLEGE_IMAGES.map((image) => image.src)));
    container.querySelectorAll('.admission-art__window').forEach((win) => {
      const images = win.querySelectorAll('img');
      expect(images.length).toBeGreaterThan(0);
      // One photo per window is active, and it is the one loaded eagerly.
      expect(win.querySelectorAll('img[data-active="true"]')).toHaveLength(1);
      expect(images[0]).toHaveAttribute('data-active', 'true');
      expect(images[0]).toHaveAttribute('loading', 'eager');
      expect(images[0]).toHaveAttribute('alt', '');
    });
  });

  it('deals photos round-robin so the windows partition the set', () => {
    const dealt = Array.from({ length: 7 }, (_, n) => windowImages(n, 7));
    expect(dealt.flat().sort()).toEqual(COLLEGE_IMAGES.map((image) => image.src).sort());
    expect(dealt[0][0]).toBe(COLLEGE_IMAGES[0].src);
    expect(dealt[0][1]).toBe(COLLEGE_IMAGES[7].src);
  });

  it('steps the window photos only while the artwork is visible', () => {
    vi.useFakeTimers();
    try {
      const { container } = render(<AdmissionArt />);
      const firstWindow = container.querySelector('.admission-art__window')!;
      const active = () => firstWindow.querySelector('img[data-active="true"]')?.getAttribute('src');
      const initial = active();
      act(() => vi.advanceTimersByTime(20000));
      expect(active()).toBe(initial);

      setIntersecting(true);
      act(() => vi.advanceTimersByTime(3200));
      expect(active()).not.toBe(initial);

      setIntersecting(false);
      const frozen = active();
      act(() => vi.advanceTimersByTime(20000));
      expect(active()).toBe(frozen);
    } finally {
      vi.useRealTimers();
    }
  });

  it('plays the pink film once visible', () => {
    const { container } = render(<AdmissionArt />);
    setIntersecting(true);
    expect(container.querySelector('.admission-art__photograph video')).toHaveAttribute('src', '/art/flower-pink.mp4');
  });

  it('finishes the opening without remounting or restarting a playing video', () => {
    const { container, rerender } = render(<AdmissionArt opening />);
    const photograph = container.querySelector('.admission-art__photograph');
    const crop = container.querySelector('.admission-art__window');
    const art = container.querySelector('.admission-art');
    const videos = [...container.querySelectorAll('video')];
    setIntersecting(true);
    videos.forEach((video) => fireEvent.playing(video));
    expect(art).toHaveAttribute('data-opening', 'true');
    vi.mocked(HTMLMediaElement.prototype.play).mockClear();
    vi.mocked(HTMLMediaElement.prototype.load).mockClear();
    vi.mocked(HTMLMediaElement.prototype.pause).mockClear();
    rerender(<AdmissionArt opening={false} />);
    expect(art).toHaveAttribute('data-opening', 'false');
    expect(art).toHaveAttribute('data-visible', 'true');
    expect(container.querySelector('.admission-art__photograph')).toBe(photograph);
    expect(container.querySelector('.admission-art__window')).toBe(crop);
    expect([...container.querySelectorAll('video')]).toEqual(videos);
    videos.forEach((video) => expect(video).toHaveAttribute('data-ready', 'true'));
    expect(HTMLMediaElement.prototype.play).not.toHaveBeenCalled();
    expect(HTMLMediaElement.prototype.load).not.toHaveBeenCalled();
    expect(HTMLMediaElement.prototype.pause).not.toHaveBeenCalled();
  });

  it('touches no browser storage', () => {
    const getItem = vi.spyOn(Storage.prototype, 'getItem');
    const setItem = vi.spyOn(Storage.prototype, 'setItem');
    render(<AdmissionArt />);
    setIntersecting(true);
    expect(getItem).not.toHaveBeenCalled();
    expect(setItem).not.toHaveBeenCalled();
  });
});
