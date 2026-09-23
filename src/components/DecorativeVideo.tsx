import { useEffect, useRef, useState } from 'react';

interface DecorativeVideoProps {
  poster: string;
  src: string;
  playing: boolean;
  eager?: boolean;
  className?: string;
  width?: number;
  height?: number;
}

/** A decorative loop whose parent supplies visibility and motion preferences. */
export function DecorativeVideo({
  poster,
  src,
  playing,
  eager = false,
  className = '',
  width,
  height,
}: DecorativeVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const playbackAllowedRef = useRef(false);
  const [visibleSource, setVisibleSource] = useState<string | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    playbackAllowedRef.current = playing && Boolean(src);
    let cancelled = false;

    if (!playing || !src) {
      if (video.hasAttribute('src')) video.pause();
      return;
    }

    const showVideo = () => {
      if (!cancelled) {
        setVisibleSource(src);
      } else if (!playbackAllowedRef.current) {
        // A delayed play() resolution must not restart a paused or unmounted loop.
        video.pause();
      }
    };
    const showPoster = () => {
      if (cancelled) return;
      setVisibleSource(null);
      video.pause();
    };

    video.addEventListener('playing', showVideo);
    video.addEventListener('error', showPoster);

    // Muting the property as well as the markup satisfies autoplay policies in Safari.
    video.muted = true;
    if (video.getAttribute('src') !== src) {
      video.setAttribute('src', src);
      video.load();
    }

    try {
      const playback = video.play();
      // Older engines report playback only through the playing event.
      playback?.then(showVideo, showPoster);
    } catch {
      showPoster();
    }

    return () => {
      cancelled = true;
      playbackAllowedRef.current = false;
      video.removeEventListener('playing', showVideo);
      video.removeEventListener('error', showPoster);
      video.pause();
    };
  }, [playing, src]);

  useEffect(() => {
    const video = videoRef.current;
    return () => {
      if (!video?.hasAttribute('src')) return;
      video.pause();
      video.removeAttribute('src');
      video.load();
    };
  }, []);

  return (
    <div className={`decorative-video ${className}`.trim()} aria-hidden="true">
      <img
        className="decorative-video__poster"
        src={poster}
        alt=""
        width={width}
        height={height}
        loading={eager ? 'eager' : 'lazy'}
        fetchPriority={eager ? 'high' : 'auto'}
        decoding="async"
        draggable={false}
      />
      <video
        ref={videoRef}
        className="decorative-video__media"
        data-ready={visibleSource === src}
        poster={poster}
        width={width}
        height={height}
        preload="none"
        muted
        loop
        playsInline
        aria-hidden="true"
        tabIndex={-1}
        disablePictureInPicture
      />
    </div>
  );
}

export default DecorativeVideo;
