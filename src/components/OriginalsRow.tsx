'use client';

import React, { useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, ChevronUp, ChevronDown } from 'lucide-react';
import { Movie, fetchByNetwork } from '@/lib/tmdb';
import MovieCard from './MovieCard';
import Image from 'next/image';
import { AnimatePresence, motion } from 'framer-motion';

const NETWORKS = [
  { id: 213,  name: 'Netflix',       color: '#E50914', icon: 'N' },
  { id: 1024, name: 'Prime Video',   color: '#00A8E1', icon: 'P' },
  { id: 3186, name: 'Max',           color: '#741DFF', icon: 'M' },
  { id: 2739, name: 'Disney+',       color: '#113CCF', icon: 'D+' },
  { id: 2552, name: 'Apple TV+',     color: '#555555', icon: '▶' },
  { id: 4330, name: 'Paramount+',    color: '#0064FF', icon: 'P+' },
  { id: 453,  name: 'Hulu',          color: '#1CE783', icon: 'H' },
];

interface OriginalsRowProps {
  initialMovies: Movie[];
  onMovieClick: (movie: Movie) => void;
}

const OriginalsRow = ({ initialMovies, onMovieClick }: OriginalsRowProps) => {
  const rowRef = useRef<HTMLDivElement>(null);
  const [isMoved, setIsMoved] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedNetwork, setSelectedNetwork] = useState(NETWORKS[0]);
  const [movies, setMovies] = useState<Movie[]>(initialMovies);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, []);

  useEffect(() => {
    if (initialMovies && initialMovies.length > 0) {
      setMovies(initialMovies);
    }
  }, [initialMovies]);

  const handleNetworkChange = async (network: typeof NETWORKS[0]) => {
    setSelectedNetwork(network);
    setShowDropdown(false);
    setLoading(true);
    try {
      const data = await fetchByNetwork(network.id);
      setMovies(data);
    } catch (e) {
      console.error('Failed to fetch network data:', e);
    } finally {
      setLoading(false);
    }
  };

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
      {/* Title with provider dropdown */}
      <div className="flex items-center gap-2" ref={dropdownRef}>
        <span className="text-arsh-red text-xl font-black">|</span>
        <h2 className="text-sm font-bold text-[#e5e5e5] md:text-2xl">Only on</h2>
        
        <div className="relative">
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="flex items-center gap-1.5 text-sm font-bold text-white md:text-2xl hover:text-gray-300 transition cursor-pointer border-b border-dashed border-white/40 pb-0.5"
          >
            {selectedNetwork.name}
            {showDropdown ? <ChevronUp className="h-4 w-4 md:h-5 md:w-5" /> : <ChevronDown className="h-4 w-4 md:h-5 md:w-5" />}
          </button>

          <AnimatePresence>
            {showDropdown && (
              <motion.div
                initial={{ opacity: 0, y: -8, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className="absolute left-0 top-full mt-2 z-50 bg-[#141414] border border-white/15 rounded-lg overflow-hidden shadow-2xl min-w-[200px] backdrop-blur-xl"
              >
                {NETWORKS.map((network) => (
                  <button
                    key={network.id}
                    onClick={() => handleNetworkChange(network)}
                    className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium hover:bg-white/10 transition ${
                      selectedNetwork.id === network.id ? 'bg-white/5 text-white' : 'text-gray-300'
                    }`}
                  >
                    <span
                      className="flex h-7 w-7 items-center justify-center rounded-md text-xs font-black text-white shrink-0"
                      style={{ backgroundColor: network.color }}
                    >
                      {network.icon}
                    </span>
                    <span>{network.name}</span>
                    {selectedNetwork.id === network.id && (
                      <span className="ml-auto h-2 w-2 rounded-full bg-arsh-red" />
                    )}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Movies row */}
      <div className="relative group overflow-hidden">
        <ChevronLeft
          className={`absolute top-0 bottom-0 left-0 z-40 m-auto h-full w-12 cursor-pointer opacity-0 transition hover:scale-125 hover:bg-black/50 group-hover/row:opacity-100 ${
            !isMoved && 'hidden'
          }`}
          onClick={() => handleClick('left')}
        />

        <div
          ref={rowRef}
          className="flex items-start space-x-1.5 overflow-x-scroll scrollbar-hide md:space-x-2.5 md:p-2"
        >
          {loading ? (
            <div className="flex items-center justify-center w-full h-36 text-white/40 text-sm">
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

export default OriginalsRow;
