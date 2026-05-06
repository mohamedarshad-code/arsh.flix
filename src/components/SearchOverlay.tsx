'use client';

import React, { useState, useEffect } from 'react';
import { Search as SearchIcon, X } from 'lucide-react';
import { Movie, searchContent } from '@/lib/tmdb';
import MovieCard from './MovieCard';
import { motion, AnimatePresence } from 'framer-motion';

interface SearchOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  onMovieClick: (movie: Movie) => void;
}

const SearchOverlay = ({ isOpen, onClose, onMovieClick }: SearchOverlayProps) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Movie[]>([]);

  useEffect(() => {
    if (!query) {
      setResults([]);
      return;
    }

    const delayDebounceFn = setTimeout(async () => {
      const searchResults = await searchContent(query);
      setResults(searchResults.filter(m => m.backdrop_path || m.poster_path));
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1.1 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="fixed inset-0 z-[100] bg-[#141414] overflow-y-auto scrollbar-hide"
        >
          <div className="sticky top-0 z-[110] flex items-center justify-between bg-[#141414]/95 backdrop-blur-md px-6 py-6 lg:px-16 border-b border-white/10">
            <div className="flex flex-1 items-center gap-6">
              <SearchIcon className="h-7 w-7 text-gray-400" />
              <input
                autoFocus
                type="text"
                placeholder="Titles, people, genres"
                className="w-full bg-transparent text-2xl text-white outline-none placeholder:text-gray-600 lg:text-4xl font-light"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
            <button onClick={onClose} className="text-white hover:scale-110 transition active:scale-90 ml-6">
              <X className="h-10 w-10" />
            </button>
          </div>

          <div className="px-6 py-12 lg:px-16">
            {results.length > 0 ? (
              <div className="grid grid-cols-2 gap-x-4 gap-y-10 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                {results.map((movie) => (
                  <motion.div 
                    key={movie.id} 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col gap-2"
                  >
                    <MovieCard movie={movie} onClick={onMovieClick} />
                    <p className="text-xs font-bold text-gray-400 truncate px-1 mt-1 uppercase tracking-wider">
                      {movie.title || movie.name}
                    </p>
                  </motion.div>
                ))}
              </div>
            ) : query ? (
              <div className="flex flex-col items-center justify-center mt-32 text-gray-500">
                <p className="text-xl">Your search for "{query}" did not have any matches.</p>
                <ul className="mt-4 list-disc text-sm space-y-1">
                  <li>Try different keywords</li>
                  <li>Looking for a movie or TV show?</li>
                  <li>Try using a movie title or actor name</li>
                </ul>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center mt-32 text-gray-600">
                <SearchIcon className="h-20 w-20 opacity-20 mb-4" />
                <p className="text-xl font-medium">Search for your favorite movies and shows</p>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SearchOverlay;
