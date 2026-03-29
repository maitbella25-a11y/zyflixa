import { useQuery } from '@tanstack/react-query'
import * as api from '../lib/api'

// ─── Trending ────────────────────────────────────────────────────────────────

export const useTrending = (mediaType: 'movie' | 'tv' | 'all' = 'all', timeWindow: 'day' | 'week' = 'week') =>
  useQuery({
    queryKey: ['trending', mediaType, timeWindow],
    queryFn: () => api.getTrending(mediaType, timeWindow),
    staleTime: 5 * 60 * 1000,
  })

// ─── Movies ──────────────────────────────────────────────────────────────────

export const usePopularMovies = (page: number = 1) =>
  useQuery({
    queryKey: ['popular-movies', page],
    queryFn: () => api.getPopularMovies(page),
    staleTime: 5 * 60 * 1000,
  })

export const useTopRatedMovies = () =>
  useQuery({
    queryKey: ['top-rated-movies'],
    queryFn: api.getTopRatedMovies,
    staleTime: 10 * 60 * 1000,
  })

export const useNowPlaying = () =>
  useQuery({
    queryKey: ['now-playing'],
    queryFn: api.getNowPlayingMovies,
    staleTime: 5 * 60 * 1000,
  })

export const useUpcomingMovies = () =>
  useQuery({
    queryKey: ['upcoming-movies'],
    queryFn: api.getUpcomingMovies,
    staleTime: 10 * 60 * 1000,
  })

export const useMovieDetails = (id: number) =>
  useQuery({
    queryKey: ['movie', id],
    queryFn: () => api.getMovieDetails(id),
    staleTime: 30 * 60 * 1000,
    enabled: !!id,
  })

export const useMoviesByGenre = (genreId: number, page: number = 1) =>
  useQuery({
    queryKey: ['genre-movies', genreId, page],
    queryFn: () => api.getMoviesByGenre(genreId, page),
    staleTime: 10 * 60 * 1000,
    enabled: !!genreId,
  })

export const useMovieGenres = () =>
  useQuery({
    queryKey: ['movie-genres'],
    queryFn: api.getMovieGenres,
    staleTime: 60 * 60 * 1000,
  })

// ─── TV Shows ────────────────────────────────────────────────────────────────

export const usePopularTV = (page: number = 1) =>
  useQuery({
    queryKey: ['popular-tv', page],
    queryFn: () => api.getPopularTV(page),
    staleTime: 5 * 60 * 1000,
  })

export const useTVDetails = (id: number) =>
  useQuery({
    queryKey: ['tv', id],
    queryFn: () => api.getTVDetails(id),
    staleTime: 30 * 60 * 1000,
    enabled: !!id,
  })

export const useTVByGenre = (genreId: number) =>
  useQuery({
    queryKey: ['genre-tv', genreId],
    queryFn: () => api.getTVByGenre(genreId),
    staleTime: 10 * 60 * 1000,
    enabled: !!genreId,
  })

export const useTVGenres = () =>
  useQuery({
    queryKey: ['tv-genres'],
    queryFn: api.getTVGenres,
    staleTime: 60 * 60 * 1000,
  })

// ─── More Movies ─────────────────────────────────────────────────────────────

export const useActionMovies = () =>
  useQuery({ queryKey: ['action-movies'], queryFn: api.getActionMovies, staleTime: 10 * 60 * 1000 })

export const useComedyMovies = () =>
  useQuery({ queryKey: ['comedy-movies'], queryFn: api.getComedyMovies, staleTime: 10 * 60 * 1000 })

export const useHorrorMovies = () =>
  useQuery({ queryKey: ['horror-movies'], queryFn: api.getHorrorMovies, staleTime: 10 * 60 * 1000 })

export const useSciFiMovies = () =>
  useQuery({ queryKey: ['scifi-movies'], queryFn: api.getSciFiMovies, staleTime: 10 * 60 * 1000 })

export const useThrillerMovies = () =>
  useQuery({ queryKey: ['thriller-movies'], queryFn: api.getThrillerMovies, staleTime: 10 * 60 * 1000 })

export const useAnimationMovies = () =>
  useQuery({ queryKey: ['animation-movies'], queryFn: api.getAnimationMovies, staleTime: 10 * 60 * 1000 })

export const useDocumentaryMovies = () =>
  useQuery({ queryKey: ['documentary-movies'], queryFn: api.getDocumentaryMovies, staleTime: 10 * 60 * 1000 })

// ─── More TV Shows ────────────────────────────────────────────────────────────

export const useTopRatedTV = () =>
  useQuery({ queryKey: ['top-rated-tv'], queryFn: api.getTopRatedTV, staleTime: 10 * 60 * 1000 })

export const useAiringTodayTV = () =>
  useQuery({ queryKey: ['airing-today-tv'], queryFn: api.getAiringTodayTV, staleTime: 5 * 60 * 1000 })

export const useOnTheAirTV = () =>
  useQuery({ queryKey: ['on-the-air-tv'], queryFn: api.getOnTheAirTV, staleTime: 5 * 60 * 1000 })

export const useActionTV = () =>
  useQuery({ queryKey: ['action-tv'], queryFn: api.getActionTV, staleTime: 10 * 60 * 1000 })

export const useComedyTV = () =>
  useQuery({ queryKey: ['comedy-tv'], queryFn: api.getComedyTV, staleTime: 10 * 60 * 1000 })

export const useCrimeTV = () =>
  useQuery({ queryKey: ['crime-tv'], queryFn: api.getCrimeTV, staleTime: 10 * 60 * 1000 })

export const useDocumentaryTV = () =>
  useQuery({ queryKey: ['documentary-tv'], queryFn: api.getDocumentaryTV, staleTime: 10 * 60 * 1000 })

export const useTrendingMovies = () =>
  useQuery({ queryKey: ['trending-movies-day'], queryFn: api.getTrendingMovies, staleTime: 5 * 60 * 1000 })

export const useTrendingTV = () =>
  useQuery({ queryKey: ['trending-tv-day'], queryFn: api.getTrendingTV, staleTime: 5 * 60 * 1000 })

// ─── Search ──────────────────────────────────────────────────────────────────

export const useSearch = (query: string, page: number = 1) =>
  useQuery({
    queryKey: ['search', query, page],
    queryFn: () => api.searchMulti(query, page),
    staleTime: 2 * 60 * 1000,
    enabled: query.length > 1,
  })
