// TMDB Configuration
export const TMDB_CONFIG = {
  BASE_URL: 'https://api.themoviedb.org/3',
  IMAGE_BASE: 'https://image.tmdb.org/t/p',
  API_KEY: '4f5f43495afcc67e9553f6c684a82f84',
}

export const getImageUrl = (path: string | null, size: string = 'w500'): string => {
  if (!path) return `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='450' viewBox='0 0 300 450'%3E%3Crect width='300' height='450' fill='%2327272a'/%3E%3Crect x='110' y='185' width='80' height='60' rx='4' fill='%2352525b'/%3E%3Ctext x='150' y='270' text-anchor='middle' fill='%2371717a' font-size='12' font-family='sans-serif'%3ENo Image%3C/text%3E%3C/svg%3E`
  return `${TMDB_CONFIG.IMAGE_BASE}/${size}${path}`
}

export const getBackdropUrl = (path: string | null): string => {
  if (!path) return `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='1280' height='720' viewBox='0 0 1280 720'%3E%3Crect width='1280' height='720' fill='%2318181b'/%3E%3C/svg%3E`
  return `${TMDB_CONFIG.IMAGE_BASE}/original${path}`
}

// ─── Interfaces ─────────────────────────────────────────────────────────────

export interface Movie {
  id: number
  title?: string
  name?: string
  overview: string
  poster_path: string | null
  backdrop_path: string | null
  vote_average: number
  vote_count: number
  release_date?: string
  first_air_date?: string
  genre_ids: number[]
  media_type?: string
  popularity: number
  adult: boolean
}

export interface Genre {
  id: number
  name: string
}

export interface Cast {
  id: number
  name: string
  character: string
  profile_path: string | null
  order: number
}

export interface Video {
  id: string
  key: string
  name: string
  type: string
  site: string
}

export interface MovieDetails extends Movie {
  genres: Genre[]
  runtime: number
  status: string
  tagline: string
  videos: { results: Video[] }
  credits: { cast: Cast[] }
  similar: { results: Movie[] }
}

export interface TVDetails extends Movie {
  genres: Genre[]
  episode_run_time: number[]
  number_of_seasons: number
  number_of_episodes: number
  status: string
  tagline: string
  videos: { results: Video[] }
  credits: { cast: Cast[] }
  similar: { results: Movie[] }
}

export interface SearchResults {
  results: Movie[]
  total_pages: number
  total_results: number
  page: number
}
