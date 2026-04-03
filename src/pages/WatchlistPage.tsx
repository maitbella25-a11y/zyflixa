import React, { useState, useMemo } from 'react'
import { Link } from '@tanstack/react-router'
import { motion, AnimatePresence } from 'framer-motion'
import { Bookmark, Trash2, ChevronLeft, BookmarkX, SlidersHorizontal } from 'lucide-react'
import { useWatchlist } from '../hooks/useWatchlist'
import { getImageUrl } from '../lib/tmdb'

type FilterType = 'all' | 'movie' | 'tv' | 'anime'
type SortType = 'recent' | 'rating' | 'title'

export const WatchlistPage: React.FC = () => {
  const { watchlist, removeFromWatchlist, clearWatchlist, count } = useWatchlist()
  const [filter, setFilter] = useState<FilterType>('all')
  const [sort, setSort] = useState<SortType>('recent')
  const [showControls, setShowControls] = useState(false)

  const filtered = useMemo(() => {
    let items = filter === 'all' ? watchlist : watchlist.filter((i) => i.mediaType === filter)
    if (sort === 'rating') items = [...items].sort((a, b) => (b.voteAverage || 0) - (a.voteAverage || 0))
    else if (sort === 'title') items = [...items].sort((a, b) => a.title.localeCompare(b.title))
    // 'recent' = default order (last added first)
    return items
  }, [watchlist, filter, sort])

  const counts = {
    all: watchlist.length,
    movie: watchlist.filter((i) => i.mediaType === 'movie').length,
    tv: watchlist.filter((i) => i.mediaType === 'tv').length,
    anime: watchlist.filter((i) => i.mediaType === 'anime').length,
  }

  return (
    <div className="min-h-screen bg-[#141414] pb-16">
      {/* Header */}
      <div className="pt-24 px-4 sm:px-8 lg:px-16 pb-6 border-b border-zinc-800/60">
        <Link to="/" className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors text-sm mb-4 w-fit">
          <ChevronLeft className="w-4 h-4" />
          Back to Home
        </Link>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <Bookmark className="w-7 h-7 text-[#E50914]" />
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-white" style={{ fontFamily: "'Bebas Neue', sans-serif", letterSpacing: '0.02em' }}>
                My Watchlist
              </h1>
              <p className="text-zinc-500 text-sm">{count} title{count !== 1 ? 's' : ''} saved</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {count > 0 && (
              <button
                onClick={() => setShowControls((v) => !v)}
                className={`flex items-center gap-1.5 text-sm px-3 py-2 rounded-lg transition-colors ${
                  showControls ? 'bg-zinc-700 text-white' : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
                }`}
              >
                <SlidersHorizontal className="w-4 h-4" />
                Filter & Sort
              </button>
            )}
            {count > 0 && (
              <button
                onClick={clearWatchlist}
                className="flex items-center gap-2 text-sm text-zinc-400 hover:text-red-400 transition-colors px-3 py-2 rounded-lg hover:bg-zinc-800"
              >
                <Trash2 className="w-4 h-4" />
                Clear All
              </button>
            )}
          </div>
        </div>

        {/* Filter & Sort controls */}
        <AnimatePresence>
          {showControls && count > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="pt-4 flex flex-wrap gap-6">
                {/* Filter */}
                <div>
                  <p className="text-zinc-500 text-xs uppercase tracking-wider mb-2">Filter</p>
                  <div className="flex gap-2 flex-wrap">
                    {(['all', 'movie', 'tv', 'anime'] as FilterType[]).map((f) => (
                      <button
                        key={f}
                        onClick={() => setFilter(f)}
                        className={`text-xs px-3 py-1.5 rounded-full border transition-all ${
                          filter === f
                            ? f === 'anime' ? 'bg-violet-600 text-white border-violet-600'
                              : 'bg-[#E50914] text-white border-[#E50914]'
                            : 'bg-zinc-800 text-zinc-400 border-zinc-700 hover:text-white hover:bg-zinc-700'
                        }`}
                      >
                        {f === 'all' ? `All (${counts.all})` :
                         f === 'movie' ? `Movies (${counts.movie})` :
                         f === 'tv' ? `TV (${counts.tv})` :
                         `Anime (${counts.anime})`}
                      </button>
                    ))}
                  </div>
                </div>
                {/* Sort */}
                <div>
                  <p className="text-zinc-500 text-xs uppercase tracking-wider mb-2">Sort</p>
                  <div className="flex gap-2">
                    {([
                      { v: 'recent', l: 'Recent' },
                      { v: 'rating', l: 'Rating' },
                      { v: 'title',  l: 'Title A-Z' },
                    ] as { v: SortType; l: string }[]).map(({ v, l }) => (
                      <button
                        key={v}
                        onClick={() => setSort(v)}
                        className={`text-xs px-3 py-1.5 rounded-full border transition-all ${
                          sort === v
                            ? 'bg-zinc-600 text-white border-zinc-600'
                            : 'bg-zinc-800 text-zinc-400 border-zinc-700 hover:text-white hover:bg-zinc-700'
                        }`}
                      >
                        {l}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Content */}
      <div className="px-4 sm:px-8 lg:px-16 pt-8">
        {count === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <BookmarkX className="w-16 h-16 text-zinc-700 mb-4" />
            <h2 className="text-xl font-semibold text-white mb-2">Your watchlist is empty</h2>
            <p className="text-zinc-500 text-sm mb-6">Add movies and shows you want to watch later</p>
            <Link to="/" className="bg-[#E50914] text-white font-semibold px-6 py-3 rounded-lg hover:bg-[#E50914]/90 transition-colors text-sm">
              Browse Content
            </Link>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <p className="text-zinc-400 text-lg mb-2">No {filter} titles in your list</p>
            <button onClick={() => setFilter('all')} className="text-[#E50914] hover:underline text-sm mt-2">
              Show all
            </button>
          </div>
        ) : (
          <motion.div layout className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            <AnimatePresence>
              {filtered.map((item, i) => {
                const linkMediaType = item.mediaType === 'anime' ? 'anime' : item.mediaType
                const isAnime = item.mediaType === 'anime'
                const posterUrl = item.posterPath?.startsWith('http')
                  ? item.posterPath
                  : getImageUrl(item.posterPath, 'w342')

                return (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.2, delay: Math.min(i * 0.03, 0.3) }}
                    className="group relative"
                  >
                    <Link
                      to={isAnime ? '/anime/$id' : '/details/$mediaType/$id'}
                      params={isAnime ? { id: String(item.id) } : { mediaType: item.mediaType, id: String(item.id) }}
                    >
                      <div className="relative aspect-[2/3] rounded-lg overflow-hidden bg-zinc-800 mb-2 group-hover:ring-1 group-hover:ring-white/20 transition-all">
                        {posterUrl ? (
                          <img src={posterUrl} alt={item.title} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-zinc-500 text-xs text-center p-2">{item.title}</div>
                        )}
                        {item.voteAverage > 0 && (
                          <div className="absolute top-2 right-2 bg-black/70 text-yellow-400 text-xs font-bold px-1.5 py-0.5 rounded flex items-center gap-0.5">
                            ★ {item.voteAverage.toFixed(1)}
                          </div>
                        )}
                        <div className={`absolute top-2 left-2 text-[10px] font-bold px-1.5 py-0.5 rounded ${
                          item.mediaType === 'anime' ? 'bg-violet-600/90 text-white' :
                          item.mediaType === 'tv' ? 'bg-blue-600/80 text-white' : 'bg-zinc-700/80 text-white'
                        }`}>
                          {item.mediaType === 'anime' ? 'ANIME' : item.mediaType === 'tv' ? 'TV' : 'MOVIE'}
                        </div>
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                          <button
                            onClick={(e) => { e.preventDefault(); e.stopPropagation(); removeFromWatchlist(item.id) }}
                            className="w-9 h-9 rounded-full bg-red-600 flex items-center justify-center hover:bg-red-700 transition-colors shadow-lg"
                          >
                            <Trash2 className="w-4 h-4 text-white" />
                          </button>
                        </div>
                      </div>
                      <h3 className="text-sm font-medium text-white/90 line-clamp-1 group-hover:text-white transition-colors">{item.title}</h3>
                    </Link>
                  </motion.div>
                )
              })}
            </AnimatePresence>
          </motion.div>
        )}
      </div>
    </div>
  )
}
