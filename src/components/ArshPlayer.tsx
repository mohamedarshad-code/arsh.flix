'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  ArrowLeft, 
  Play, 
  Pause, 
  RotateCcw, 
  RotateCw, 
  Volume2, 
  VolumeX, 
  Subtitles, 
  Settings2,
  HelpCircle,
  Loader2,
  Maximize2,
  Minimize2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Hls from 'hls.js';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { PlayerSource } from '@/lib/streams';
import { useWatchHistory } from '@/hooks/useWatchHistory';
import { fetchDetails, getOptimizedImage } from '@/lib/tmdb';
import Image from 'next/image';

interface Source {
  label: string;
  type: string;
  src: string;
}

interface ArshPlayerProps {
  source: PlayerSource;
  sources?: Source[];
  title: string;
  onBack: () => void;
  movieId?: string | number;
  type?: 'movie' | 'tv';
  posterPath?: string;
  backdropPath?: string;
  overview?: string;
  voteAverage?: number;
  season?: number;
  episode?: number;
}

const ArshPlayer = ({ source: initialSource, sources = [], title, onBack, movieId, type = 'movie', posterPath = '', backdropPath = '', overview = '', voteAverage = 0, season, episode }: ArshPlayerProps) => {
  const router = useRouter();
  const [currentSource, setCurrentSource] = useState<PlayerSource>(initialSource);
  const [activeSourceIndex, setActiveSourceIndex] = useState(0);
  const { addToHistory } = useWatchHistory();
  const [showControls, setShowControls] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [levels, setLevels] = useState<any[]>([]);
  const [currentLevel, setCurrentLevel] = useState<number>(-1);
  const [iframeLoaded, setIframeLoaded] = useState(false);
  const [iframeUrl, setIframeUrl] = useState('');
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const controlsTimeout = useRef<NodeJS.Timeout | null>(null);
  const hlsRef = useRef<Hls | null>(null);


  // Save to watch history
  useEffect(() => {
    if (movieId) {
      addToHistory({
        id: Number(movieId),
        type,
        title,
        poster_path: posterPath,
        backdrop_path: backdropPath,
        overview,
        vote_average: voteAverage,
        season,
        episode,
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [movieId, season, episode]);



  // Handle VidAPI Player Events for iframe progress
  useEffect(() => {
    if (currentSource.type !== 'iframe' || !movieId) return;

    const handleMessage = (e: MessageEvent) => {
      try {
        const data = typeof e.data === 'string' ? JSON.parse(e.data) : e.data;
        // VIDEASY sends an object with id, timestamp, etc.
        if (data && data.timestamp !== undefined) {
          localStorage.setItem(`watch_progress_${movieId}_s${season}e${episode}`, data.timestamp.toString());
        }
      } catch (err) {
        // Ignore non-JSON messages
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentSource.type, movieId, season, episode]);

  // Handle iframe loading: hide overlay after 2s
  useEffect(() => {
    if (currentSource.type !== 'iframe') return;
    setIframeLoaded(false);
    const hideOverlay = setTimeout(() => setIframeLoaded(true), 2000);
    return () => clearTimeout(hideOverlay);
  }, [currentSource]);

  // Set iframe URL with VIDEASY parameters
  useEffect(() => {
    if (currentSource.type === 'iframe') {
      const savedTime = movieId ? localStorage.getItem(`watch_progress_${movieId}_s${season}e${episode}`) : null;
      let baseUrl = currentSource.src.split('?')[0];
      let existingParams = new URLSearchParams(currentSource.src.split('?')[1] || '');
      
      // Add VIDEASY features
      existingParams.set('autoplay', 'true');
      existingParams.set('nextEpisode', 'true');
      existingParams.set('autoplayNextEpisode', 'true');
      existingParams.set('episodeSelector', 'true');
      existingParams.set('overlay', 'true');
      existingParams.set('color', 'E50914'); // Netflix Red
      
      if (savedTime) {
        existingParams.set('progress', savedTime);
      }
      
      setIframeUrl(`${baseUrl}?${existingParams.toString()}`);
    }
  }, [currentSource.src, currentSource.type, movieId, season, episode]);

  // Resume Playback Logic (Native)
  useEffect(() => {
    if (currentSource.type === 'iframe' || !videoRef.current || !movieId) return;
    const savedTime = localStorage.getItem(`watch_progress_${movieId}_s${season}e${episode}`);
    if (savedTime) {
      videoRef.current.currentTime = parseFloat(savedTime);
    }
  }, [movieId, currentSource.type, season, episode]);

  // Save Progress Logic
  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const time = videoRef.current.currentTime;
      setCurrentTime(time);
      setDuration(videoRef.current.duration);
      if (movieId) {
        localStorage.setItem(`watch_progress_${movieId}_s${season}e${episode}`, time.toString());
      }
    }
  };

  // HLS logic
  useEffect(() => {
    setError(null);
    if (currentSource.type === 'iframe' || !videoRef.current) return;

    const video = videoRef.current;
    
    if (currentSource.type === 'hls' && Hls.isSupported()) {
      const hls = new Hls({ enableWorker: true, lowLatencyMode: true });
      hlsRef.current = hls;
      hls.loadSource(currentSource.src);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        setLevels(hls.levels);
        setIsLoading(false);
        video.play().catch(() => setIsPlaying(false));
      });
      hls.on(Hls.Events.ERROR, (_, data) => {
        if (data.fatal) setError('Failed to load video stream.');
      });
    } else {
      video.src = currentSource.src;
      video.onloadeddata = () => setIsLoading(false);
      video.play().catch(() => setIsPlaying(false));
    }

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [currentSource]);

  // Controls auto-hide
  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeout.current) clearTimeout(controlsTimeout.current);
    controlsTimeout.current = setTimeout(() => {
      setShowControls(false);
    }, 3000);
  };

  useEffect(() => {
    return () => {
      if (controlsTimeout.current) clearTimeout(controlsTimeout.current);
    };
  }, []);

  const switchSource = (index: number) => {
    if (!sources[index]) return;
    const s = sources[index];
    setActiveSourceIndex(index);
    setCurrentSource({ type: s.type as any, src: s.src });
    setIframeLoaded(false);
  };

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) videoRef.current.pause();
    else videoRef.current.play();
    setIsPlaying(!isPlaying);
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    if (videoRef.current) {
      videoRef.current.volume = val;
      videoRef.current.muted = val === 0;
      setIsMuted(val === 0);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    if (videoRef.current) {
      videoRef.current.currentTime = val;
      setCurrentTime(val);
    }
  };

  const skip = (seconds: number) => {
    if (videoRef.current) videoRef.current.currentTime += seconds;
  };

  const toggleFullScreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen();
      setIsFullScreen(true);
    } else {
      document.exitFullscreen();
      setIsFullScreen(false);
    }
  };

  const formatTime = (time: number) => {
    const h = Math.floor(time / 3600);
    const m = Math.floor((time % 3600) / 60);
    const s = Math.floor(time % 60);
    return `${h > 0 ? h + ':' : ''}${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const changeLevel = (level: number) => {
    setCurrentLevel(level);
    if (hlsRef.current) hlsRef.current.currentLevel = level;
  };

  return (
    <div 
      ref={containerRef}
      className="relative h-screen w-screen bg-black overflow-hidden select-none font-sans"
      onMouseMove={handleMouseMove}
      onDoubleClick={currentSource.type !== 'iframe' ? toggleFullScreen : undefined}
    >
      {/* Invisible Hover Zones to trigger controls over iframe */}
      <div className="absolute top-0 left-0 right-0 h-32 z-40" onMouseMove={handleMouseMove} onMouseEnter={handleMouseMove} />
      <div className="absolute bottom-0 left-0 right-0 h-32 z-40" onMouseMove={handleMouseMove} onMouseEnter={handleMouseMove} />

      {/* ── Top Bar (Back + Source Switcher Pill Buttons) ── */}
      <AnimatePresence>
        {showControls && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="absolute top-0 left-0 right-0 z-[60] flex items-start justify-between p-4 md:p-6 bg-gradient-to-b from-black/80 to-transparent pointer-events-none"
          >
            {/* Back button */}
            <button
              onClick={onBack}
              className="flex items-center gap-3 text-white hover:scale-105 transition active:scale-95 pointer-events-auto group/back"
            >
              <div className="bg-black/40 backdrop-blur-md p-2 rounded-full border border-white/10 group-hover/back:bg-white/20 transition">
                <ArrowLeft className="h-6 w-6 group-hover/back:-translate-x-1 transition-transform" />
              </div>
              <span className="text-lg md:text-xl font-bold drop-shadow-lg line-clamp-1">{title}</span>
            </button>

            {/* Source Switcher (Floating Pills) */}
            {sources.length > 1 && (
              <div className="flex flex-wrap justify-end gap-2 pointer-events-auto max-w-[50%]">
                {sources.map((s, i) => (
                  <button
                    key={i}
                    onClick={() => switchSource(i)}
                    className={cn(
                      "px-4 py-1.5 rounded-full text-xs md:text-sm font-bold transition-all shadow-xl backdrop-blur-md",
                      i === activeSourceIndex
                        ? "bg-white text-black scale-105"
                        : "bg-black/60 text-gray-300 border border-white/10 hover:bg-white/20 hover:text-white"
                    )}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Main Content ── */}
      {currentSource.type === 'iframe' ? (
        <div className="relative h-full w-full">
          {iframeUrl && (
            <iframe
              key={iframeUrl}
              src={iframeUrl}
              className="h-full w-full border-none"
              allowFullScreen
              allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
              title={title}
              referrerPolicy="no-referrer"
            />
          )}

          {/* Iframe loading overlay */}
          <AnimatePresence>
            {!iframeLoaded && (
              <motion.div
                initial={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black flex flex-col items-center justify-center z-10 pointer-events-none"
              >
                <Loader2 className="h-14 w-14 animate-spin text-arsh-red mb-4" />
                <p className="text-white/60 text-sm font-semibold tracking-wider uppercase">Loading stream</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ) : (
        <div className="relative h-full w-full flex items-center justify-center">
          <video
            ref={videoRef}
            className="h-full w-full"
            onTimeUpdate={handleTimeUpdate}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            onWaiting={() => setIsLoading(true)}
            onPlaying={() => setIsLoading(false)}
            onEnded={() => {}}
            onClick={togglePlay}
            playsInline
          />

          {isLoading && !error && (
            <div className="absolute inset-0 flex items-center justify-center z-40 bg-black/40 backdrop-blur-sm pointer-events-none">
              <Loader2 className="h-16 w-16 animate-spin text-arsh-red" />
            </div>
          )}

          {error && (
            <div className="absolute inset-0 flex flex-col items-center justify-center z-50 bg-black text-center p-4">
              <HelpCircle className="h-20 w-20 text-gray-500 mb-4" />
              <h2 className="text-2xl font-bold text-white mb-2">Stream Error</h2>
              <p className="text-gray-400 mb-6">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="bg-white text-black px-8 py-2 rounded-full font-bold hover:bg-gray-200 transition"
              >
                Reload Player
              </button>
            </div>
          )}

          {/* Custom ARSH.FLIX Native Controls */}
          <AnimatePresence>
            {(showControls || !isPlaying) && !error && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ duration: 0.3 }}
                className="absolute inset-0 z-50 flex flex-col justify-end bg-gradient-to-t from-black/90 via-black/20 to-transparent p-4 md:p-8 text-white pointer-events-none"
              >
                <div className="flex flex-col gap-6 pointer-events-auto max-w-full lg:max-w-[95%] mx-auto w-full">
                  <div className="group/progress relative flex flex-col gap-2">
                    <input
                      type="range"
                      min={0}
                      max={duration || 0}
                      value={currentTime}
                      onChange={handleSeek}
                      className="w-full h-1.5 bg-white/20 rounded-full appearance-none cursor-pointer accent-arsh-red group-hover/progress:h-2 transition-all"
                    />
                    <div className="flex justify-between text-sm font-semibold text-gray-300 px-1 mt-1">
                      <span>{formatTime(currentTime)}</span>
                      <span>{formatTime(duration)}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pb-4 px-2">
                    <div className="flex items-center gap-6 md:gap-10">
                      <button onClick={togglePlay} className="transition hover:scale-110 active:scale-90">
                        {isPlaying ? <Pause className="h-10 w-10 fill-current" /> : <Play className="h-10 w-10 fill-current" />}
                      </button>
                      <button onClick={() => skip(-10)} className="transition hover:scale-110 active:scale-90">
                        <RotateCcw className="h-8 w-8" />
                      </button>
                      <button onClick={() => skip(10)} className="transition hover:scale-110 active:scale-90">
                        <RotateCw className="h-8 w-8" />
                      </button>
                      <div className="flex items-center gap-4 group/volume">
                        <button onClick={toggleMute} className="transition hover:scale-110 active:scale-90">
                          {isMuted || volume === 0 ? <VolumeX className="h-8 w-8" /> : <Volume2 className="h-8 w-8" />}
                        </button>
                        <input
                          type="range"
                          min={0}
                          max={1}
                          step={0.1}
                          value={isMuted ? 0 : volume}
                          onChange={handleVolumeChange}
                          className="w-0 overflow-hidden group-hover/volume:w-24 transition-all duration-300 appearance-none h-1.5 bg-white/20 rounded-full accent-white cursor-pointer"
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-6 md:gap-8">
                      {levels.length > 0 && (
                        <div className="flex items-center gap-2 group/quality relative">
                          <Settings2 className="h-7 w-7 cursor-pointer hover:scale-110 transition" />
                          <div className="absolute bottom-full right-0 mb-4 invisible group-hover/quality:visible bg-black/90 backdrop-blur-md rounded-lg border border-white/10 p-2 min-w-[120px] shadow-2xl">
                            <p className="text-[10px] uppercase font-bold text-gray-500 mb-2 px-2 tracking-wider">Quality</p>
                            <div className="flex flex-col gap-1">
                              <button
                                onClick={() => changeLevel(-1)}
                                className={cn("text-xs font-semibold text-left px-3 py-1.5 rounded-md hover:bg-white/10", currentLevel === -1 && "text-arsh-red")}
                              >
                                Auto
                              </button>
                              {levels.map((l, i) => (
                                <button
                                  key={i}
                                  onClick={() => changeLevel(i)}
                                  className={cn("text-xs font-semibold text-left px-3 py-1.5 rounded-md hover:bg-white/10", currentLevel === i && "text-arsh-red")}
                                >
                                  {l.height}p
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                      
                      <button className="hover:scale-110 transition active:scale-90 hidden sm:block">
                        <Subtitles className="h-7 w-7 md:h-8 md:w-8" />
                      </button>
                      <button onClick={toggleFullScreen} className="hover:scale-110 transition active:scale-90">
                        {isFullScreen ? <Minimize2 className="h-7 w-7 md:h-8 md:w-8" /> : <Maximize2 className="h-7 w-7 md:h-8 md:w-8" />}
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

    </div>
  );
};

export default ArshPlayer;
