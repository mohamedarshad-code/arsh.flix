'use client';

import React, { useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Movie, fetchTopRated, fetchTrending, fetchByGenre } from '@/lib/tmdb';
import MovieCard from './MovieCard';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { getOptimizedImage } from '@/lib/tmdb';

interface TabbedMovieRowProps {
  title: string;
  icon?: React.ReactNode;
  initialMovies: Movie[];
  fetchMovies: () => Promise<Movie[]>;
  fetchSeries: () => Promise<Movie[]>;
  onMovieClick: (movie: Movie) => void;
}

const TabbedMovieRow = ({ title, icon, initialMovies, fetchMovies, fetchSeries, onMovieClick }: TabbedMovieRowProps) => {
  const rowRef = useRef<HTMLDivElement>(null);
  const [isMoved, setIsMoved] = useState(false);
  const [activeTab, setActiveTab] = useState<'movies' | 'series'>('movies');
  const [movies, setMovies] = useState<Movie[]>(initialMovies);
  const [loading, setLoading] = useState(false);

  const handleTabChange = async (tab: 'movies' | 'series') => {
    if (tab === activeTab) return;
    setActiveTab(tab);
    setLoading(true);
    try {
      const data = tab === 'movies' ? await fetchMovies() : await fetchSeries();
      setMovies(data);
    } catch (e) {
      console.error('Failed to fetch tab data:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialMovies && initialMovies.length > 0) {
      setMovies(initialMovies);
    }
  }, [initialMovies]);

  const handleClick = (direction: 'left' | 'right') => {
    setIsMoved(true);
    if (rowRef.current) {
      const { scrollLeft, clientWidth } = rowRef.current;
      const scrollTo = direction === 'left' ? scrollLeft - clientWidth : scrollLeft + clientWidth;
      rowRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
    }
  };

  return (
    <div className="space-y-2 md:space-y-4 px-4 lg:px-12 group/row">
      {/* Title + Tabs */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {icon && <span className="text-arsh-red text-xl font-black">{icon}</span>}
          <h2 className="cursor-pointer text-sm font-bold text-[#e5e5e5] transition duration-200 hover:text-white md:text-2xl">
            {title}
          </h2>
        </div>

        <div className="flex items-center gap-1 bg-white/5 rounded-full p-0.5 border border-white/10">
          <button
            onClick={() => handleTabChange('movies')}
            className={cn(
              "px-4 py-1.5 text-xs md:text-sm font-semibold rounded-full transition-all",
              activeTab === 'movies'
                ? "bg-white text-black"
                : "text-gray-400 hover:text-white"
            )}
          >
            Movies
          </button>
          <button
            onClick={() => handleTabChange('series')}
            className={cn(
              "px-4 py-1.5 text-xs md:text-sm font-semibold rounded-full transition-all",
              activeTab === 'series'
                ? "bg-white text-black"
                : "text-gray-400 hover:text-white"
            )}
          >
            Series
          </button>
        </div>
      </div>

      {/* Large poster cards row */}
      <div className="relative group overflow-hidden">
        <ChevronLeft
          className={`absolute top-0 bottom-0 left-0 z-40 m-auto h-full w-12 cursor-pointer opacity-0 transition hover:scale-125 hover:bg-black/50 group-hover/row:opacity-100 ${
            !isMoved && 'hidden'
          }`}
          onClick={() => handleClick('left')}
        />

        <div
          ref={rowRef}
          className="flex items-stretch space-x-3 overflow-x-scroll scrollbar-hide md:space-x-4 md:p-2"
        >
          {loading ? (
            <div className="flex items-center justify-center w-full h-64 text-white/40 text-sm">
              Loading...
            </div>
          ) : (
            movies.map((movie) => (
              <MovieCard key={movie.id} movie={movie} onClick={onMovieClick} />
            ))
          )}
        </div>

        <ChevronRight
          className="absolute top-0 bottom-0 right-0 z-40 m-auto h-full w-12 cursor-pointer opacity-0 transition hover:scale-125 hover:bg-black/50 group-hover/row:opacity-100"
          onClick={() => handleClick('right')}
        />
      </div>
    </div>
  );
};

export default TabbedMovieRow;
