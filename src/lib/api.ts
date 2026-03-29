import { TMDB_CONFIG, Movie, MovieDetails, TVDetails, SearchResults, Genre } from './tmdb'

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
      append_to_response: 'videos,credits,similar',
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

// ─── More Movies ─────────────────────────────────────────────────────────────

export const getActionMovies = async (): Promise<Movie[]> => {
  try {
    const data = await fetcher<{ results: Movie[] }>('/discover/movie', {
      with_genres: '28',
      sort_by: 'popularity.desc',
    })
    return data.results ?? []
  } catch {
    return []
  }
}

export const getComedyMovies = async (): Promise<Movie[]> => {
  try {
    const data = await fetcher<{ results: Movie[] }>('/discover/movie', {
      with_genres: '35',
      sort_by: 'popularity.desc',
    })
    return data.results ?? []
  } catch {
    return []
  }
}

export const getHorrorMovies = async (): Promise<Movie[]> => {
  try {
    const data = await fetcher<{ results: Movie[] }>('/discover/movie', {
      with_genres: '27',
      sort_by: 'popularity.desc',
    })
    return data.results ?? []
  } catch {
    return []
  }
}

export const getSciFiMovies = async (): Promise<Movie[]> => {
  try {
    const data = await fetcher<{ results: Movie[] }>('/discover/movie', {
      with_genres: '878',
      sort_by: 'popularity.desc',
    })
    return data.results ?? []
  } catch {
    return []
  }
}

export const getThrillerMovies = async (): Promise<Movie[]> => {
  try {
    const data = await fetcher<{ results: Movie[] }>('/discover/movie', {
      with_genres: '53',
      sort_by: 'popularity.desc',
    })
    return data.results ?? []
  } catch {
    return []
  }
}

export const getAnimationMovies = async (): Promise<Movie[]> => {
  try {
    const data = await fetcher<{ results: Movie[] }>('/discover/movie', {
      with_genres: '16',
      sort_by: 'popularity.desc',
    })
    return data.results ?? []
  } catch {
    return []
  }
}

export const getDocumentaryMovies = async (): Promise<Movie[]> => {
  try {
    const data = await fetcher<{ results: Movie[] }>('/discover/movie', {
      with_genres: '99',
      sort_by: 'popularity.desc',
    })
    return data.results ?? []
  } catch {
    return []
  }
}

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

export const getActionTV = async (): Promise<Movie[]> => {
  try {
    const data = await fetcher<{ results: Movie[] }>('/discover/tv', {
      with_genres: '10759',
      sort_by: 'popularity.desc',
    })
    return data.results ?? []
  } catch {
    return []
  }
}

export const getComedyTV = async (): Promise<Movie[]> => {
  try {
    const data = await fetcher<{ results: Movie[] }>('/discover/tv', {
      with_genres: '35',
      sort_by: 'popularity.desc',
    })
    return data.results ?? []
  } catch {
    return []
  }
}

export const getCrimeTV = async (): Promise<Movie[]> => {
  try {
    const data = await fetcher<{ results: Movie[] }>('/discover/tv', {
      with_genres: '80',
      sort_by: 'popularity.desc',
    })
    return data.results ?? []
  } catch {
    return []
  }
}

export const getDocumentaryTV = async (): Promise<Movie[]> => {
  try {
    const data = await fetcher<{ results: Movie[] }>('/discover/tv', {
      with_genres: '99',
      sort_by: 'popularity.desc',
    })
    return data.results ?? []
  } catch {
    return []
  }
}

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

// ─── People ──────────────────────────────────────────────────────────────────

export const getPersonDetails = async (id: number): Promise<Record<string, unknown> | null> => {
  try {
    const data = await fetcher<Record<string, unknown>>(`/person/${id}`)
    return data
  } catch {
    return null
  }
}
