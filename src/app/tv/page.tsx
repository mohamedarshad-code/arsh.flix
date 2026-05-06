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
  fetchArshOriginals, 
  fetchByGenre 
} from '@/lib/tmdb';
import { useWatchlist } from '@/hooks/useWatchlist';
import { motion } from 'framer-motion';

export default function TVPage() {
  const [trending, setTrending] = useState<Movie[]>([]);
  const [originals, setOriginals] = useState<Movie[]>([]);
  const [action, setAction] = useState<Movie[]>([]);
  const [comedy, setComedy] = useState<Movie[]>([]);
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const { watchlist } = useWatchlist();

  useEffect(() => {
    const loadData = async () => {
      const [trendingData, originalsData, actionData, comedyData] = await Promise.all([
        fetchTrending('tv'),
        fetchArshOriginals(),
        fetchByGenre('tv', 10759), // Action & Adventure
        fetchByGenre('tv', 35),    // Comedy
      ]);

      setTrending(trendingData);
      setOriginals(originalsData);
      setAction(actionData);
      setComedy(comedyData);
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
        {originals.length > 0 && <Hero movies={originals.slice(0, 5)} />}

        <section className="relative z-10 -mt-32 md:-mt-48 space-y-12">
          <MovieRow title="TV Shows Trending Now" movies={trending} onMovieClick={handleMovieClick} />
          <MovieRow title="ARSH.FLIX Originals" movies={originals} onMovieClick={handleMovieClick} />
          <MovieRow title="Action & Adventure TV" movies={action} onMovieClick={handleMovieClick} />
          <MovieRow title="Comedy TV Shows" movies={comedy} onMovieClick={handleMovieClick} />
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
