'use client';

import { useState, useEffect } from 'react';
import { Movie } from '@/lib/tmdb';

export const useWatchlist = () => {
  const [watchlist, setWatchlist] = useState<Movie[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('arshflix-watchlist');
    if (saved) {
      setWatchlist(JSON.parse(saved));
    }
  }, []);

  const addToWatchlist = (movie: Movie) => {
    const updated = [...watchlist, movie];
    setWatchlist(updated);
    localStorage.setItem('arshflix-watchlist', JSON.stringify(updated));
  };

  const removeFromWatchlist = (movieId: number) => {
    const updated = watchlist.filter((m) => m.id !== movieId);
    setWatchlist(updated);
    localStorage.setItem('arshflix-watchlist', JSON.stringify(updated));
  };

  const isInWatchlist = (movieId: number) => {
    return watchlist.some((m) => m.id === movieId);
  };

  return { watchlist, addToWatchlist, removeFromWatchlist, isInWatchlist };
};
