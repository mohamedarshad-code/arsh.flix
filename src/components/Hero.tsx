'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Play, Info } from 'lucide-react';
import { Movie, getOptimizedImage } from '@/lib/tmdb';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

interface HeroProps {
  movies: Movie[];
}

const Hero = ({ movies }: HeroProps) => {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [imageLoaded, setImageLoaded] = useState(false);
  const movie = movies[currentIndex];

  // Auto-slide every 8 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setImageLoaded(false);
      setCurrentIndex((prev) => (prev + 1) % movies.length);
    }, 8000);
    return () => clearInterval(timer);
  }, [movies.length]);

  const handlePlay = () => {
    const type = movie.media_type || (movie.first_air_date ? 'tv' : 'movie');
    router.push(`/watch/${movie.id}?type=${type}`);
  };

  const goToSlide = (index: number) => {
    if (index === currentIndex) return;
    setImageLoaded(false);
    setCurrentIndex(index);
  };

  return (
    <div className="relative h-[85vh] w-full bg-[#141414] lg:h-[95vh] overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.div
          key={movie.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8 }}
          className="absolute inset-0"
        >
          {/* Background Image Container */}
          <div className="absolute inset-0">
            {!imageLoaded && (
              <div className="absolute inset-0 bg-[#141414] animate-pulse" />
            )}
            
            {movie?.backdrop_path && (
              <img
                src={getOptimizedImage(movie.backdrop_path, 'w1280')}
                alt={movie.title || movie.name || 'Hero Image'}
                className={cn(
                  "h-full w-full object-cover transition-all duration-1000 ease-in-out",
                  imageLoaded ? "opacity-100 scale-100" : "opacity-0 scale-110"
                )}
                onLoad={() => setImageLoaded(true)}
                loading="eager"
              />
            )}
            
            <div className="absolute inset-0 bg-gradient-to-t from-[#141414] via-[#141414]/40 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#141414] via-transparent to-transparent" />
          </div>

        {/* Content Container */}
        <div className="relative z-10 flex h-full flex-col justify-center space-y-2 md:space-y-4 px-4 lg:px-16 pt-20">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="flex items-center gap-2 mb-1 md:mb-2"
          >
            <div className="bg-arsh-red p-1 rounded-sm shadow-lg">
              <svg width="10" height="10" viewBox="0 0 24 24" className="fill-white md:w-3 md:h-3">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14.5v-9l6 4.5-6 4.5z" />
              </svg>
            </div>
            <span className="text-[10px] md:text-xs font-bold tracking-widest text-white uppercase drop-shadow-md">
              {movie.media_type === 'tv' || movie.first_air_date ? 'Series' : 'Movie'} • Daily Trending
            </span>
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="text-3xl font-extrabold text-white md:text-6xl lg:text-8xl max-w-4xl drop-shadow-2xl leading-tight"
          >
            {movie?.title || movie?.name}
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="max-w-[280px] text-xs text-white/90 drop-shadow-md md:max-w-lg md:text-xl lg:max-w-2xl line-clamp-3 md:line-clamp-none"
          >
            {movie?.overview}
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.5 }}
            className="flex items-center space-x-2 md:space-x-3 pt-2 md:pt-4"
          >
            <button 
              onClick={handlePlay}
              className="flex items-center gap-x-2 md:gap-x-3 rounded bg-white px-4 py-1.5 md:px-6 md:py-2.5 text-sm md:text-lg font-bold text-black transition-all hover:bg-white/80 active:scale-95 shadow-lg"
            >
              <Play className="h-4 w-4 md:h-6 md:w-6 fill-current" /> Play
            </button>
            <button className="flex items-center gap-x-2 md:gap-x-3 rounded bg-[#6d6d6eb3] px-4 py-1.5 md:px-6 md:py-2.5 text-sm md:text-lg font-bold text-white transition-all hover:bg-[#6d6d6e66] active:scale-95 shadow-lg backdrop-blur-md">
              <Info className="h-4 w-4 md:h-6 md:w-6" /> More Info
            </button>
          </motion.div>
        </div>
        </motion.div>
      </AnimatePresence>

      {/* Slide Indicators */}
      <div className="absolute bottom-10 right-4 lg:right-16 z-30 flex gap-2">
        {movies.map((_, i) => (
          <button
            key={i}
            onClick={() => goToSlide(i)}
            className={cn(
              "h-1.5 transition-all duration-300 rounded-full",
              i === currentIndex ? "w-8 bg-arsh-red" : "w-4 bg-white/30 hover:bg-white/50"
            )}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

export default Hero;
