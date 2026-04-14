import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate, useSearch as useRouterSearch } from '@tanstack/react-router'
import { Search, X, Film, Tv, Sparkles } from 'lucide-react'
import { useSearch } from '../hooks/useMovies'
import { useQuery } from '@tanstack/react-query'
import { MovieCard } from '../components/MovieCard'
import { Spinner } from '../components/ui/Spinner'
import { searchAnime } from '../lib/api'
import type { Movie } from '../lib/tmdb'
import type { AnimeEntry } from '../lib/api'

type FilterType = 'all' | 'movie' | 'tv' | 'anime'

const FILTERS: { type: FilterType; label: string; icon: React.ReactNode }[] = [
  { type: 'all',   label: 'All',      icon: <Search className="w-3.5 h-3.5" /> },
  { type: 'movie', label: 'Movies',   icon: <Film className="w-3.5 h-3.5" /> },
  { type: 'tv',    label: 'TV Shows', icon: <Tv className="w-3.5 h-3.5" /> },
  { type: 'anime', label: 'Anime',    icon: <Sparkles className="w-3.5 h-3.5" /> },
]

export const SearchPage: React.FC = () => {
  const routerSearch = useRouterSearch({ from: '/search' })
  const navigate = useNavigate()
  
  const [query, setQuery] = useState(routerSearch.q || '')
  const [debouncedQuery, setDebouncedQuery] = useState(routerSearch.q || '')
  const [filter, setFilter] = useState<FilterType>('all')
  const inputRef = useRef<HTMLInputElement>(null)

  // Sync state if URL changes externally
  useEffect(() => {
    setQuery(routerSearch.q || '')
    setDebouncedQuery(routerSearch.q || '')
  }, [routerSearch.q])

  // Debounce and sync to URL
  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedQuery(query)
      navigate({
        to: '/search',
        search: (prev) => ({ ...prev, q: query || undefined }),
        replace: true,
      })
    }, 400)
    return () => clearTimeout(t)
  }, [query, navigate])

  useEffect(() => {
    setTimeout(() => inputRef.current?.focus(), 100)
  }, [])

  const handleChange = (value: string) => {
    setQuery(value)
  }

  const { data: tmdbData, isLoading: tmdbLoading } = useSearch(debouncedQuery)

  const { data: animeResults = [], isLoading: animeLoading } = useQuery({
    queryKey: ['anime-search', debouncedQuery],
    queryFn: () => searchAnime(debouncedQuery),
    enabled: debouncedQuery.length >= 1 && (filter === 'all' || filter === 'anime'),
    staleTime: 5 * 60 * 1000,
  })

  const tmdbResults: Movie[] = (tmdbData?.results || []).filter((m: Movie) => {
    if (m.media_type === 'person') return false
    if (filter === 'all') return true
    if (filter === 'anime') return false
    return m.media_type === filter
  })

  const normalizedAnime = animeResults.map((a: AnimeEntry) => ({
    id: a.mal_id,
    title: a.title_english || a.title,
    name: a.title_english || a.title,
    poster_path: a.images?.jpg?.large_image_url || a.images?.jpg?.image_url,
    vote_average: a.score || 0,
    media_type: 'anime',
    overview: a.synopsis || '',
    genre_ids: [],
    vote_count: 0,
    popularity: 0,
    adult: false,
    backdrop_path: null,
  }))

  const allResults = (
    filter === 'anime' ? normalizedAnime :
    filter === 'all'   ? [...tmdbResults, ...normalizedAnime] :
    tmdbResults
  ).sort((a: any, b: any) => (b.vote_average || 0) - (a.vote_average || 0))

  const isLoading = tmdbLoading || animeLoading

  return (
    <div className="min-h-screen bg-[#141414]">
      <div className="pt-20 pb-16 px-4 sm:px-8 lg:px-16">
        {/* Search input */}
        <div className="max-w-2xl mb-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => handleChange(e.target.value)}
              placeholder="Search movies, TV shows, anime..."
              autoFocus
              className="w-full bg-zinc-900 border border-zinc-700 focus:border-zinc-500 text-white pl-12 pr-12 py-4 rounded-xl outline-none transition-colors text-sm"
            />
            {query && (
              <button
                onClick={() => handleChange('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-zinc-700 rounded-full transition-colors"
              >
                <X className="w-4 h-4 text-zinc-400" />
              </button>
            )}
          </div>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2 mb-8 flex-wrap">
          {FILTERS.map((f) => (
            <button
              key={f.type}
              onClick={() => setFilter(f.type)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                filter === f.type
                  ? f.type === 'anime' ? 'bg-violet-600 text-white' : 'bg-[#E50914] text-white'
                  : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-white'
              }`}
            >
              {f.icon}
              {f.label}
            </button>
          ))}
        </div>

        {/* Loading */}
        {isLoading && debouncedQuery && (
          <div className="flex items-center gap-2 text-zinc-400 mb-6">
            <Spinner size="sm" />
            <span className="text-sm">Searching...</span>
          </div>
        )}

        {/* Results */}
        {debouncedQuery && !isLoading && (
          <>
            {allResults.length > 0 && (
              <p className="text-zinc-500 text-sm mb-4">
                {allResults.length} result{allResults.length !== 1 ? 's' : ''} for &quot;{debouncedQuery}&quot;
              </p>
            )}
            <motion.div
              className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <AnimatePresence>
                {allResults.map((item: any, i) => (
                  <motion.div
                    key={`${item.id}-${item.media_type}`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: Math.min(i * 0.04, 0.4) }}
                  >
                    <MovieCard movie={item} index={i} />
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>

            {allResults.length === 0 && (
              <div className="text-center py-20">
                <p className="text-zinc-400 text-lg mb-2">No results found</p>
                <p className="text-zinc-600 text-sm">Try a different search term or filter</p>
              </div>
            )}
          </>
        )}

        {!debouncedQuery && (
          <div className="text-center text-zinc-500 py-20">
            <Search className="w-12 h-12 mx-auto mb-4 opacity-30" />
            <p className="text-lg mb-1">Search for anything</p>
            <p className="text-sm text-zinc-600">Movies, TV shows, anime — find it all here</p>
          </div>
        )}
      </div>
    </div>
  )
}
