import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { renderToString } from 'react-dom/server';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

type ArtComponent = typeof import('./AdmissionArt').AdmissionArt;
let AdmissionArt: ArtComponent;
let observerCallback: IntersectionObserverCallback;
let observerCallbacks: IntersectionObserverCallback[];
let mediaChanged: () => void;
let mediaQuery: MediaQueryList;
const disconnect = vi.fn();
const observe = vi.fn();
const removeMediaListener = vi.fn();

beforeEach(async () => {
  vi.resetModules();
  sessionStorage.clear();
  observerCallbacks = [];
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
        observerCallbacks.push(callback);
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

function setAllIntersecting(value: boolean) {
  act(() => {
    observerCallbacks.forEach((callback) =>
      callback([{ isIntersecting: value } as IntersectionObserverEntry], {} as IntersectionObserver),
    );
  });
}

function expectEveryVideoPaused(container: HTMLElement) {
  const pausedVideos = vi.mocked(HTMLMediaElement.prototype.pause).mock.contexts;
  container.querySelectorAll('video').forEach((video) => expect(pausedVideos).toContain(video));
}

describe('AdmissionArt motion lifecycle', () => {
  it('does not read session storage on the server and restores the preference after hydration', () => {
    sessionStorage.setItem('admission-art-motion-paused', 'true');
    const getItem = vi.spyOn(Storage.prototype, 'getItem');
    const html = renderToString(<AdmissionArt />);
    expect(getItem).not.toHaveBeenCalled();
    expect(html).toContain('data-motion="playing"');

    const container = document.createElement('div');
    container.innerHTML = html;
    container.querySelectorAll('video').forEach((video) => {
      expect(video).not.toHaveAttribute('src');
      // jsdom does not initialize the muted property from parsed media markup.
      video.muted = video.defaultMuted;
    });
    document.body.append(container);
    const errors = vi.spyOn(console, 'error').mockImplementation(() => {});
    render(<AdmissionArt />, { container, hydrate: true });
    expect(screen.getByRole('button', { name: 'Play artwork animation' })).toHaveAttribute('aria-pressed', 'true');
    expect(getItem).toHaveBeenCalledWith('admission-art-motion-paused');
    expect(errors).not.toHaveBeenCalled();
    expect(HTMLMediaElement.prototype.load).not.toHaveBeenCalled();
  });

  it('pauses and resumes every mounted artwork with one shared preference', () => {
    const { container } = render(
      <>
        <AdmissionArt />
        <AdmissionArt variant="writing" />
      </>,
    );
    setAllIntersecting(true);
    const videos = [...container.querySelectorAll('video')];
    expect(videos.length).toBeGreaterThan(1);
    videos.forEach((video) => expect(vi.mocked(HTMLMediaElement.prototype.play).mock.contexts).toContain(video));
    vi.mocked(HTMLMediaElement.prototype.pause).mockClear();
    fireEvent.click(screen.getAllByRole('button', { name: 'Pause artwork animation' })[0]);
    expect(screen.getAllByRole('button', { name: 'Play artwork animation' })).toHaveLength(2);
    container.querySelectorAll('.admission-art').forEach((art) => expect(art).toHaveAttribute('data-motion', 'paused'));
    expect(sessionStorage.getItem('admission-art-motion-paused')).toBe('true');
    expectEveryVideoPaused(container);

    vi.mocked(HTMLMediaElement.prototype.play).mockClear();
    fireEvent.click(screen.getAllByRole('button', { name: 'Play artwork animation' })[1]);
    expect(screen.getAllByRole('button', { name: 'Pause artwork animation' })).toHaveLength(2);
    expect(sessionStorage.getItem('admission-art-motion-paused')).toBe('false');
    videos.forEach((video) => expect(vi.mocked(HTMLMediaElement.prototype.play).mock.contexts).toContain(video));
  });

  it('keeps the paused preference after navigation remounts the artwork', () => {
    const { unmount } = render(<AdmissionArt />);
    fireEvent.click(screen.getByRole('button', { name: 'Pause artwork animation' }));
    unmount();
    const { container } = render(<AdmissionArt variant="writing" />);
    setIntersecting(true);
    expect(screen.getByRole('button', { name: 'Play artwork animation' })).toHaveAttribute('aria-pressed', 'true');
    expect(container.querySelector('video')).not.toHaveAttribute('src');
    expect(HTMLMediaElement.prototype.play).not.toHaveBeenCalled();
    expect(HTMLMediaElement.prototype.load).not.toHaveBeenCalled();
  });

  it('allows motion control when browser storage is blocked', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('Storage blocked');
    });
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('Storage blocked');
    });
    render(<AdmissionArt />);
    fireEvent.click(screen.getByRole('button', { name: 'Pause artwork animation' }));
    expect(screen.getByRole('button', { name: 'Play artwork animation' })).toBeInTheDocument();
  });

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

  it('uses three local generated flower posters and retains vector art in graphic chapters', () => {
    const { rerender, container } = render(<AdmissionArt />);
    const poster = container.querySelector('.admission-art__photograph .decorative-video__poster');
    expect(poster).toHaveAttribute('src', '/art/flower-pink.webp');
    expect(poster).toHaveAttribute('fetchpriority', 'high');
    expect(new Set([...container.querySelectorAll('img')].map((image) => image.getAttribute('src')))).toEqual(
      new Set(['/art/flower-pink.webp', '/art/flower-blue.webp', '/art/flower-duet.webp']),
    );
    expect(container.querySelectorAll('.admission-art__window')).toHaveLength(7);
    expect(container.querySelectorAll('video')).toHaveLength(4);
    rerender(<AdmissionArt variant="mission" />);
    expect(container.querySelector('.admission-art__photograph .decorative-video__poster')).toHaveAttribute(
      'loading',
      'lazy',
    );
    expect(container.querySelector('.admission-art__windows')).not.toBeInTheDocument();
    rerender(<AdmissionArt variant="pathways" />);
    expect(container.querySelector('.admission-art__canvas')).toHaveAttribute('aria-hidden', 'true');
    expect(container.querySelector('.admission-art__photograph')).not.toBeInTheDocument();
  });

  it('reuses the pink and blue films across the hero crops and photographic chapters', () => {
    const { container } = render(
      <>
        <AdmissionArt />
        <AdmissionArt variant="mission" />
        <AdmissionArt variant="writing" />
      </>,
    );
    setAllIntersecting(true);
    const filmSources = [...container.querySelectorAll('video')].map((video) => video.getAttribute('src')!);
    expect(new Set(filmSources.map((src) => src.replace('-detail.mp4', '.mp4')))).toEqual(
      new Set(['/art/flower-pink.mp4', '/art/flower-blue.mp4']),
    );
    expect(container.querySelector('.admission-art--hero .admission-art__photograph video')).toHaveAttribute(
      'src',
      '/art/flower-pink.mp4',
    );
    expect(container.querySelector('.admission-art--mission video')).toHaveAttribute('src', '/art/flower-pink.mp4');
    expect(container.querySelector('.admission-art--writing video')).toHaveAttribute('src', '/art/flower-blue.mp4');
    expect(filmSources).toContain('/art/flower-pink-detail.mp4');
    expect(filmSources).toContain('/art/flower-blue-detail.mp4');
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
    expect(art).toHaveAttribute('data-motion', 'playing');
    expect(container.querySelector('.admission-art__photograph')).toBe(photograph);
    expect(container.querySelector('.admission-art__window')).toBe(crop);
    expect([...container.querySelectorAll('video')]).toEqual(videos);
    videos.forEach((video) => expect(video).toHaveAttribute('data-ready', 'true'));
    expect(HTMLMediaElement.prototype.play).not.toHaveBeenCalled();
    expect(HTMLMediaElement.prototype.load).not.toHaveBeenCalled();
    expect(HTMLMediaElement.prototype.pause).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: 'Pause artwork animation' }));
    rerender(<AdmissionArt variant="writing" opening />);
    expect(art).toHaveAttribute('data-opening', 'false');
    expect(art).toHaveAttribute('data-motion', 'paused');
  });
});
