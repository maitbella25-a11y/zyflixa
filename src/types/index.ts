export type { Movie, Genre, Cast, Video, MovieDetails, TVDetails, SearchResults } from '../lib/tmdb'
export type { WatchProgress } from '../hooks/useWatchProgress'

export interface GenreCategory {
  id: number
  name: string
  mediaType: 'movie' | 'tv'
}
