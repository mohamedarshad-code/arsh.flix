'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { Movie, fetchDetails } from '@/lib/tmdb';
import ArshPlayer from '@/components/ArshPlayer';
import { Loader2, Server, AlertCircle } from 'lucide-react';

export default function WatchPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const [movie, setMovie] = useState<any>(null);
  const [streamData, setStreamData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const id = params.id as string;
  const season = searchParams.get('s') || '1';
  const episode = searchParams.get('e') || '1';
  const type = searchParams.get('type') || 'movie';

  useEffect(() => {
    async function loadPlayback() {
      setLoading(true);
      setError(null);
      
      try {
        // 1. Fetch metadata from TMDB
        const movieData = await fetchDetails(type as 'movie' | 'tv', parseInt(id));
        setMovie(movieData);

        // 2. Fetch playable stream from our API
        // The API route resolves the correct series-level IMDB ID server-side
        const response = await fetch(
          `/api/stream/${id}?type=${type}&s=${season}&e=${episode}`
        );
        
        const data = await response.json();
        
        if (!response.ok || !data.source) {
          throw new Error(data.message || 'Stream not found on 8StreamApi');
        }
        
        setStreamData(data);
      } catch (err: any) {
        console.error('Playback Error:', err);
        setError(err.message || 'An unexpected error occurred while loading the video.');
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      loadPlayback();
    }
  }, [id, type, season, episode]);

  if (loading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-black text-arsh-red">
        <Loader2 className="h-12 w-12 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col h-screen w-screen items-center justify-center bg-black text-white p-4 text-center">
        <AlertCircle className="h-16 w-16 text-arsh-red mb-4" />
        <h2 className="text-2xl font-bold mb-2">Unable to load video</h2>
        <p className="text-gray-400 mb-8 max-w-md">{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="bg-white text-black px-8 py-2 rounded-md font-bold hover:bg-white/80 transition"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (!movie || !streamData) return null;

  return (
    <div className="relative h-screen w-screen bg-black">
      <ArshPlayer 
        source={streamData.source} 
        sources={streamData.sources}
        title={movie.title || movie.name} 
        onBack={() => router.back()} 
        movieId={movie.id}
        type={type as 'movie' | 'tv'}
        posterPath={movie.poster_path}
        backdropPath={movie.backdrop_path}
        overview={movie.overview}
        voteAverage={movie.vote_average}
        season={type === 'tv' ? parseInt(season) : undefined}
        episode={type === 'tv' ? parseInt(episode) : undefined}
      />
    </div>
  );
}
