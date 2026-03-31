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
const [debouncedQuery, setDebouncedQuery] = useState('')
const [filter, setFilter] = useState<FilterType>('all')
const inputRef = useRef<HTMLInputElement>(null)

// debounce
useEffect(() => {
const timeout = setTimeout(() => {
setDebouncedQuery(query)
}, 500)
return () => clearTimeout(timeout)
}, [query])

// Parse query from URL
useEffect(() => {
const params = new URLSearchParams(window.location.search)
const q = params.get('q') || ''
setQuery(q)
if (q) inputRef.current?.focus()
}, [])

const handleChange = (value: string) => {
setQuery(value)
const url = new URL(window.location.href)
if (value) url.searchParams.set('q', value)
else url.searchParams.delete('q')
window.history.replaceState({}, '', url.toString())
}

// TMDB search
const { data: tmdbData, isLoading: tmdbLoading, isFetching } = useSearch(debouncedQuery)

// Anime search
const { data: animeResults = [], isLoading: animeLoading } = useQuery({
queryKey: ['anime-search', debouncedQuery],
queryFn: () => searchAnime(debouncedQuery),
enabled: debouncedQuery.length >= 1 && (filter === 'all' || filter === 'anime'),
})

// Filter TMDB
const tmdbResults: Movie[] = (tmdbData?.results || []).filter((m: Movie) => {
if (m.media_type === 'person') return false
if (filter === 'all') return true
if (filter === 'anime') return false
return m.media_type === filter
})

// Normalize anime
const normalizedAnime = animeResults.map((a: AnimeEntry) => ({
id: a.mal_id,
title: a.title,
poster_path: a.images?.jpg?.image_url,
vote_average: a.score,
media_type: 'anime',
}))

// Combine + sort
const allResults = (filter === 'anime'
? normalizedAnime
: filter === 'all'
? [...tmdbResults, ...normalizedAnime]
: tmdbResults
).sort((a: any, b: any) => (b.vote_average || 0) - (a.vote_average || 0))

const isLoading = tmdbLoading || animeLoading

return ( <div className="min-h-screen bg-[#141414]"> <div className="pt-20 pb-16 px-4 sm:px-8 lg:px-16">

```
    {/* Search */}
    <div className="max-w-2xl mb-8">
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => handleChange(e.target.value)}
          placeholder="Search movies, TV shows, anime..."
          className="w-full bg-zinc-900 border border-zinc-700 text-white pl-12 pr-12 py-4 rounded-xl"
        />
        {query && (
          <button onClick={() => handleChange('')} className="absolute right-4 top-1/2 -translate-y-1/2">
            <X className="w-5 h-5 text-zinc-400" />
          </button>
        )}
      </div>
    </div>

    {/* Loading */}
    {isLoading && debouncedQuery && (
      <div className="flex items-center gap-2 text-zinc-400">
        <Spinner size="sm" />
        Searching...
      </div>
    )}

    {/* Results */}
    {debouncedQuery && !isLoading && (
      <motion.div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        <AnimatePresence>
          {allResults.map((item: any, i) => (
            <motion.div key={item.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <MovieCard movie={item} index={i} />
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>
    )}

    {/* Empty */}
    {!debouncedQuery && (
      <div className="text-center text-zinc-500 py-20">
        Start typing to search...
      </div>
    )}

  </div>
</div>
```

)
}
