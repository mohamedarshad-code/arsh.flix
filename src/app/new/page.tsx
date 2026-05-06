'use client';

import { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import MovieRow from '@/components/MovieRow';
import MovieDetailModal from '@/components/MovieDetailModal';
import SearchOverlay from '@/components/SearchOverlay';
import { 
  Movie, 
  fetchTrending, 
  fetchTopRated
} from '@/lib/tmdb';
import { useWatchlist } from '@/hooks/useWatchlist';
import { motion } from 'framer-motion';

export default function NewPage() {
  const [trendingAll, setTrendingAll] = useState<Movie[]>([]);
  const [trendingMovies, setTrendingMovies] = useState<Movie[]>([]);
  const [trendingTV, setTrendingTV] = useState<Movie[]>([]);
  const [topRated, setTopRated] = useState<Movie[]>([]);
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      const [all, movies, tv, top] = await Promise.all([
        fetchTrending('all'),
        fetchTrending('movie'),
        fetchTrending('tv'),
        fetchTopRated('movie'),
      ]);

      setTrendingAll(all);
      setTrendingMovies(movies);
      setTrendingTV(tv);
      setTopRated(top);
    };

    loadData();
  }, []);

  const handleMovieClick = (movie: Movie) => {
    setSelectedMovie(movie);
    setIsModalOpen(true);
    setIsSearchOpen(false);
  };

  return (
    <main className="relative min-h-screen bg-[#141414] pb-24">
      <Navbar onSearchClick={() => setIsSearchOpen(true)} />
      
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      >
        {trendingAll.length > 0 && <Hero movies={trendingAll.slice(0, 5)} />}

        <section className="relative z-10 -mt-32 md:-mt-48 space-y-12">
          <MovieRow title="New & Popular" movies={trendingAll} onMovieClick={handleMovieClick} />
          <MovieRow title="Popular Movies" movies={trendingMovies} onMovieClick={handleMovieClick} />
          <MovieRow title="Popular TV Shows" movies={trendingTV} onMovieClick={handleMovieClick} />
          <MovieRow title="Top Rated Hits" movies={topRated} onMovieClick={handleMovieClick} />
        </section>
      </motion.div>

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
