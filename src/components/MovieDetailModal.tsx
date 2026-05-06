'use client';

import React, { useEffect, useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { useRouter } from 'next/navigation';
import { X, Play, Plus, Check, ThumbsUp, ChevronDown, Volume2 } from 'lucide-react';
import { Movie, MovieDetails, Episode, fetchDetails, fetchEpisodes, getOptimizedImage } from '@/lib/tmdb';
import { useWatchlist } from '@/hooks/useWatchlist';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';

interface MovieDetailModalProps {
  movie: Movie | null;
  isOpen: boolean;
  onClose: () => void;
}

const MovieDetailModal = ({ movie, isOpen, onClose }: MovieDetailModalProps) => {
  const router = useRouter();
  const [details, setDetails] = useState<MovieDetails | null>(null);
  const [selectedSeason, setSelectedSeason] = useState(1);
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const { addToWatchlist, removeFromWatchlist, isInWatchlist } = useWatchlist();

  const inWatchlist = movie ? isInWatchlist(movie.id) : false;
  const isTV = movie?.media_type === 'tv' || !!movie?.first_air_date;

  useEffect(() => {
    if (movie && isOpen) {
      const type = isTV ? 'tv' : 'movie';
      fetchDetails(type, movie.id).then((data) => {
        setDetails(data);
        if (type === 'tv' && data.seasons && data.seasons.length > 0) {
          // Find the first actual season (usually 1, sometimes 0)
          const firstSeason = data.seasons.find((s: any) => s.season_number > 0)?.season_number || data.seasons[0].season_number;
          setSelectedSeason(firstSeason);
        }
      });
    }
  }, [movie, isOpen, isTV]);

  useEffect(() => {
    if (details && isTV && movie) {
      fetchEpisodes(movie.id, selectedSeason).then(setEpisodes);
    }
  }, [selectedSeason, details, movie, isTV]);

  const handlePlay = (epNumber?: number) => {
    if (!movie) return;
    const type = isTV ? 'tv' : 'movie';
    let url = `/watch/${movie.id}?type=${type}`;
    if (isTV) {
      url += `&s=${selectedSeason}&e=${epNumber || 1}`;
    }
    router.push(url);
  };

  const handleToggleWatchlist = () => {
    if (!movie) return;
    if (inWatchlist) removeFromWatchlist(movie.id);
    else addToWatchlist(movie);
  };

  if (!movie) return null;

  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-full max-w-4xl -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-xl bg-[#181818] shadow-2xl outline-none ring-1 ring-white/10 max-h-[90vh] overflow-y-auto scrollbar-hide">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
          >
            {/* Header / Backdrop Area */}
            <div className="relative aspect-video w-full">
              <Image
                src={getOptimizedImage(movie.backdrop_path || movie.poster_path, 'original')}
                alt={movie.title || movie.name || 'Backdrop'}
                fill
                className="object-cover"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#181818] via-transparent to-transparent" />
              
              <div className="absolute bottom-12 left-8 md:left-12 flex flex-col gap-6 w-full max-w-xl">
                <Dialog.Title asChild>
                  <h2 className="text-4xl font-black text-white md:text-6xl drop-shadow-2xl uppercase tracking-tighter">
                    {movie.title || movie.name}
                  </h2>
                </Dialog.Title>
                <Dialog.Description className="sr-only">
                  {movie.overview}
                </Dialog.Description>
                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => handlePlay()}
                    className="flex items-center gap-x-2 rounded-md bg-white px-8 py-2.5 text-xl font-bold text-black transition hover:bg-white/80 active:scale-95"
                  >
                    <Play className="h-7 w-7 fill-current" /> Play
                  </button>
                  <button 
                    onClick={handleToggleWatchlist}
                    className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-white/50 bg-black/40 text-white transition hover:border-white hover:bg-white/10 active:scale-90"
                  >
                    {inWatchlist ? <Check className="h-7 w-7" /> : <Plus className="h-7 w-7" />}
                  </button>
                  <button className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-white/50 bg-black/40 text-white transition hover:border-white hover:bg-white/10 active:scale-90 ml-auto mr-20">
                    <ThumbsUp className="h-6 w-6" />
                  </button>
                </div>
              </div>

              <Dialog.Close asChild>
                <button className="absolute right-6 top-6 z-50 flex h-10 w-10 items-center justify-center rounded-full bg-[#181818]/80 text-white hover:bg-white/20 transition-all border border-white/10 shadow-xl">
                  <X className="h-6 w-6" />
                </button>
              </Dialog.Close>
            </div>

            {/* Content Area */}
            <div className="grid grid-cols-1 gap-12 p-8 md:grid-cols-3 md:p-12">
              {/* Main Info */}
              <div className="col-span-2 space-y-8">
                <div className="flex items-center gap-3 text-sm font-bold md:text-lg">
                  <span className="text-green-400">
                    {Math.round(movie.vote_average * 10)}% Match
                  </span>
                  <span className="text-gray-400">
                    {movie.release_date?.split('-')[0] || movie.first_air_date?.split('-')[0]}
                  </span>
                  <span className="flex h-5 items-center justify-center border border-white/40 px-1.5 text-[10px] text-white">
                    16+
                  </span>
                  {details?.number_of_seasons && (
                    <span className="text-gray-300">{details.number_of_seasons} Seasons</span>
                  )}
                  <span className="flex h-5 items-center justify-center border border-white/40 px-1.5 text-[10px] text-white">
                    HD
                  </span>
                </div>

                <p className="text-lg leading-relaxed text-white">
                  {movie.overview}
                </p>

                {/* Episodes Section for TV Shows */}
                {isTV && details?.seasons && (
                  <div className="pt-8">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-3xl font-bold text-white">Episodes</h3>
                      <div className="relative group">
                        <select
                          value={selectedSeason}
                          onChange={(e) => setSelectedSeason(Number(e.target.value))}
                          className="appearance-none bg-[#242424] text-white rounded-md px-6 py-2.5 text-sm font-bold border border-white/20 outline-none hover:bg-[#2f2f2f] cursor-pointer pr-10 shadow-lg"
                        >
                          {details.seasons.filter(s => s.season_number > 0).map((s) => (
                            <option key={s.id} value={s.season_number}>
                              Season {s.season_number}
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 pointer-events-none text-gray-400" />
                      </div>
                    </div>

                    <div className="space-y-1">
                      {episodes.map((episode, index) => (
                        <div 
                          key={episode.id}
                          onClick={() => handlePlay(episode.episode_number)}
                          className="flex cursor-pointer items-center gap-6 rounded-lg p-6 transition-all hover:bg-[#2f2f2f] group/ep"
                        >
                          <span className="w-8 text-center text-2xl font-bold text-gray-500 group-hover/ep:text-white transition-colors">
                            {index + 1}
                          </span>
                          <div className="relative h-20 w-32 shrink-0 overflow-hidden rounded-md md:h-28 md:w-48 shadow-lg">
                            <Image 
                              src={getOptimizedImage(episode.still_path || movie.backdrop_path, 'w500')} 
                              alt="" 
                              fill 
                              sizes="(max-width: 768px) 130px, 200px"
                              className="object-cover transition-transform group-hover/ep:scale-110"
                            />
                            <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover/ep:opacity-100">
                              <Play className="h-10 w-10 fill-white text-white" />
                            </div>
                            {/* Duration badge */}
                            <div className="absolute bottom-2 right-2 rounded bg-black/60 px-1 text-[10px] text-white">
                               {episode.runtime || 45}m
                            </div>
                          </div>
                          <div className="flex flex-col justify-center gap-1 overflow-hidden">
                            <h4 className="truncate font-bold md:text-xl text-white group-hover/ep:text-arsh-red transition-colors">
                              {episode.name}
                            </h4>
                            <p className="line-clamp-2 text-sm text-gray-400 md:text-base leading-snug">
                              {episode.overview || 'No description available for this episode.'}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Sidebar Detail */}
              <div className="space-y-8 text-sm">
                <div>
                  <span className="text-gray-500 text-base">Cast: </span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {details?.credits?.cast?.slice(0, 5).map((person: any, i: number) => (
                      <span key={person.id} className="text-white hover:underline cursor-pointer">
                        {person.name}{i < 4 ? ', ' : ''}
                      </span>
                    ))}
                    {details?.credits?.cast?.length && details.credits.cast.length > 5 && (
                      <span className="text-gray-500 italic"> more</span>
                    )}
                  </div>
                </div>

                <div>
                  <span className="text-gray-500 text-base">Genres: </span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {details?.genres?.map((genre: any, i: number) => (
                      <span key={genre.id} className="text-white hover:underline cursor-pointer">
                        {genre.name}{i < (details.genres?.length || 0) - 1 ? ', ' : ''}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-4">
                  <span className="text-gray-500 text-base">This {isTV ? 'show' : 'movie'} is: </span>
                  <div className="mt-1 text-white">
                    Exciting, Gritty, Suspenseful
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default MovieDetailModal;
