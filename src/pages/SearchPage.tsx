import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, X, Film, Tv, Filter, Sparkles } from 'lucide-react'
import { useSearch } from '../hooks/useMovies'
import { useQuery } from '@tanstack/react-query'
import { MovieCard } from '../components/MovieCard'
import { Spinner } from '../components/ui/Spinner'
import { searchAnime } from '../lib/api'
import type { Movie } from '../lib/tmdb'
import type { AnimeEntry } from '../lib/api'

type FilterType = 'all' | 'movie' | 'tv' | 'anime'

export const SearchPage: React.FC = () => {
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<FilterType>('all')
  const inputRef = useRef<HTMLInputElement>(null)

  // Parse query from URL on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const q = params.get('q') || ''
    setQuery(q)
    if (q) inputRef.current?.focus()
  }, [])

  // Update URL without navigating
  const handleChange = (value: string) => {
    setQuery(value)
    const url = new URL(window.location.href)
    if (value) { url.searchParams.set('q', value) }
    else { url.searchParams.delete('q') }
    window.history.replaceState({}, '', url.toString())
  }

  // TMDB search
  const { data: tmdbData, isLoading: tmdbLoading, isFetching: tmdbFetching } = useSearch(query)

  // Anime search via Jikan
  const { data: animeResults = [], isLoading: animeLoading } = useQuery({
    queryKey: ['anime-search', query],
    queryFn: () => searchAnime(query),
    enabled: query.length >= 2 && (filter === 'all' || filter === 'anime'),
    staleTime: 2 * 60 * 1000,
  })

  // Filter TMDB results
  const tmdbResults: Movie[] = (tmdbData?.results || []).filter((m: Movie) => {
    if (m.media_type === 'person') return false
    if (filter === 'all') return true
    if (filter === 'anime') return false
    return m.media_type === filter
  })

  // Combine results
  const allResults: (Movie | AnimeEntry)[] = filter === 'anime'
    ? animeResults
    : filter === 'all'
    ? [...tmdbResults, ...animeResults]
    : tmdbResults

  const isLoading = tmdbLoading || (animeLoading && (filter === 'all' || filter === 'anime'))
  const isFetching = tmdbFetching

  const filterButtons: { label: string; value: FilterType; icon: React.ReactNode; count?: number }[] = [
    { label: 'All', value: 'all', icon: <Filter className="w-3.5 h-3.5" />, count: allResults.length },
    { label: 'Movies', value: 'movie', icon: <Film className="w-3.5 h-3.5" />, count: tmdbResults.filter(m => m.media_type === 'movie').length },
    { label: 'TV Shows', value: 'tv', icon: <Tv className="w-3.5 h-3.5" />, count: tmdbResults.filter(m => m.media_type === 'tv').length },
    { label: 'Anime', value: 'anime', icon: <Sparkles className="w-3.5 h-3.5" />, count: animeResults.length },
  ]

  return (
    <div className="min-h-screen bg-[#141414]">
      {/* pt-16 to clear fixed navbar */}
      <div className="pt-20 pb-16 px-4 sm:px-8 lg:px-16">

        {/* ── Search Input ── */}
        <div className="max-w-2xl mb-8">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400 pointer-events-none" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => handleChange(e.target.value)}
              placeholder="Search movies, TV shows, anime..."
              autoFocus
              className="w-full bg-zinc-900 border border-zinc-700 text-white pl-12 pr-12 py-4 rounded-xl text-base outline-none focus:border-[#E50914] focus:ring-1 focus:ring-[#E50914]/30 transition-all placeholder:text-zinc-500"
            />
            {query && (
              <button
                onClick={() => handleChange('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Filter Tabs */}
          <div className="flex gap-2 mt-4 flex-wrap">
            {filterButtons.map((btn) => (
              <button
                key={btn.value}
                onClick={() => setFilter(btn.value)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                  filter === btn.value
                    ? btn.value === 'anime'
                      ? 'bg-violet-600 text-white shadow-lg shadow-violet-600/30'
                      : 'bg-[#E50914] text-white shadow-lg shadow-[#E50914]/30'
                    : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-white'
                }`}
              >
                {btn.icon}
                {btn.label}
                {query.length >= 2 && btn.count !== undefined && btn.count > 0 && (
                  <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                    filter === btn.value ? 'bg-white/20' : 'bg-zinc-700'
                  }`}>
                    {btn.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* ── Loading ── */}
        {(isLoading || isFetching) && query.length >= 2 && (
          <div className="flex items-center gap-3 mb-6 text-zinc-400">
            <Spinner size="sm" />
            <span className="text-sm">Searching across movies, TV shows, and anime...</span>
          </div>
        )}

        {/* ── Results ── */}
        {query.length >= 2 && !isLoading && (
          <div>
            <div className="mb-5 flex items-center justify-between">
              <p className="text-zinc-400 text-sm">
                {allResults.length > 0 ? (
                  <>
                    <strong className="text-white">{allResults.length}</strong> results for{' '}
                    <strong className="text-white">"{query}"</strong>
                  </>
                ) : (
                  <>No results found for "{query}"</>
                )}
              </p>
              {allResults.length > 0 && (
                <p className="text-zinc-600 text-xs hidden sm:block">
                  {tmdbResults.length} from TMDB · {animeResults.length} anime
                </p>
              )}
            </div>

            <motion.div
              layout
              className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4"
            >
              <AnimatePresence mode="popLayout">
                {allResults.map((item, i) => (
                  <motion.div
                    key={`${(item as Movie).id || (item as AnimeEntry).mal_id}-${
                      (item as Movie).media_type || 'anime'
                    }`}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.2, delay: i * 0.02 }}
                  >
                    <MovieCard movie={item as Movie} index={i} />
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>

            {/* No results */}
            {allResults.length === 0 && (
              <div className="text-center py-20">
                <Search className="w-12 h-12 text-zinc-700 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-zinc-400 mb-2">Nothing found</h3>
                <p className="text-zinc-600 text-sm">Try different keywords or check your spelling</p>
              </div>
            )}
          </div>
        )}

        {/* ── Empty state ── */}
        {query.length < 2 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-24"
          >
            <Search className="w-16 h-16 text-zinc-700 mx-auto mb-5" />
            <h2 className="text-2xl font-bold text-zinc-300 mb-2">Search zyflixa</h2>
            <p className="text-zinc-600 text-base mb-6">Find movies, TV shows, anime, and more</p>
            <div className="flex items-center justify-center gap-3 flex-wrap text-sm text-zinc-500">
              <span className="flex items-center gap-1.5 bg-zinc-800/60 px-3 py-1.5 rounded-full">
                <Film className="w-3.5 h-3.5" /> Movies
              </span>
              <span className="flex items-center gap-1.5 bg-zinc-800/60 px-3 py-1.5 rounded-full">
                <Tv className="w-3.5 h-3.5" /> TV Shows
              </span>
              <span className="flex items-center gap-1.5 bg-zinc-800/60 px-3 py-1.5 rounded-full">
                <Sparkles className="w-3.5 h-3.5" /> Anime
              </span>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}
