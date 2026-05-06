'use client';

import { useState, useEffect } from 'react';
import { Movie } from '@/lib/tmdb';

export interface HistoryEntry {
  id: number;
  type: 'movie' | 'tv';
  title: string;
  poster_path: string;
  backdrop_path: string;
  overview: string;
  vote_average: number;
  season?: number;
  episode?: number;
  progress?: number; // seconds watched
  duration?: number; // total seconds
  timestamp: number; // Date.now()
}

const HISTORY_KEY = 'arshflix-watch-history';
const MAX_HISTORY = 30;

export const useWatchHistory = () => {
  const [history, setHistory] = useState<HistoryEntry[]>([]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(HISTORY_KEY);
      if (saved) setHistory(JSON.parse(saved));
    } catch {
      // ignore parse errors
    }
  }, []);

  const addToHistory = (entry: Omit<HistoryEntry, 'timestamp'>) => {
    setHistory(prev => {
      // Remove existing entry for same id+type so it moves to front
      const filtered = prev.filter(h => !(h.id === entry.id && h.type === entry.type));
      const updated = [{ ...entry, timestamp: Date.now() }, ...filtered].slice(0, MAX_HISTORY);
      localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
      return updated;
    });
  };

  const removeFromHistory = (id: number, type: 'movie' | 'tv') => {
    setHistory(prev => {
      const updated = prev.filter(h => !(h.id === id && h.type === type));
      localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
      return updated;
    });
  };

  const clearHistory = () => {
    localStorage.removeItem(HISTORY_KEY);
    setHistory([]);
  };

  // Convert history entries to Movie shape for MovieRow
  const historyAsMovies = history.map(h => ({
    id: h.id,
    title: h.title,
    name: h.title,
    overview: h.overview,
    poster_path: h.poster_path,
    backdrop_path: h.backdrop_path,
    vote_average: h.vote_average,
    media_type: h.type,
  } as Movie));

  return { history, historyAsMovies, addToHistory, removeFromHistory, clearHistory };
};
