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
} from '../hooks/useMovies'
import { MovieCard } from '../components/MovieCard'
import { Spinner } from '../components/ui/Spinner'
import type { Movie } from '../lib/tmdb'

const categoryConfig: Record<string, { title: string; subtitle: string; emoji: string }> = {
  movies: { title: 'Popular Movies', subtitle: 'The most popular movies right now', emoji: '🎬' },
  tv: { title: 'Popular TV Shows', subtitle: 'The most popular TV series right now', emoji: '📺' },
  trending: { title: 'Trending Now', subtitle: 'What everyone is watching this week', emoji: '🔥' },
  'top-rated': { title: 'Top Rated', subtitle: 'The highest rated of all time', emoji: '⭐' },
  'now-playing': { title: 'Now Playing', subtitle: 'Currently in theaters', emoji: '🎭' },
}

export const BrowsePage: React.FC = () => {
  const params = useParams({ from: '/browse/$category' })
  const category = params.category
  const [page, setPage] = useState(1)

  const moviesResult = usePopularMovies(page)
  const tvResult = usePopularTV(page)
  const trendingResult = useTrending('all', 'week')
  const topRatedResult = useTopRatedMovies()
  const nowPlayingResult = useNowPlaying()

  const configs: Record<string, { data: Movie[]; isLoading: boolean }> = {
    movies: { data: moviesResult.data || [], isLoading: moviesResult.isLoading },
    tv: { data: tvResult.data || [], isLoading: tvResult.isLoading },
    trending: { data: trendingResult.data || [], isLoading: trendingResult.isLoading },
    'top-rated': { data: topRatedResult.data || [], isLoading: topRatedResult.isLoading },
    'now-playing': { data: nowPlayingResult.data || [], isLoading: nowPlayingResult.isLoading },
  }

  const config = configs[category] ?? configs['trending']
  const info = categoryConfig[category] ?? categoryConfig['trending']
  const { data, isLoading } = config

  const supportsLoadMore = category === 'movies' || category === 'tv'

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
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
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
        {isLoading ? (
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

            {/* Load More — only for paginated endpoints */}
            {supportsLoadMore && (
              <div className="flex justify-center mt-10">
                <button
                  onClick={() => setPage((p) => p + 1)}
                  className="px-8 py-3 bg-zinc-800 hover:bg-zinc-700 text-white text-sm font-medium rounded-md transition-all duration-200 border border-zinc-700 hover:border-zinc-500"
                >
                  Load More
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
