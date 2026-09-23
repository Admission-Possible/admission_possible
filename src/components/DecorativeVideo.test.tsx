import { act, cleanup, fireEvent, render } from '@testing-library/react';
import { renderToString } from 'react-dom/server';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { DecorativeVideo } from './DecorativeVideo';

const props = { poster: '/art/flower.jpg', src: '/art/flower.mp4', playing: false };

function pendingPlayback() {
  let resolve!: () => void;
  let reject!: (error: Error) => void;
  const promise = new Promise<void>((resolvePromise, rejectPromise) => {
    resolve = resolvePromise;
    reject = rejectPromise;
  });
  return { promise, resolve, reject };
}

beforeEach(() => {
  vi.spyOn(HTMLMediaElement.prototype, 'play').mockResolvedValue();
  vi.spyOn(HTMLMediaElement.prototype, 'pause').mockImplementation(() => {});
  vi.spyOn(HTMLMediaElement.prototype, 'load').mockImplementation(() => {});
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe('DecorativeVideo', () => {
  it('never includes a video source in server-rendered markup', () => {
    const container = document.createElement('div');
    container.innerHTML = renderToString(<DecorativeVideo {...props} playing eager />);
    expect(container.querySelector('video')).not.toHaveAttribute('src');
    expect(container.querySelector('video')).toHaveAttribute('preload', 'none');
    expect(container.querySelector('img')).toHaveAttribute('src', props.poster);
    expect(container.querySelector('img')).toHaveAttribute('loading', 'eager');
    expect(HTMLMediaElement.prototype.play).not.toHaveBeenCalled();
  });

  it('renders only a decorative poster until its parent permits playback', () => {
    const { container, rerender } = render(<DecorativeVideo {...props} width={1440} height={810} />);
    const video = container.querySelector('video');
    expect(video).not.toHaveAttribute('src');
    expect(video).not.toHaveAttribute('autoplay');
    expect(video).toHaveAttribute('data-ready', 'false');
    expect(video).toHaveAttribute('aria-hidden', 'true');
    expect(video).toHaveAttribute('tabindex', '-1');
    expect(container.firstChild).toHaveAttribute('aria-hidden', 'true');
    expect(container.querySelector('img')).toHaveAttribute('loading', 'lazy');
    expect(container.querySelector('img')).toHaveAttribute('width', '1440');
    expect(HTMLMediaElement.prototype.load).not.toHaveBeenCalled();
    expect(HTMLMediaElement.prototype.play).not.toHaveBeenCalled();
    expect(HTMLMediaElement.prototype.pause).not.toHaveBeenCalled();
    rerender(<DecorativeVideo {...props} src="/art/another.mp4" />);
    expect(video).not.toHaveAttribute('src');
    expect(HTMLMediaElement.prototype.load).not.toHaveBeenCalled();
  });

  it('loads only on first playback and reveals the video after playback starts', async () => {
    const pending = pendingPlayback();
    vi.mocked(HTMLMediaElement.prototype.play).mockReturnValue(pending.promise);
    const { container } = render(<DecorativeVideo {...props} playing />);
    const video = container.querySelector('video')!;
    expect(video).toHaveAttribute('src', props.src);
    expect(video.muted).toBe(true);
    expect(video.loop).toBe(true);
    expect(video.playsInline).toBe(true);
    expect(video).toHaveAttribute('data-ready', 'false');
    expect(HTMLMediaElement.prototype.load).toHaveBeenCalledOnce();
    await act(async () => pending.resolve());
    expect(video).toHaveAttribute('data-ready', 'true');
    expect(container.querySelector('img')).toBeInTheDocument();
  });

  it('pauses and resumes the same loaded video without another download', async () => {
    const { container, rerender } = render(<DecorativeVideo {...props} playing />);
    const video = container.querySelector('video')!;
    await act(async () => {});
    rerender(<DecorativeVideo {...props} />);
    expect(HTMLMediaElement.prototype.pause).toHaveBeenCalled();
    expect(video).toHaveAttribute('data-ready', 'true');
    rerender(<DecorativeVideo {...props} playing />);
    await act(async () => {});
    expect(HTMLMediaElement.prototype.play).toHaveBeenCalledTimes(2);
    expect(HTMLMediaElement.prototype.load).toHaveBeenCalledOnce();
    expect(container.querySelector('video')).toBe(video);
  });

  it('keeps the poster when autoplay is rejected, then allows an explicit retry', async () => {
    vi.mocked(HTMLMediaElement.prototype.play).mockRejectedValueOnce(new Error('Autoplay denied'));
    const { container, rerender } = render(<DecorativeVideo {...props} playing />);
    const video = container.querySelector('video');
    await act(async () => {});
    expect(video).toHaveAttribute('data-ready', 'false');
    expect(HTMLMediaElement.prototype.pause).toHaveBeenCalled();
    rerender(<DecorativeVideo {...props} />);
    rerender(<DecorativeVideo {...props} playing />);
    await act(async () => {});
    expect(video).toHaveAttribute('data-ready', 'true');
  });

  it('keeps the poster if play throws synchronously', () => {
    vi.mocked(HTMLMediaElement.prototype.play).mockImplementation(() => {
      throw new Error('Unsupported media');
    });
    const { container } = render(<DecorativeVideo {...props} playing />);
    expect(container.querySelector('video')).toHaveAttribute('data-ready', 'false');
    expect(HTMLMediaElement.prototype.pause).toHaveBeenCalled();
  });

  it('falls back to the poster when an already playing video fails', async () => {
    const { container } = render(<DecorativeVideo {...props} playing />);
    const video = container.querySelector('video')!;
    await act(async () => {});
    expect(video).toHaveAttribute('data-ready', 'true');
    fireEvent.error(video);
    expect(video).toHaveAttribute('data-ready', 'false');
    expect(container.querySelector('img')).toBeInTheDocument();
  });

  it('uses the playing event when an older browser returns no play promise', () => {
    vi.mocked(HTMLMediaElement.prototype.play).mockReturnValue(undefined as unknown as Promise<void>);
    const { container } = render(<DecorativeVideo {...props} playing />);
    const video = container.querySelector('video')!;
    expect(video).toHaveAttribute('data-ready', 'false');
    fireEvent.playing(video);
    expect(video).toHaveAttribute('data-ready', 'true');
  });

  it('ignores a stale playback rejection after a later attempt has succeeded', async () => {
    const pending = pendingPlayback();
    vi.mocked(HTMLMediaElement.prototype.play).mockReturnValueOnce(pending.promise);
    const { container, rerender } = render(<DecorativeVideo {...props} playing />);
    rerender(<DecorativeVideo {...props} />);
    rerender(<DecorativeVideo {...props} playing />);
    await act(async () => {});
    const video = container.querySelector('video')!;
    expect(video).toHaveAttribute('data-ready', 'true');
    vi.mocked(HTMLMediaElement.prototype.pause).mockClear();
    await act(async () => pending.reject(new Error('Old attempt aborted')));
    expect(video).toHaveAttribute('data-ready', 'true');
    expect(HTMLMediaElement.prototype.pause).not.toHaveBeenCalled();
  });

  it('stops a delayed playback resolution after the parent has paused motion', async () => {
    const pending = pendingPlayback();
    vi.mocked(HTMLMediaElement.prototype.play).mockReturnValue(pending.promise);
    const { container, rerender } = render(<DecorativeVideo {...props} playing />);
    rerender(<DecorativeVideo {...props} />);
    vi.mocked(HTMLMediaElement.prototype.pause).mockClear();
    await act(async () => pending.resolve());
    expect(HTMLMediaElement.prototype.pause).toHaveBeenCalledOnce();
    expect(container.querySelector('video')).toHaveAttribute('data-ready', 'false');
  });

  it('does not let stale playback reveal a replacement source or pause its attempt', async () => {
    const oldPlayback = pendingPlayback();
    const newPlayback = pendingPlayback();
    vi.mocked(HTMLMediaElement.prototype.play)
      .mockReturnValueOnce(oldPlayback.promise)
      .mockReturnValueOnce(newPlayback.promise);
    const { container, rerender } = render(<DecorativeVideo {...props} playing />);
    const video = container.querySelector('video')!;
    rerender(<DecorativeVideo {...props} playing src="/art/another.mp4" />);
    vi.mocked(HTMLMediaElement.prototype.pause).mockClear();
    await act(async () => oldPlayback.resolve());
    expect(video).toHaveAttribute('data-ready', 'false');
    expect(HTMLMediaElement.prototype.pause).not.toHaveBeenCalled();
    await act(async () => newPlayback.resolve());
    expect(video).toHaveAttribute('data-ready', 'true');
    expect(video).toHaveAttribute('src', '/art/another.mp4');
  });

  it('pauses and releases the video on unmount, including delayed play resolutions', async () => {
    const pending = pendingPlayback();
    vi.mocked(HTMLMediaElement.prototype.play).mockReturnValue(pending.promise);
    const { container, unmount } = render(<DecorativeVideo {...props} playing />);
    const video = container.querySelector('video')!;
    unmount();
    expect(video).not.toHaveAttribute('src');
    expect(HTMLMediaElement.prototype.load).toHaveBeenCalledTimes(2);
    vi.mocked(HTMLMediaElement.prototype.pause).mockClear();
    await act(async () => pending.resolve());
    expect(HTMLMediaElement.prototype.pause).toHaveBeenCalledOnce();
    expect(video).toHaveAttribute('data-ready', 'false');
  });
});
