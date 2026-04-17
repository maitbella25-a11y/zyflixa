import { TMDB_CONFIG, Movie, MovieDetails, TVDetails, SearchResults, Genre } from './tmdb'

// ─── Jikan (Anime) Types ─────────────────────────────────────────────────────

export interface AnimeEntry {
  mal_id: number
  title: string
  title_english?: string
  images: { jpg: { image_url: string; large_image_url?: string } }
  synopsis?: string
  score?: number
  year?: number
  genres?: { name: string }[]
  type?: string
  episodes?: number
  status?: string
  // normalized fields for MovieCard compatibility
  id?: number
  poster_path?: string
  backdrop_path?: string
  overview?: string
  vote_average?: number
  media_type?: string
  name?: string
  release_date?: string
}

// ─── Core Fetcher ────────────────────────────────────────────────────────────

const fetcher = async <T>(endpoint: string, params: Record<string, string> = {}): Promise<T> => {
  const url = new URL(`${TMDB_CONFIG.BASE_URL}${endpoint}`)
  url.searchParams.set('api_key', TMDB_CONFIG.API_KEY)
  url.searchParams.set('language', 'en-US')
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v))

  const res = await fetch(url.toString())
  if (!res.ok) throw new Error(`TMDB API error: ${res.status}`)
  return res.json()
}

// ─── Trending ────────────────────────────────────────────────────────────────

export const getTrending = async (
  mediaType: 'movie' | 'tv' | 'all' = 'all',
  timeWindow: 'day' | 'week' = 'week',
): Promise<Movie[]> => {
  try {
    const data = await fetcher<{ results: Movie[] }>(`/trending/${mediaType}/${timeWindow}`)
    return data.results ?? []
  } catch {
    return []
  }
}

// ─── Movies ──────────────────────────────────────────────────────────────────

export const getPopularMovies = async (page: number = 1): Promise<Movie[]> => {
  try {
    const data = await fetcher<{ results: Movie[] }>('/movie/popular', { page: String(page) })
    return data.results ?? []
  } catch {
    return []
  }
}

export const getTopRatedMovies = async (): Promise<Movie[]> => {
  try {
    const data = await fetcher<{ results: Movie[] }>('/movie/top_rated')
    return data.results ?? []
  } catch {
    return []
  }
}

export const getNowPlayingMovies = async (): Promise<Movie[]> => {
  try {
    const data = await fetcher<{ results: Movie[] }>('/movie/now_playing')
    return data.results ?? []
  } catch {
    return []
  }
}

export const getUpcomingMovies = async (): Promise<Movie[]> => {
  try {
    const data = await fetcher<{ results: Movie[] }>('/movie/upcoming')
    return data.results ?? []
  } catch {
    return []
  }
}

export const getMovieDetails = async (id: number): Promise<MovieDetails | null> => {
  try {
    const data = await fetcher<MovieDetails>(`/movie/${id}`, {
      append_to_response: 'videos,credits,similar',
    })
    return data
  } catch {
    return null
  }
}

export const getMoviesByGenre = async (genreId: number, page: number = 1): Promise<Movie[]> => {
  try {
    const data = await fetcher<{ results: Movie[] }>('/discover/movie', {
      with_genres: String(genreId),
      page: String(page),
    })
    return data.results ?? []
  } catch {
    return []
  }
}

export const getMovieGenres = async (): Promise<Genre[]> => {
  try {
    const data = await fetcher<{ genres: Genre[] }>('/genre/movie/list')
    return data.genres ?? []
  } catch {
    return []
  }
}

// ─── TV Shows ────────────────────────────────────────────────────────────────

export const getPopularTV = async (page: number = 1): Promise<Movie[]> => {
  try {
    const data = await fetcher<{ results: Movie[] }>('/tv/popular', { page: String(page) })
    return data.results ?? []
  } catch {
    return []
  }
}

export const getTVDetails = async (id: number): Promise<TVDetails | null> => {
  try {
    const data = await fetcher<TVDetails>(`/tv/${id}`, {
      append_to_response: 'videos,credits,similar,seasons',
    })
    return data
  } catch {
    return null
  }
}

export const getTVByGenre = async (genreId: number): Promise<Movie[]> => {
  try {
    const data = await fetcher<{ results: Movie[] }>('/discover/tv', {
      with_genres: String(genreId),
    })
    return data.results ?? []
  } catch {
    return []
  }
}

export const getTVGenres = async (): Promise<Genre[]> => {
  try {
    const data = await fetcher<{ genres: Genre[] }>('/genre/tv/list')
    return data.genres ?? []
  } catch {
    return []
  }
}

// ─── Search ──────────────────────────────────────────────────────────────────

export const searchMulti = async (query: string, page: number = 1): Promise<SearchResults> => {
  try {
    const data = await fetcher<SearchResults>('/search/multi', {
      query,
      page: String(page),
    })
    return data
  } catch {
    return { results: [], total_pages: 0, total_results: 0, page: 1 }
  }
}

// ─── Generic helper for discovering by genre ──────────────────────────────────

const discoverByGenre = async (type: 'movie' | 'tv', genreId: string): Promise<Movie[]> => {
  try {
    const data = await fetcher<{ results: Movie[] }>(`/discover/${type}`, {
      with_genres: genreId,
      sort_by: 'popularity.desc',
    })
    return data.results ?? []
  } catch {
    return []
  }
}

// ─── More Movies ─────────────────────────────────────────────────────────────

export const getActionMovies = () => discoverByGenre('movie', '28')
export const getComedyMovies = () => discoverByGenre('movie', '35')
export const getHorrorMovies = () => discoverByGenre('movie', '27')
export const getSciFiMovies = () => discoverByGenre('movie', '878')
export const getThrillerMovies = () => discoverByGenre('movie', '53')
export const getAnimationMovies = () => discoverByGenre('movie', '16')
export const getDocumentaryMovies = () => discoverByGenre('movie', '99')
export const getRomanceMovies = () => discoverByGenre('movie', '10749')
export const getWesternMovies = () => discoverByGenre('movie', '37')
export const getFantasyMovies = () => discoverByGenre('movie', '14')
export const getCrimeMovies = () => discoverByGenre('movie', '80')
export const getMusicMovies = () => discoverByGenre('movie', '10402')
export const getHistoryMovies = () => discoverByGenre('movie', '36')

// ─── More TV Shows ────────────────────────────────────────────────────────────

export const getTopRatedTV = async (): Promise<Movie[]> => {
  try {
    const data = await fetcher<{ results: Movie[] }>('/tv/top_rated')
    return data.results ?? []
  } catch {
    return []
  }
}

export const getAiringTodayTV = async (): Promise<Movie[]> => {
  try {
    const data = await fetcher<{ results: Movie[] }>('/tv/airing_today')
    return data.results ?? []
  } catch {
    return []
  }
}

export const getOnTheAirTV = async (): Promise<Movie[]> => {
  try {
    const data = await fetcher<{ results: Movie[] }>('/tv/on_the_air')
    return data.results ?? []
  } catch {
    return []
  }
}

export const getActionTV = () => discoverByGenre('tv', '10759')
export const getComedyTV = () => discoverByGenre('tv', '35')
export const getCrimeTV = () => discoverByGenre('tv', '80')
export const getDocumentaryTV = () => discoverByGenre('tv', '99')
export const getDramaTV = () => discoverByGenre('tv', '18')
export const getMysteryTV = () => discoverByGenre('tv', '9648')
export const getAnimationTV = () => discoverByGenre('tv', '16')
export const getSciFiTV = () => discoverByGenre('tv', '10765')
export const getFamilyTV = () => discoverByGenre('tv', '10751')
export const getTalkShowTV = () => discoverByGenre('tv', '10767')

// ─── Trending ──────────────────────────────────────────────────────────────────

export const getTrendingMovies = async (): Promise<Movie[]> => {
  try {
    const data = await fetcher<{ results: Movie[] }>('/trending/movie/day')
    return data.results ?? []
  } catch {
    return []
  }
}

export const getTrendingTV = async (): Promise<Movie[]> => {
  try {
    const data = await fetcher<{ results: Movie[] }>('/trending/tv/day')
    return data.results ?? []
  } catch {
    return []
  }
}

// ─── Jikan API (Anime) ────────────────────────────────────────────────────────

const JIKAN_BASE = 'https://api.jikan.moe/v4'

// ─── Jikan Rate-Limit Queue (max 3 req/sec) ───────────────────────────────────
const jikanQueue: (() => void)[] = []
let jikanActive = 0
const JIKAN_MAX = 2 // stay under the 3/sec limit

const jikanNext = () => {
  if (jikanActive >= JIKAN_MAX || jikanQueue.length === 0) return
  jikanActive++
  const run = jikanQueue.shift()!
  run()
}

const jikanFetch = (url: string): Promise<Response> =>
  new Promise((resolve, reject) => {
    jikanQueue.push(async () => {
      try {
        // retry up to 3 times on 429
        let res: Response | null = null
        for (let attempt = 0; attempt < 3; attempt++) {
          res = await fetch(url)
          if (res.status !== 429) break
          await new Promise((r) => setTimeout(r, 1000 * (attempt + 1)))
        }
        resolve(res!)
      } catch (e) {
        reject(e)
      } finally {
        jikanActive--
        setTimeout(jikanNext, 400) // 400ms gap between requests
      }
    })
    jikanNext()
  })

// Normalize Jikan anime entry into a Movie-compatible shape for MovieCard.
// NOTE: poster_path is stored as a full URL (not a TMDB path), because
// MovieCard detects media_type === 'anime' and skips getImageUrl() for these.
const normalizeAnime = (anime: AnimeEntry): AnimeEntry => ({
  ...anime,
  id: anime.mal_id,
  name: anime.title_english || anime.title,
  overview: anime.synopsis || '',
  vote_average: anime.score || 0,
  media_type: 'anime',
  // Store the full Jikan image URL directly — MovieCard uses it as-is for anime
  poster_path: anime.images?.jpg?.large_image_url || anime.images?.jpg?.image_url || '',
  backdrop_path: anime.images?.jpg?.large_image_url || anime.images?.jpg?.image_url || null,
  release_date: anime.year ? String(anime.year) : '',
})

export const getTopAnime = async (): Promise<AnimeEntry[]> => {
  try {
    const res = await jikanFetch(`${JIKAN_BASE}/top/anime?limit=20`)
    if (!res.ok) return []
    const data = await res.json() as { data: AnimeEntry[] }
    return (data.data || []).map(normalizeAnime)
  } catch {
    return []
  }
}

export const getSeasonalAnime = async (): Promise<AnimeEntry[]> => {
  try {
    const res = await jikanFetch(`${JIKAN_BASE}/seasons/now?limit=20`)
    if (!res.ok) return []
    const data = await res.json() as { data: AnimeEntry[] }
    return (data.data || []).map(normalizeAnime)
  } catch {
    return []
  }
}

export const getTrendingAnime = async (): Promise<AnimeEntry[]> => {
  try {
    const res = await jikanFetch(`${JIKAN_BASE}/top/anime?filter=airing&limit=20`)
    if (!res.ok) return []
    const data = await res.json() as { data: AnimeEntry[] }
    return (data.data || []).map(normalizeAnime)
  } catch {
    return []
  }
}

export const searchAnime = async (query: string): Promise<AnimeEntry[]> => {
  try {
    const res = await jikanFetch(`${JIKAN_BASE}/anime?q=${encodeURIComponent(query)}&limit=10&sfw=true`)
    if (!res.ok) return []
    const data = await res.json() as { data: AnimeEntry[] }
    return (data.data || []).map(normalizeAnime)
  } catch {
    return []
  }
}

export const getAnimeById = async (id: number): Promise<AnimeEntry | null> => {
  try {
    const res = await jikanFetch(`${JIKAN_BASE}/anime/${id}/full`)
    if (!res.ok) return null
    const data = await res.json() as { data: AnimeEntry }
    return normalizeAnime(data.data)
  } catch {
    return null
  }
}

export const getTopMangaAnime = async (): Promise<AnimeEntry[]> => {
  try {
    const res = await jikanFetch(`${JIKAN_BASE}/top/anime?filter=bypopularity&type=tv&limit=20`)
    if (!res.ok) return []
    const data = await res.json() as { data: AnimeEntry[] }
    return (data.data || []).map(normalizeAnime)
  } catch {
    return []
  }
}

export const getKidsAnime = async (): Promise<AnimeEntry[]> => {
  try {
    const res = await jikanFetch(`${JIKAN_BASE}/anime?genres=15&order_by=score&sort=desc&limit=20&sfw=true`)
    if (!res.ok) return []
    const data = await res.json() as { data: AnimeEntry[] }
    return (data.data || []).map(normalizeAnime)
  } catch {
    return []
  }
}

export const getAnimeCharacters = async (id: number): Promise<{ character: { name: string; images: { jpg: { image_url: string } } }; role: string }[]> => {
  try {
    const res = await jikanFetch(`${JIKAN_BASE}/anime/${id}/characters`)
    if (!res.ok) return []
    const data = await res.json() as { data: any[] }
    return (data.data || []).slice(0, 12)
  } catch {
    return []
  }
}
