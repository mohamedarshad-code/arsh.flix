'use client';

import { useEffect, useState, useMemo } from 'react';
import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import MovieRow from '@/components/MovieRow';
import OriginalsRow from '@/components/OriginalsRow';
import TabbedMovieRow from '@/components/TabbedMovieRow';
import MovieDetailModal from '@/components/MovieDetailModal';
import SearchOverlay from '@/components/SearchOverlay';
import { 
  Movie, 
  fetchTrending, 
  fetchTopRated, 
  fetchArshOriginals, 
  fetchByGenre,
} from '@/lib/tmdb';
import { useWatchlist } from '@/hooks/useWatchlist';
import { useWatchHistory } from '@/hooks/useWatchHistory';
import { motion } from 'framer-motion';

export default function Home() {
  const [trending, setTrending] = useState<Movie[]>([]);
  const [topRated, setTopRated] = useState<Movie[]>([]);
  const [originals, setOriginals] = useState<Movie[]>([]);
  const [action, setAction] = useState<Movie[]>([]);
  const [comedy, setComedy] = useState<Movie[]>([]);
  const [trendingMovies, setTrendingMovies] = useState<Movie[]>([]);
  const [trendingSeries, setTrendingSeries] = useState<Movie[]>([]);
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const { watchlist } = useWatchlist();
  const { historyAsMovies } = useWatchHistory();

  useEffect(() => {
    const loadData = async () => {
      const [trendingData, topRatedData, originalsData, actionData, comedyData, trendingMoviesData, trendingSeriesData] = await Promise.all([
        fetchTrending(),
        fetchTopRated(),
        fetchArshOriginals(),
        fetchByGenre('movie', 28), // Action
        fetchByGenre('movie', 35), // Comedy
        fetchTrending('movie'),
        fetchTrending('tv'),
      ]);

      setTrending(trendingData);
      setTopRated(topRatedData);
      setOriginals(originalsData);
      setAction(actionData);
      setComedy(comedyData);
      setTrendingMovies(trendingMoviesData);
      setTrendingSeries(trendingSeriesData);
    };

    loadData();
  }, []);

  const handleMovieClick = (movie: Movie) => {
    setSelectedMovie(movie);
    setIsModalOpen(true);
    setIsSearchOpen(false);
  };

  const heroItems = useMemo(() => {
    if (trendingMovies.length === 0 || trendingSeries.length === 0) return [];
    // 4 Trending Movies + 1 Trending Series
    const movies = trendingMovies.slice(0, 4);
    const series = trendingSeries.slice(0, 1);
    return [...movies, ...series].sort(() => Math.random() - 0.5); // Randomize order
  }, [trendingMovies, trendingSeries]);

  return (
    <main className="relative min-h-screen bg-[#141414] pb-24">
      <Navbar onSearchClick={() => setIsSearchOpen(true)} />
      
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      >
        {heroItems.length > 0 && <Hero movies={heroItems} />}

        <section className="relative z-10 -mt-32 md:-mt-48 space-y-12">
          {historyAsMovies.length > 0 && (
            <MovieRow title="Continue Watching" movies={historyAsMovies} onMovieClick={handleMovieClick} />
          )}
          {watchlist.length > 0 && (
            <MovieRow title="My List" movies={watchlist} onMovieClick={handleMovieClick} />
          )}

          {/* Trending with Movies/Series tabs */}
          <TabbedMovieRow 
            title="Trending Today"
            initialMovies={trendingMovies}
            fetchMovies={() => fetchTrending('movie')}
            fetchSeries={() => fetchTrending('tv')}
            onMovieClick={handleMovieClick}
          />

          {/* Only on Netflix / Provider Dropdown */}
          <OriginalsRow initialMovies={originals} onMovieClick={handleMovieClick} />

          {/* Top Rated with Movies/Series tabs */}
          <TabbedMovieRow
            title="Top rated"
            icon="🏆"
            initialMovies={topRated}
            fetchMovies={() => fetchTopRated('movie')}
            fetchSeries={() => fetchTopRated('tv')}
            onMovieClick={handleMovieClick}
          />

          <MovieRow title="Action Movies" movies={action} onMovieClick={handleMovieClick} />

          {/* Comedy with Movies/Series tabs */}
          <TabbedMovieRow
            title="Comedy"
            initialMovies={comedy}
            fetchMovies={() => fetchByGenre('movie', 35)}
            fetchSeries={() => fetchByGenre('tv', 35)}
            onMovieClick={handleMovieClick}
          />
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
