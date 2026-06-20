'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
<<<<<<< HEAD
import { Play, Square } from 'lucide-react';
=======
import { ExternalLink, Play, Video, Volume2, VolumeX } from 'lucide-react';
>>>>>>> 0e94140 (add cetificate)
import { cn } from '@/lib/utils';
import { BrandLogo } from '@/components/brand-logo';

<<<<<<< HEAD
function getYouTubeId(url: string): string | null {
  const trimmed = url.trim();
  const patterns = [
    /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|shorts\/|watch\?v=|watch\?.+&v=))([^&?#\s/]{11})/,
    /^([a-zA-Z0-9_-]{11})$/,
  ];
  for (const pattern of patterns) {
    const m = trimmed.match(pattern);
    if (m?.[1]) return m[1];
  }
  return null;
}

function getVimeoId(url: string): string | null {
  const m = url.trim().match(/vimeo\.com\/(?:video\/)?(\d+)/);
  return m ? m[1]! : null;
=======
export function getYouTubeId(url: string): string | null {
  const trimmed = url.trim();
  const patterns = [
    /(?:youtu\.be\/)([^&?#\s/]{11})/,
    /youtube\.com\/embed\/([^&?#\s/]{11})/,
    /youtube\.com\/shorts\/([^&?#\s/]{11})/,
    /youtube\.com\/live\/([^&?#\s/]{11})/,
    /youtube\.com\/watch\?(?:[^&]+&)*v=([^&?#\s/]{11})/,
    /youtube\.com\/watch\?v=([^&?#\s/]{11})/,
  ];

  for (const pattern of patterns) {
    const match = trimmed.match(pattern);
    if (match?.[1]) return match[1];
  }

  return null;
}

function youtubeThumbnail(id: string) {
  return `https://img.youtube.com/vi/${id}/maxresdefault.jpg`;
}

function youtubeWatchUrl(id: string) {
  return `https://www.youtube.com/watch?v=${id}`;
>>>>>>> 0e94140 (add cetificate)
}

function isDirectVideo(url: string) {
  const u = url.trim();
  return (
    /\.(mp4|webm|ogg|mov|m4v)(\?|$)/i.test(u) ||
    u.includes('/uploads/') ||
    /cloudinary\.com\/.*\/video\/upload\//i.test(u) ||
    /res\.cloudinary\.com/i.test(u)
  );
}

type VideoKind = 'youtube' | 'vimeo' | 'direct' | 'unknown';

function resolveVideoKind(url: string): VideoKind {
  if (getYouTubeId(url)) return 'youtube';
  if (getVimeoId(url)) return 'vimeo';
  if (isDirectVideo(url)) return 'direct';
  return 'unknown';
}

export type LessonVideoView = 'cover' | 'playing' | 'error';

type Props = {
  videoUrl: string;
  title: string;
  coverImageUrl?: string | null;
  onWatchProgress?: (watchedSec: number) => void;
  onViewChange?: (view: LessonVideoView) => void;
  className?: string;
};

function CoverBackground({
  coverImageUrl,
  onImageError,
}: {
  coverImageUrl?: string | null;
  onImageError: () => void;
}) {
  if (coverImageUrl) {
    return (
      <img
        src={coverImageUrl}
        alt=""
        className="absolute inset-0 h-full w-full object-cover object-center"
        onError={onImageError}
      />
    );
  }
  return (
    <div className="absolute inset-0 bg-gradient-to-br from-brand-green via-brand-green-dark to-brand-green" />
  );
}

export function LessonVideoPlayer({
  videoUrl,
  title,
  coverImageUrl,
  onWatchProgress,
  onViewChange,
  className,
}: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
<<<<<<< HEAD
  const [view, setView] = useState<LessonVideoView>('cover');
  const [coverFailed, setCoverFailed] = useState(false);
=======
  const [started, setStarted] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [thumbFallback, setThumbFallback] = useState(false);
>>>>>>> 0e94140 (add cetificate)
  const watchedRef = useRef(0);

  const kind = resolveVideoKind(videoUrl);
  const ytId = kind === 'youtube' ? getYouTubeId(videoUrl) : null;
  const vimeoId = kind === 'vimeo' ? getVimeoId(videoUrl) : null;
  const isFileVideo = kind === 'direct' || kind === 'unknown';
  const isPlaying = view === 'playing';
  const showCoverImage = coverImageUrl && !coverFailed;

  useEffect(() => {
    setView('cover');
    setCoverFailed(false);
    watchedRef.current = 0;
  }, [videoUrl]);

  useEffect(() => {
<<<<<<< HEAD
    setCoverFailed(false);
  }, [coverImageUrl]);

  useEffect(() => {
    onViewChange?.(view);
  }, [view, onViewChange]);

  useEffect(() => {
    if (view !== 'playing' || !isFileVideo) return;
    const el = videoRef.current;
    if (!el) return;
    const play = async () => {
      try {
        await el.play();
      } catch {
        setView('error');
      }
    };
    void play();
  }, [view, isFileVideo, videoUrl]);

  const handleStop = useCallback(() => {
    setView('cover');
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
=======
    setStarted(false);
    setPlaying(false);
    setThumbFallback(false);
    watchedRef.current = 0;
  }, [videoUrl]);

  function handlePlay() {
    setStarted(true);
    setPlaying(true);
    if (direct && videoRef.current) {
      void videoRef.current.play();
>>>>>>> 0e94140 (add cetificate)
    }
  }, []);

<<<<<<< HEAD
  const handleStart = useCallback(() => {
    setView('playing');
  }, []);
=======
  if (ytId && !started) {
    const thumbSrc = thumbFallback
      ? `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`
      : youtubeThumbnail(ytId);

    return (
      <div
        className={cn(
          'group relative aspect-video w-full overflow-hidden bg-black',
          className,
        )}
      >
        <img
          src={thumbSrc}
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
          onError={() => setThumbFallback(true)}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-black/20" />

        <div className="absolute left-4 top-4 flex items-center gap-2 rounded-full bg-black/55 px-3 py-1.5 text-[11px] font-semibold text-white ring-1 ring-white/15 backdrop-blur-sm">
          <Video className="h-4 w-4 text-red-500" />
          YouTube lesson
        </div>

        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 px-6 text-center">
          <button
            type="button"
            onClick={handlePlay}
            className="flex h-20 w-20 items-center justify-center rounded-full bg-red-600 text-white shadow-2xl ring-4 ring-white/20 transition hover:scale-105 hover:bg-red-500"
            aria-label={`Play ${title}`}
          >
            <Play className="ml-1 h-9 w-9 fill-current" />
          </button>
          <div className="max-w-2xl space-y-2">
            <p className="text-lg font-bold text-white sm:text-xl">{title}</p>
            <p className="text-xs text-white/70">Click play to watch in the lesson player</p>
          </div>
        </div>

        <a
          href={youtubeWatchUrl(ytId)}
          target="_blank"
          rel="noreferrer"
          className="absolute bottom-4 right-4 inline-flex items-center gap-1.5 rounded-full bg-black/55 px-3 py-1.5 text-[11px] font-medium text-white/90 ring-1 ring-white/15 backdrop-blur-sm transition hover:bg-black/70"
        >
          Open on YouTube
          <ExternalLink className="h-3.5 w-3.5" />
        </a>
      </div>
    );
  }

  if (ytId && started) {
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const params = new URLSearchParams({
      autoplay: '1',
      rel: '0',
      modestbranding: '1',
      controls: '1',
      iv_load_policy: '3',
      fs: '1',
      playsinline: '1',
      disablekb: '0',
      autohide: '1',
      color: 'white',
      ...(origin ? { origin } : {}),
    });

    return (
      <div
        className={cn(
          'relative aspect-video w-full overflow-hidden bg-black',
          className,
        )}
      >
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${ytId}?${params}`}
          className="absolute inset-0 h-full w-full border-0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
          allowFullScreen
          title={title}
          referrerPolicy="strict-origin-when-cross-origin"
        />
      </div>
    );
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
>>>>>>> 0e94140 (add cetificate)

  return (
    <div className={cn('relative h-full w-full overflow-hidden bg-black', className)}>
      {isPlaying ? (
        <>
          {ytId && (
            <iframe
              key={ytId}
              src={`https://www.youtube-nocookie.com/embed/${ytId}?${new URLSearchParams({
                autoplay: '1',
                rel: '0',
                modestbranding: '1',
                controls: '1',
                iv_load_policy: '3',
                fs: '1',
                playsinline: '1',
                ...(typeof window !== 'undefined' ? { origin: window.location.origin } : {}),
              })}`}
              className="absolute inset-0 h-full w-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
              allowFullScreen
              title={title}
              referrerPolicy="strict-origin-when-cross-origin"
            />
          )}

          {vimeoId && (
            <iframe
              key={vimeoId}
              src={`https://player.vimeo.com/video/${vimeoId}?${new URLSearchParams({
                autoplay: '1',
                title: '0',
                byline: '0',
                portrait: '0',
              })}`}
              className="absolute inset-0 h-full w-full border-0"
              allow="autoplay; fullscreen; picture-in-picture"
              allowFullScreen
              title={title}
            />
          )}

          {isFileVideo && (
            <video
              ref={videoRef}
              key={videoUrl}
              src={videoUrl.trim()}
              // className=" inset-0 h-full w-full bg-black object-contain"
              controls
              playsInline
              preload="auto"
              onError={() => setView('error')}
              onTimeUpdate={() => {
                if (videoRef.current) {
                  watchedRef.current = Math.floor(videoRef.current.currentTime);
                  onWatchProgress?.(watchedRef.current);
                }
              }}
            />
          )}

          <button
            type="button"
            onClick={handleStop}
            className="absolute right-4 top-4 z-20 flex items-center gap-1.5 rounded-full bg-black/70 px-3 py-1.5 text-xs font-semibold text-white shadow-lg backdrop-blur-sm transition hover:bg-black/85"
            aria-label="Close video"
          >
            <Square className="h-3 w-3 fill-current" />
            Close
          </button>
        </>
      ) : (
        <>
          <CoverBackground
            coverImageUrl={showCoverImage ? coverImageUrl : null}
            onImageError={() => setCoverFailed(true)}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-black/20" />

          <div className="absolute left-4 top-4 z-10 rounded-md bg-white/95 px-2.5 py-1.5 shadow-md">
            <BrandLogo size="sm" />
          </div>

          <div className="relative z-10 flex h-full flex-col items-center justify-center gap-4 px-6 pb-10 pt-16">
            <p className="max-w-2xl text-center text-base font-semibold text-white drop-shadow-lg line-clamp-2 sm:text-lg">
              {title}
            </p>

            {view === 'error' ? (
              <div className="text-center">
                <p className="mb-3 text-sm text-white/85">Could not play this video here.</p>
                <a
                  href={videoUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-brand-green hover:bg-brand-mint"
                >
                  Open video
                </a>
              </div>
            ) : (
              <>
                <button
                  type="button"
                  onClick={handleStart}
                  className="flex h-20 w-20 items-center justify-center rounded-full bg-white text-brand-green shadow-2xl ring-4 ring-white/25 transition hover:scale-105 hover:bg-brand-mint active:scale-95 sm:h-24 sm:w-24"
                  aria-label="Watch video"
                >
                  <Play className="ml-1 h-10 w-10 fill-current sm:h-12 sm:w-12" />
                </button>
                <span className="text-xs font-bold uppercase tracking-[0.25em] text-white/80">
                  Watch video
                </span>
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
}
