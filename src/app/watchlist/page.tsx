'use client';

import { useState } from 'react';
import Navbar from '@/components/Navbar';
import MovieCard from '@/components/MovieCard';
import MovieDetailModal from '@/components/MovieDetailModal';
import SearchOverlay from '@/components/SearchOverlay';
import { Movie } from '@/lib/tmdb';
import { useWatchlist } from '@/hooks/useWatchlist';
import { motion } from 'framer-motion';

export default function WatchlistPage() {
  const { watchlist } = useWatchlist();
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const handleMovieClick = (movie: Movie) => {
    setSelectedMovie(movie);
    setIsModalOpen(true);
    setIsSearchOpen(false);
  };

  return (
    <main className="relative min-h-screen bg-[#141414] pb-24">
      <Navbar onSearchClick={() => setIsSearchOpen(true)} />
      
      <div className="pt-24 px-4 lg:px-16">
        <h1 className="text-2xl font-bold text-white md:text-4xl mb-8">My List</h1>
        
        {watchlist.length > 0 ? (
          <div className="grid grid-cols-2 gap-x-4 gap-y-12 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {watchlist.map((movie) => (
              <motion.div 
                key={movie.id} 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <MovieCard movie={movie} onClick={handleMovieClick} />
                <p className="text-sm font-medium text-white truncate px-1 mt-2">
                  {movie.title || movie.name}
                </p>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center mt-32 text-gray-500">
            <p className="text-xl">You haven't added anything to your list yet.</p>
          </div>
        )}
      </div>

      <MovieDetailModal 
        movie={selectedMovie} 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />

      <SearchOverlay 
        isOpen={isSearchOpen} 
        onClose={() => setIsSearchOpen(false)} 
        onMovieClick={handleMovieClick}
      />
    </main>
  );
}
