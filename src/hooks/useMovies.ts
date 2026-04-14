import { useQuery } from '@tanstack/react-query'
import * as api from '../lib/api'

// enabled = true by default, pass false to delay fetching until row is visible
const q = (key: unknown[], fn: () => Promise<unknown>, stale = 10 * 60 * 1000, enabled = true) =>
  useQuery({ queryKey: key, queryFn: fn as any, staleTime: stale, enabled })

// ─── Trending (always eager — visible above fold) ─────────────────────────────
export const useTrending = (mediaType: 'movie' | 'tv' | 'all' = 'all', timeWindow: 'day' | 'week' = 'week', enabled = true) =>
  useQuery({ queryKey: ['trending', mediaType, timeWindow], queryFn: () => api.getTrending(mediaType, timeWindow), staleTime: 5 * 60 * 1000, enabled })

// ─── Movies ──────────────────────────────────────────────────────────────────
export const usePopularMovies    = (page = 1, enabled = true) => useQuery({ queryKey: ['popular-movies', page], queryFn: () => api.getPopularMovies(page), staleTime: 5 * 60 * 1000, enabled })
export const useTopRatedMovies   = (enabled = true) => q(['top-rated-movies'],   api.getTopRatedMovies,   10 * 60 * 1000, enabled)
export const useNowPlaying       = (enabled = true) => q(['now-playing'],         api.getNowPlayingMovies,  5 * 60 * 1000, enabled)
export const useUpcomingMovies   = (enabled = true) => q(['upcoming-movies'],     api.getUpcomingMovies,   10 * 60 * 1000, enabled)
export const useMovieDetails     = (id: number) => useQuery({ queryKey: ['movie', id], queryFn: () => api.getMovieDetails(id), staleTime: 30 * 60 * 1000, enabled: !!id })
export const useMoviesByGenre    = (genreId: number, page = 1) => useQuery({ queryKey: ['genre-movies', genreId, page], queryFn: () => api.getMoviesByGenre(genreId, page), staleTime: 10 * 60 * 1000, enabled: !!genreId })
export const useMovieGenres      = () => q(['movie-genres'], api.getMovieGenres, 60 * 60 * 1000)

// ─── Movies by genre (lazy) ───────────────────────────────────────────────────
export const useActionMovies      = (e = true) => q(['action-movies'],      api.getActionMovies,      10 * 60 * 1000, e)
export const useComedyMovies      = (e = true) => q(['comedy-movies'],      api.getComedyMovies,      10 * 60 * 1000, e)
export const useHorrorMovies      = (e = true) => q(['horror-movies'],      api.getHorrorMovies,      10 * 60 * 1000, e)
export const useSciFiMovies       = (e = true) => q(['scifi-movies'],       api.getSciFiMovies,       10 * 60 * 1000, e)
export const useThrillerMovies    = (e = true) => q(['thriller-movies'],    api.getThrillerMovies,    10 * 60 * 1000, e)
export const useAnimationMovies   = (e = true) => q(['animation-movies'],   api.getAnimationMovies,   10 * 60 * 1000, e)
export const useDocumentaryMovies = (e = true) => q(['documentary-movies'], api.getDocumentaryMovies, 10 * 60 * 1000, e)
export const useRomanceMovies     = (e = true) => q(['romance-movies'],     api.getRomanceMovies,     10 * 60 * 1000, e)
export const useWesternMovies     = (e = true) => q(['western-movies'],     api.getWesternMovies,     10 * 60 * 1000, e)
export const useFantasyMovies     = (e = true) => q(['fantasy-movies'],     api.getFantasyMovies,     10 * 60 * 1000, e)
export const useCrimeMovies       = (e = true) => q(['crime-movies'],       api.getCrimeMovies,       10 * 60 * 1000, e)
export const useMusicMovies       = (e = true) => q(['music-movies'],       api.getMusicMovies,       10 * 60 * 1000, e)
export const useHistoryMovies     = (e = true) => q(['history-movies'],     api.getHistoryMovies,     10 * 60 * 1000, e)

// ─── TV Shows ────────────────────────────────────────────────────────────────
export const usePopularTV    = (page = 1, enabled = true) => useQuery({ queryKey: ['popular-tv', page], queryFn: () => api.getPopularTV(page), staleTime: 5 * 60 * 1000, enabled })
export const useTVDetails    = (id: number) => useQuery({ queryKey: ['tv', id], queryFn: () => api.getTVDetails(id), staleTime: 30 * 60 * 1000, enabled: !!id })
export const useTVByGenre    = (genreId: number) => useQuery({ queryKey: ['genre-tv', genreId], queryFn: () => api.getTVByGenre(genreId), staleTime: 10 * 60 * 1000, enabled: !!genreId })
export const useTVGenres     = () => q(['tv-genres'], api.getTVGenres, 60 * 60 * 1000)
export const useTopRatedTV   = (e = true) => q(['top-rated-tv'],    api.getTopRatedTV,    10 * 60 * 1000, e)
export const useAiringTodayTV= (e = true) => q(['airing-today-tv'], api.getAiringTodayTV,  5 * 60 * 1000, e)
export const useOnTheAirTV   = (e = true) => q(['on-the-air-tv'],   api.getOnTheAirTV,     5 * 60 * 1000, e)
export const useActionTV     = (e = true) => q(['action-tv'],        api.getActionTV,      10 * 60 * 1000, e)
export const useComedyTV     = (e = true) => q(['comedy-tv'],        api.getComedyTV,      10 * 60 * 1000, e)
export const useCrimeTV      = (e = true) => q(['crime-tv'],         api.getCrimeTV,       10 * 60 * 1000, e)
export const useDocumentaryTV= (e = true) => q(['documentary-tv'],   api.getDocumentaryTV, 10 * 60 * 1000, e)
export const useDramaTV      = (e = true) => q(['drama-tv'],         api.getDramaTV,       10 * 60 * 1000, e)
export const useMysteryTV    = (e = true) => q(['mystery-tv'],       api.getMysteryTV,     10 * 60 * 1000, e)
export const useAnimationTV  = (e = true) => q(['animation-tv'],     api.getAnimationTV,   10 * 60 * 1000, e)
export const useSciFiTV      = (e = true) => q(['scifi-tv'],         api.getSciFiTV,       10 * 60 * 1000, e)
export const useFamilyTV     = (e = true) => q(['family-tv'],        api.getFamilyTV,      10 * 60 * 1000, e)
export const useTalkShowTV   = (e = true) => q(['talkshow-tv'],      api.getTalkShowTV,    10 * 60 * 1000, e)

// ─── Trending by type ─────────────────────────────────────────────────────────
export const useTrendingMovies = (e = true) => q(['trending-movies-day'], api.getTrendingMovies, 5 * 60 * 1000, e)
export const useTrendingTV     = (e = true) => q(['trending-tv-day'],     api.getTrendingTV,     5 * 60 * 1000, e)

// ─── Anime ────────────────────────────────────────────────────────────────────
export const useTopAnime      = (e = true) => q(['top-anime'],       api.getTopAnime,      15 * 60 * 1000, e)
export const useSeasonalAnime = (e = true) => q(['seasonal-anime'],  api.getSeasonalAnime, 15 * 60 * 1000, e)
export const useTrendingAnime = (e = true) => q(['trending-anime'],  api.getTrendingAnime, 10 * 60 * 1000, e)
export const useTopMangaAnime = (e = true) => q(['top-manga-anime'], api.getTopMangaAnime, 15 * 60 * 1000, e)
export const useKidsAnime     = (e = true) => q(['kids-anime'],      api.getKidsAnime,     15 * 60 * 1000, e)

// ─── Search ───────────────────────────────────────────────────────────────────
export const useSearch = (query: string, page = 1) =>
  useQuery({ queryKey: ['search', query, page], queryFn: () => api.searchMulti(query, page), staleTime: 2 * 60 * 1000, enabled: query.length > 1 })
