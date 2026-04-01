import { useQuery } from '@tanstack/react-query'
import * as api from '../lib/api'

const q = (key: unknown[], fn: () => Promise<unknown>, stale = 10 * 60 * 1000) =>
  useQuery({ queryKey: key, queryFn: fn as any, staleTime: stale })

// ─── Trending ────────────────────────────────────────────────────────────────
export const useTrending = (mediaType: 'movie' | 'tv' | 'all' = 'all', timeWindow: 'day' | 'week' = 'week') =>
  useQuery({ queryKey: ['trending', mediaType, timeWindow], queryFn: () => api.getTrending(mediaType, timeWindow), staleTime: 5 * 60 * 1000 })

// ─── Movies ──────────────────────────────────────────────────────────────────
export const usePopularMovies    = (page = 1) => useQuery({ queryKey: ['popular-movies', page], queryFn: () => api.getPopularMovies(page), staleTime: 5 * 60 * 1000 })
export const useTopRatedMovies   = () => q(['top-rated-movies'],   api.getTopRatedMovies)
export const useNowPlaying       = () => q(['now-playing'],         api.getNowPlayingMovies, 5 * 60 * 1000)
export const useUpcomingMovies   = () => q(['upcoming-movies'],     api.getUpcomingMovies)
export const useMovieDetails     = (id: number) => useQuery({ queryKey: ['movie', id], queryFn: () => api.getMovieDetails(id), staleTime: 30 * 60 * 1000, enabled: !!id })
export const useMoviesByGenre    = (genreId: number, page = 1) => useQuery({ queryKey: ['genre-movies', genreId, page], queryFn: () => api.getMoviesByGenre(genreId, page), staleTime: 10 * 60 * 1000, enabled: !!genreId })
export const useMovieGenres      = () => q(['movie-genres'],        api.getMovieGenres, 60 * 60 * 1000)

// ─── Movies by genre ─────────────────────────────────────────────────────────
export const useActionMovies      = () => q(['action-movies'],      api.getActionMovies)
export const useComedyMovies      = () => q(['comedy-movies'],      api.getComedyMovies)
export const useHorrorMovies      = () => q(['horror-movies'],      api.getHorrorMovies)
export const useSciFiMovies       = () => q(['scifi-movies'],       api.getSciFiMovies)
export const useThrillerMovies    = () => q(['thriller-movies'],    api.getThrillerMovies)
export const useAnimationMovies   = () => q(['animation-movies'],   api.getAnimationMovies)
export const useDocumentaryMovies = () => q(['documentary-movies'], api.getDocumentaryMovies)
export const useRomanceMovies     = () => q(['romance-movies'],     api.getRomanceMovies)
export const useWesternMovies     = () => q(['western-movies'],     api.getWesternMovies)
export const useFantasyMovies     = () => q(['fantasy-movies'],     api.getFantasyMovies)
export const useCrimeMovies       = () => q(['crime-movies'],       api.getCrimeMovies)
export const useMusicMovies       = () => q(['music-movies'],       api.getMusicMovies)
export const useHistoryMovies     = () => q(['history-movies'],     api.getHistoryMovies)

// ─── TV Shows ────────────────────────────────────────────────────────────────
export const usePopularTV    = (page = 1) => useQuery({ queryKey: ['popular-tv', page], queryFn: () => api.getPopularTV(page), staleTime: 5 * 60 * 1000 })
export const useTVDetails    = (id: number) => useQuery({ queryKey: ['tv', id], queryFn: () => api.getTVDetails(id), staleTime: 30 * 60 * 1000, enabled: !!id })
export const useTVByGenre    = (genreId: number) => useQuery({ queryKey: ['genre-tv', genreId], queryFn: () => api.getTVByGenre(genreId), staleTime: 10 * 60 * 1000, enabled: !!genreId })
export const useTVGenres     = () => q(['tv-genres'], api.getTVGenres, 60 * 60 * 1000)
export const useTopRatedTV   = () => q(['top-rated-tv'],    api.getTopRatedTV)
export const useAiringTodayTV= () => q(['airing-today-tv'], api.getAiringTodayTV, 5 * 60 * 1000)
export const useOnTheAirTV   = () => q(['on-the-air-tv'],   api.getOnTheAirTV,    5 * 60 * 1000)
export const useActionTV     = () => q(['action-tv'],        api.getActionTV)
export const useComedyTV     = () => q(['comedy-tv'],        api.getComedyTV)
export const useCrimeTV      = () => q(['crime-tv'],         api.getCrimeTV)
export const useDocumentaryTV= () => q(['documentary-tv'],   api.getDocumentaryTV)
export const useDramaTV      = () => q(['drama-tv'],         api.getDramaTV)
export const useMysteryTV    = () => q(['mystery-tv'],       api.getMysteryTV)
export const useAnimationTV  = () => q(['animation-tv'],     api.getAnimationTV)
export const useSciFiTV      = () => q(['scifi-tv'],         api.getSciFiTV)
export const useFamilyTV     = () => q(['family-tv'],        api.getFamilyTV)
export const useTalkShowTV   = () => q(['talkshow-tv'],      api.getTalkShowTV)

// ─── Trending by type ────────────────────────────────────────────────────────
export const useTrendingMovies = () => q(['trending-movies-day'], api.getTrendingMovies, 5 * 60 * 1000)
export const useTrendingTV     = () => q(['trending-tv-day'],     api.getTrendingTV,     5 * 60 * 1000)

// ─── Anime ────────────────────────────────────────────────────────────────────
export const useTopAnime      = () => q(['top-anime'],      api.getTopAnime,      15 * 60 * 1000)
export const useSeasonalAnime = () => q(['seasonal-anime'], api.getSeasonalAnime, 15 * 60 * 1000)
export const useTrendingAnime = () => q(['trending-anime'], api.getTrendingAnime, 10 * 60 * 1000)
export const useTopMangaAnime = () => q(['top-manga-anime'],api.getTopMangaAnime, 15 * 60 * 1000)
export const useKidsAnime     = () => q(['kids-anime'],     api.getKidsAnime,     15 * 60 * 1000)

// ─── Search ──────────────────────────────────────────────────────────────────
export const useSearch = (query: string, page = 1) =>
  useQuery({ queryKey: ['search', query, page], queryFn: () => api.searchMulti(query, page), staleTime: 2 * 60 * 1000, enabled: query.length > 1 })
