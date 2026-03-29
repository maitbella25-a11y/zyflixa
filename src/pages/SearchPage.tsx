import React, { useState, useEffect } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, X, Film, Tv, Filter } from 'lucide-react'
import { useSearch } from '../hooks/useMovies'
import { MovieCard } from '../components/MovieCard'
import { Spinner } from '../components/ui/Spinner'
import type { Movie } from '../lib/tmdb'

export const SearchPage: React.FC = () => {
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<'all' | 'movie' | 'tv'>('all')
  const navigate = useNavigate()

  useEffect(() => {
    // Parse query from URL on mount
    const params = new URLSearchParams(window.location.search)
    const q = params.get('q') || ''
    setQuery(q)
  }, [])

  const { data, isLoading, isFetching } = useSearch(query)

  const results: Movie[] = (data?.results || []).filter((m: Movie) => {
    if (filter === 'all') return m.media_type !== 'person'
    return m.media_type === filter
  })

  const handleChange = (value: string) => {
    setQuery(value)
    const url = new URL(window.location.href)
    if (value) {
      url.searchParams.set('q', value)
    } else {
      url.searchParams.delete('q')
    }
    window.history.replaceState({}, '', url.toString())
  }

  const filterButtons: { label: string; value: 'all' | 'movie' | 'tv'; icon: React.ReactNode }[] =
    [
      { label: 'All', value: 'all', icon: <Filter className="w-3.5 h-3.5" /> },
      { label: 'Movies', value: 'movie', icon: <Film className="w-3.5 h-3.5" /> },
      { label: 'TV Shows', value: 'tv', icon: <Tv className="w-3.5 h-3.5" /> },
    ]

  return (
    <div className="min-h-screen bg-[#141414] pt-24 px-4 sm:px-8 lg:px-16">
      {/* Search Input */}
      <div className="max-w-2xl mb-8">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => handleChange(e.target.value)}
            placeholder="Search for movies, TV shows..."
            autoFocus
            className="w-full bg-zinc-900 border border-zinc-700 text-white pl-12 pr-12 py-4 rounded-lg text-base outline-none focus:border-[#E50914] transition-colors placeholder:text-zinc-500"
          />
          {query && (
            <button
              onClick={() => handleChange('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Filters */}
        <div className="flex gap-2 mt-4">
          {filterButtons.map((btn) => (
            <button
              key={btn.value}
              onClick={() => setFilter(btn.value)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                filter === btn.value
                  ? 'bg-[#E50914] text-white'
                  : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-white'
              }`}
            >
              {btn.icon}
              {btn.label}
            </button>
          ))}
        </div>
      </div>

      {/* Loading state */}
      {(isLoading || isFetching) && query.length > 1 && (
        <div className="flex items-center gap-3 mb-6 text-zinc-400">
          <Spinner size="sm" />
          <span className="text-sm">Searching...</span>
        </div>
      )}

      {/* Results */}
      {query.length > 1 && !isLoading && (
        <div>
          <div className="mb-4 text-zinc-400 text-sm">
            {results.length > 0 ? (
              <span>
                Found <strong className="text-white">{results.length}</strong> results for{' '}
                <strong className="text-white">"{query}"</strong>
              </span>
            ) : (
              <span>No results found for "{query}"</span>
            )}
          </div>

          <motion.div
            layout
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4"
          >
            <AnimatePresence>
              {results.map((movie, i) => (
                <motion.div
                  key={`${movie.id}-${movie.media_type}`}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.2, delay: i * 0.02 }}
                >
                  <MovieCard movie={movie} index={i} />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        </div>
      )}

      {/* Empty state */}
      {query.length <= 1 && (
        <div className="text-center py-24">
          <Search className="w-16 h-16 text-zinc-700 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-zinc-400 mb-2">Search CineStream</h2>
          <p className="text-zinc-600">Find movies, TV shows, and more</p>
        </div>
      )}
    </div>
  )
}
