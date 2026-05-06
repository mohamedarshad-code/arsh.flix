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
  fetchTopRated,
  fetchByGenre 
} from '@/lib/tmdb';
import { useWatchlist } from '@/hooks/useWatchlist';
import { motion } from 'framer-motion';

export default function MoviesPage() {
  const [trending, setTrending] = useState<Movie[]>([]);
  const [topRated, setTopRated] = useState<Movie[]>([]);
  const [action, setAction] = useState<Movie[]>([]);
  const [horror, setHorror] = useState<Movie[]>([]);
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const { watchlist } = useWatchlist();

  useEffect(() => {
    const loadData = async () => {
      const [trendingData, topRatedData, actionData, horrorData] = await Promise.all([
        fetchTrending('movie'),
        fetchTopRated('movie'),
        fetchByGenre('movie', 28), // Action
        fetchByGenre('movie', 27), // Horror
      ]);

      setTrending(trendingData);
      setTopRated(topRatedData);
      setAction(actionData);
      setHorror(horrorData);
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
        {trending.length > 0 && <Hero movies={trending.slice(0, 5)} />}

        <section className="relative z-10 -mt-32 md:-mt-48 space-y-12">
          <MovieRow title="Movies Trending Now" movies={trending} onMovieClick={handleMovieClick} />
          <MovieRow title="Top Rated Movies" movies={topRated} onMovieClick={handleMovieClick} />
          <MovieRow title="Action Movies" movies={action} onMovieClick={handleMovieClick} />
          <MovieRow title="Horror Movies" movies={horror} onMovieClick={handleMovieClick} />
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
