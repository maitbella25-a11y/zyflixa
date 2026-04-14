import React, { useState } from 'react'
import { useParams, Link } from '@tanstack/react-router'
import { motion } from 'framer-motion'
import { ChevronLeft } from 'lucide-react'
import {
  usePopularMovies,
  usePopularTV,
  useTrending,
  useTopRatedMovies,
  useNowPlaying,
  useTopAnime,
  useTrendingAnime,
  useSeasonalAnime,
} from '../hooks/useMovies'
import { MovieCard } from '../components/MovieCard'
import { Spinner } from '../components/ui/Spinner'
import type { Movie } from '../lib/tmdb'
import type { AnimeEntry } from '../lib/api'

const categoryConfig: Record<string, { title: string; subtitle: string; emoji: string }> = {
  movies: { title: 'Popular Movies', subtitle: 'The most popular movies right now', emoji: '🎬' },
  tv: { title: 'Popular TV Shows', subtitle: 'The most popular TV series right now', emoji: '📺' },
  trending: { title: 'Trending Now', subtitle: 'What everyone is watching this week', emoji: '🔥' },
  'top-rated': { title: 'Top Rated', subtitle: 'The highest rated of all time', emoji: '⭐' },
  'now-playing': { title: 'Now Playing', subtitle: 'Currently in theaters', emoji: '🎭' },
  anime: { title: 'Anime', subtitle: 'Top anime series & movies', emoji: '🎌' },
}

// Normalize AnimeEntry to be compatible with MovieCard (which expects Movie shape)
const animeToMovie = (a: AnimeEntry): Movie => ({
  id: a.mal_id,
  title: a.title_english || a.title,
  name: a.title_english || a.title,
  overview: a.synopsis || '',
  poster_path: a.images?.jpg?.large_image_url || a.images?.jpg?.image_url || null,
  backdrop_path: null,
  vote_average: a.score || 0,
  vote_count: 0,
  genre_ids: [],
  media_type: 'anime',
  popularity: 0,
  adult: false,
})

export const BrowsePage: React.FC = () => {
  const params = useParams({ from: '/browse/$category' })
  const category = params.category
  const [page, setPage] = useState(1)

  const moviesResult = usePopularMovies(category === 'movies' ? page : 1, category === 'movies')
  const tvResult = usePopularTV(category === 'tv' ? page : 1, category === 'tv')
  const trendingResult = useTrending('all', 'week', category === 'trending')
  const topRatedResult = useTopRatedMovies(category === 'top-rated')
  const nowPlayingResult = useNowPlaying(category === 'now-playing')
  const topAnimeResult = useTopAnime(category === 'anime')
  const trendingAnimeResult = useTrendingAnime(category === 'anime')
  const seasonalAnimeResult = useSeasonalAnime(category === 'anime')

  // Accumulate pages for paginated endpoints
  const [accumulatedMovies, setAccumulatedMovies] = useState<Movie[]>([])
  const [accumulatedTV, setAccumulatedTV] = useState<Movie[]>([])

  React.useEffect(() => {
    if (moviesResult.data && moviesResult.data.length > 0) {
      if (page === 1) {
        setAccumulatedMovies(moviesResult.data)
      } else {
        setAccumulatedMovies((prev) => {
          const ids = new Set(prev.map((m) => m.id))
          const newItems = moviesResult.data!.filter((m) => !ids.has(m.id))
          return [...prev, ...newItems]
        })
      }
    }
  }, [moviesResult.data, page])

  React.useEffect(() => {
    if (tvResult.data && tvResult.data.length > 0) {
      if (page === 1) {
        setAccumulatedTV(tvResult.data)
      } else {
        setAccumulatedTV((prev) => {
          const ids = new Set(prev.map((m) => m.id))
          const newItems = tvResult.data!.filter((m) => !ids.has(m.id))
          return [...prev, ...newItems]
        })
      }
    }
  }, [tvResult.data, page])

  // Merge all anime sources and deduplicate
  const animeData: Movie[] = React.useMemo(() => {
    const all = [
      ...(topAnimeResult.data || []),
      ...(trendingAnimeResult.data || []),
      ...(seasonalAnimeResult.data || []),
    ]
    const seen = new Set<number>()
    return all
      .filter((a) => { if (seen.has(a.mal_id)) return false; seen.add(a.mal_id); return true })
      .map(animeToMovie)
  }, [topAnimeResult.data, trendingAnimeResult.data, seasonalAnimeResult.data])

  const animeLoading = topAnimeResult.isLoading && trendingAnimeResult.isLoading && seasonalAnimeResult.isLoading

  const configs: Record<string, { data: Movie[]; isLoading: boolean; isFetching?: boolean }> = {
    movies: { data: accumulatedMovies, isLoading: moviesResult.isLoading, isFetching: moviesResult.isFetching },
    tv: { data: accumulatedTV, isLoading: tvResult.isLoading, isFetching: tvResult.isFetching },
    trending: { data: trendingResult.data || [], isLoading: trendingResult.isLoading },
    'top-rated': { data: topRatedResult.data || [], isLoading: topRatedResult.isLoading },
    'now-playing': { data: nowPlayingResult.data || [], isLoading: nowPlayingResult.isLoading },
    anime: { data: animeData, isLoading: animeLoading },
  }

  const config = configs[category] ?? configs['trending']
  const info = categoryConfig[category] ?? categoryConfig['trending']
  const { data, isLoading, isFetching } = config

  const supportsLoadMore = category === 'movies' || category === 'tv'

  const handleLoadMore = () => {
    setPage((p) => p + 1)
  }

  return (
    <div className="min-h-screen bg-[#141414] pb-16">
      {/* Header */}
      <div className="pt-24 px-4 sm:px-8 lg:px-16 pb-8 border-b border-zinc-800/60">
        <Link
          to="/"
          className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors text-sm mb-4 w-fit"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to Home
        </Link>
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-3 mb-1">
            <span className="text-3xl">{info.emoji}</span>
            <h1
              className="text-2xl sm:text-3xl font-black text-white"
              style={{ fontFamily: "'Bebas Neue', sans-serif", letterSpacing: '0.02em' }}
            >
              {info.title}
            </h1>
          </div>
          <p className="text-zinc-400 text-sm">{info.subtitle}</p>
          {!isLoading && (
            <p className="text-zinc-600 text-xs mt-1">{data.length} titles</p>
          )}
        </motion.div>
      </div>

      {/* Grid */}
      <div className="px-4 sm:px-8 lg:px-16 pt-8">
        {isLoading && data.length === 0 ? (
          <div className="flex items-center justify-center py-24">
            <Spinner size="lg" />
          </div>
        ) : (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4"
            >
              {data.map((movie, i) => (
                <MovieCard key={`${movie.id}-${i}`} movie={movie} index={i} />
              ))}
            </motion.div>

            {/* Load More */}
            {supportsLoadMore && (
              <div className="flex justify-center mt-10">
                <button
                  onClick={handleLoadMore}
                  disabled={isFetching}
                  className="px-8 py-3 bg-zinc-800 hover:bg-zinc-700 text-white text-sm font-medium rounded-md transition-all duration-200 border border-zinc-700 hover:border-zinc-500 disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isFetching ? (
                    <>
                      <Spinner size="sm" />
                      Loading...
                    </>
                  ) : (
                    'Load More'
                  )}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
