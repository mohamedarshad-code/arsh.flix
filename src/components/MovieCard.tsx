'use client';

import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Play, Plus, ChevronDown } from 'lucide-react';
import { Movie, getOptimizedImage } from '@/lib/tmdb';

interface MovieCardProps {
  movie: Movie;
  onClick: (movie: Movie) => void;
}

const MovieCard = ({ movie, onClick }: MovieCardProps) => {
  return (
    <div 
      className="group/card flex flex-col gap-2 shrink-0 w-[180px] md:w-[260px] cursor-pointer" 
      onClick={() => onClick(movie)}
    >
      <motion.div
        className="relative h-28 w-full overflow-hidden rounded-md bg-[#2a2a2a] transition-all duration-300 md:h-36 group-hover/card:ring-2 group-hover/card:ring-white/40 group-hover/card:scale-[1.02]"
        whileHover={{ y: -5 }}
      >
        <Image
          src={getOptimizedImage(movie.backdrop_path || movie.poster_path, 'w300')}
          alt={movie.title || movie.name || 'Movie'}
          fill
          sizes="(max-width: 768px) 180px, 260px"
          className="object-cover transition-transform duration-500 group-hover/card:scale-110"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity duration-300" />
      </motion.div>

      <div className="px-1 transition-all duration-300 group-hover/card:translate-x-1">
        <h3 className="truncate text-sm font-bold text-[#e5e5e5] group-hover/card:text-white">
          {movie.title || movie.name}
        </h3>
        <div className="flex items-center gap-2 text-[11px] font-semibold">
          <span className="text-green-400">{Math.round(movie.vote_average * 10)}% Match</span>
          <span className="text-gray-400">{movie.release_date?.split('-')[0] || movie.first_air_date?.split('-')[0]}</span>
          <span className="rounded border border-white/20 px-1 py-0.5 text-[8px] text-gray-400 uppercase">HD</span>
        </div>
      </div>
    </div>
  );
};

export default MovieCard;
