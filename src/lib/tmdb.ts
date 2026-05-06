import axios from 'axios';

const TMDB_API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY;
const TMDB_BASE_URL = process.env.NEXT_PUBLIC_TMDB_BASE_URL;

export const tmdb = axios.create({
  baseURL: TMDB_BASE_URL,
  params: {
    api_key: TMDB_API_KEY,
  },
});

export interface Movie {
  id: number;
  title?: string;
  name?: string;
  overview: string;
  poster_path: string;
  backdrop_path: string;
  release_date?: string;
  first_air_date?: string;
  vote_average: number;
  media_type?: 'movie' | 'tv';
}

export interface Episode {
  id: number;
  name: string;
  overview: string;
  still_path: string;
  episode_number: number;
  season_number: number;
  runtime: number;
}

export interface MovieDetails extends Movie {
  genres: { id: number; name: string }[];
  number_of_seasons?: number;
  number_of_episodes?: number;
  seasons?: {
    id: number;
    name: string;
    season_number: number;
    episode_count: number;
  }[];
  credits: {
    cast: {
      id: number;
      name: string;
      character: string;
      profile_path: string;
    }[];
  };
  external_ids?: {
    imdb_id: string;
  };
  recommendations?: {
    results: Movie[];
  };
}

export const fetchTrending = async (type: 'all' | 'movie' | 'tv' = 'all') => {
  const { data } = await tmdb.get(`/trending/${type}/week`);
  return data.results as Movie[];
};

export const fetchTopRated = async (type: 'movie' | 'tv' = 'movie') => {
  const { data } = await tmdb.get(`/${type}/top_rated`);
  return data.results as Movie[];
};

export const fetchArshOriginals = async () => {
  const { data } = await tmdb.get(`/discover/tv`, {
    params: {
      with_networks: 213, // High-quality originals network
    },
  });
  return data.results as Movie[];
};

export const fetchRecommendations = async (type: 'movie' | 'tv', id: number) => {
  const { data } = await tmdb.get(`/${type}/${id}/recommendations`);
  return data.results as Movie[];
};

export const fetchSimilar = async (type: 'movie' | 'tv', id: number) => {
  const { data } = await tmdb.get(`/${type}/${id}/similar`);
  return data.results as Movie[];
};

export const fetchByGenre = async (type: 'movie' | 'tv', genreId: number) => {
  const { data } = await tmdb.get(`/discover/${type}`, {
    params: {
      with_genres: genreId,
    },
  });
  return data.results as Movie[];
};

export const fetchByNetwork = async (networkId: number) => {
  const { data } = await tmdb.get(`/discover/tv`, {
    params: {
      with_networks: networkId,
      sort_by: 'popularity.desc',
    },
  });
  return data.results as Movie[];
};

export const fetchDetails = async (type: 'movie' | 'tv', id: number) => {
  const { data } = await tmdb.get(`/${type}/${id}`, {
    params: {
      append_to_response: 'videos,credits,similar,external_ids',
    },
  });
  return data as MovieDetails;
};

export const fetchEpisodes = async (tvId: number, seasonNumber: number) => {
  const { data } = await tmdb.get(`/tv/${tvId}/season/${seasonNumber}`);
  return data.episodes as Episode[];
};

export const searchContent = async (query: string) => {
  const { data } = await tmdb.get(`/search/multi`, {
    params: {
      query,
    },
  });
  return data.results as Movie[];
};

export const fetchEpisodeDetails = async (tvId: number, seasonNumber: number, episodeNumber: number) => {
  const { data } = await tmdb.get(`/tv/${tvId}/season/${seasonNumber}/episode/${episodeNumber}/external_ids`);
  return data as { imdb_id: string };
};

export const getOptimizedImage = (
  path: string,
  size: "w300" | "w500" | "w780" | "w1280" | "original" = "w500"
) => {
  if (!path) return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjQ1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjQ1MCIgZmlsbD0iIzJhMmEyYSIvPjwvc3ZnPg==';
  
  const tmdbUrl = `https://image.tmdb.org/t/p/${size}${path}`;
  
  // Use wsrv.nl for extreme caching and optimization
  let wsrvUrl = `https://wsrv.nl/?url=${encodeURIComponent(tmdbUrl)}&output=webp&q=80`;
  
  // Map TMDB sizes to wsrv widths for precision
  if (size === 'w300') wsrvUrl += '&w=300';
  else if (size === 'w500') wsrvUrl += '&w=500';
  else if (size === 'w780') wsrvUrl += '&w=780';
  else if (size === 'w1280') wsrvUrl += '&w=1280';
  
  return wsrvUrl;
};
