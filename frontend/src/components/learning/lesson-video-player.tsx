'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Play, Pause, Volume2, VolumeX } from 'lucide-react';
import { cn } from '@/lib/utils';

const BRAND_LOGO = '/landing/ingoby-innovation-hub-green.png';

function getYouTubeId(url: string): string | null {
  const m = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^&?#\s]{11})/);
  return m ? m[1]! : null;
}

function isDirectVideo(url: string) {
  return /\.(mp4|webm|ogg|mov)(\?|$)/i.test(url) || url.includes('/uploads/');
}

type Props = {
  videoUrl: string;
  title: string;
  onWatchProgress?: (watchedSec: number) => void;
  className?: string;
};

export function LessonVideoPlayer({ videoUrl, title, onWatchProgress, className }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [started, setStarted] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const watchedRef = useRef(0);

  const ytId = getYouTubeId(videoUrl);
  const direct = !ytId && isDirectVideo(videoUrl);

  const tickWatch = useCallback(() => {
    watchedRef.current += 1;
    onWatchProgress?.(watchedRef.current);
  }, [onWatchProgress]);

  useEffect(() => {
    if (!started || !playing) return;
    const interval = window.setInterval(tickWatch, 1000);
    return () => window.clearInterval(interval);
  }, [started, playing, tickWatch]);

  function handlePlay() {
    setStarted(true);
    setPlaying(true);
    if (direct && videoRef.current) {
      void videoRef.current.play();
    }
  }

  if (!started) {
    return (
      <div className={cn('relative aspect-video w-full overflow-hidden bg-brand-green', className)}>
        <div className="absolute inset-0 bg-gradient-to-br from-brand-green via-brand-green-dark to-brand-green" />
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 p-6">
          <img
            src={BRAND_LOGO}
            alt="Ingobyi Academy"
            className="h-20 w-auto max-w-[70%] object-contain drop-shadow-lg sm:h-28"
          />
          <p className="max-w-md text-center text-sm font-medium text-white/80 line-clamp-2">{title}</p>
          <button
            type="button"
            onClick={handlePlay}
            className="group flex h-16 w-16 items-center justify-center rounded-full bg-white/95 text-brand-green shadow-xl transition hover:scale-105 hover:bg-white"
            aria-label="Play lesson video"
          >
            <Play className="ml-1 h-7 w-7 fill-current" />
          </button>
          <p className="text-[11px] text-white/50">Tap to start learning</p>
        </div>
      </div>
    );
  }

  if (ytId) {
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const params = new URLSearchParams({
      rel: '0',
      modestbranding: '1',
      controls: '1',
      iv_load_policy: '3',
      fs: '1',
      playsinline: '1',
      disablekb: '0',
      autohide: '1',
      ...(origin ? { origin } : {}),
    });
    return (
      <div className={cn('relative aspect-video w-full bg-black', className)}>
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${ytId}?${params}`}
          className="absolute inset-0 h-full w-full border-0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          title={title}
          referrerPolicy="strict-origin-when-cross-origin"
        />
      </div>
    );
  }

  if (direct) {
    return (
      <div className={cn('group relative aspect-video w-full overflow-hidden bg-black', className)}>
        <video
          ref={videoRef}
          src={videoUrl}
          className="h-full w-full object-contain"
          controls
          playsInline
          muted={muted}
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
          onTimeUpdate={() => {
            if (videoRef.current) {
              watchedRef.current = Math.floor(videoRef.current.currentTime);
              onWatchProgress?.(watchedRef.current);
            }
          }}
        />
        <div className="pointer-events-none absolute left-3 top-3 opacity-0 transition group-hover:opacity-100">
          <img src={BRAND_LOGO} alt="" className="h-8 w-auto opacity-80" />
        </div>
        <button
          type="button"
          onClick={() => setMuted((m) => !m)}
          className="absolute bottom-14 right-3 rounded-full bg-black/50 p-2 text-white opacity-0 transition group-hover:opacity-100"
        >
          {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
        </button>
      </div>
    );
  }

  return (
    <div className={cn('relative aspect-video w-full overflow-hidden bg-brand-green', className)}>
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-6">
        <img src={BRAND_LOGO} alt="" className="h-16 w-auto opacity-90" />
        <p className="text-sm text-white/70">Video format not supported. Open the link directly.</p>
        <a href={videoUrl} target="_blank" rel="noreferrer" className="text-sm font-semibold text-brand-mint underline">
          Open video
        </a>
      </div>
    </div>
  );
}
