import React, { useState, useEffect, useRef, useCallback } from 'react'
import { Link, useNavigate } from '@tanstack/react-router'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Bell, User, Menu, X, Film, Tv, Star } from 'lucide-react'
import { useSearch } from '../hooks/useMovies'
import { getImageUrl } from '../lib/tmdb'
import type { Movie } from '../lib/tmdb'

// ─── Instant search dropdown ──────────────────────────────────────────────────
const SearchDropdown: React.FC<{
  query: string
  onClose: () => void
  onSelect: () => void
}> = ({ query, onClose, onSelect }) => {
  const { data, isLoading } = useSearch(query)
  const results = (data?.results || [])
    .filter((m: Movie) => m.media_type !== 'person' && (m.poster_path || m.backdrop_path))
    .slice(0, 8)
  const navigate = useNavigate()

  if (query.length < 2) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      transition={{ duration: 0.15 }}
      className="absolute top-full left-0 right-0 mt-1 bg-zinc-900/98 backdrop-blur-md border border-zinc-700/60 rounded-xl shadow-2xl overflow-hidden z-50"
    >
      {isLoading ? (
        <div className="px-4 py-6 text-center text-zinc-500 text-sm">Searching...</div>
      ) : results.length === 0 ? (
        <div className="px-4 py-6 text-center text-zinc-500 text-sm">
          No results for "{query}"
        </div>
      ) : (
        <>
          <div className="px-4 py-2 border-b border-zinc-800">
            <span className="text-zinc-500 text-xs">
              Quick Results — press Enter to see all
            </span>
          </div>
          <div className="max-h-[400px] overflow-y-auto">
            {results.map((movie) => {
              const t = (movie as { title?: string; name?: string }).title || movie.name || ''
              const y = (
                (movie as { release_date?: string; first_air_date?: string }).release_date ||
                movie.first_air_date || ''
              ).slice(0, 4)
              const isTV = movie.media_type === 'tv'
              return (
                <Link
                  key={`${movie.id}-${movie.media_type}`}
                  to="/details/$mediaType/$id"
                  params={{ mediaType: movie.media_type || 'movie', id: String(movie.id) }}
                  onClick={onSelect}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-zinc-800/80 transition-colors group"
                >
                  <div className="w-10 h-14 flex-shrink-0 rounded overflow-hidden bg-zinc-800">
                    {movie.poster_path ? (
                      <img
                        src={getImageUrl(movie.poster_path, 'w92')}
                        alt={t}
                        loading="lazy"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-zinc-600">
                        {isTV ? <Tv className="w-4 h-4" /> : <Film className="w-4 h-4" />}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-medium group-hover:text-[#E50914] transition-colors truncate">
                      {t}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-zinc-500 mt-0.5">
                      <span className="flex items-center gap-1">
                        {isTV ? <Tv className="w-3 h-3" /> : <Film className="w-3 h-3" />}
                        {isTV ? 'TV' : 'Movie'}
                      </span>
                      {y && <span>• {y}</span>}
                      {movie.vote_average > 0 && (
                        <span className="flex items-center gap-0.5">
                          • <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                          {movie.vote_average.toFixed(1)}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
          <div className="px-4 py-2.5 border-t border-zinc-800 bg-zinc-950/60">
            <a
              href={`/search?q=${encodeURIComponent(query)}`}
              onClick={onClose}
              className="text-[#E50914] text-xs hover:underline w-full text-left block"
            >
              See all results for "{query}" →
            </a>
          </div>
        </>
      )}
    </motion.div>
  )
}

// ─── Navbar ───────────────────────────────────────────────────────────────────
export const Navbar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false)
  const [showSearch, setShowSearch] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const searchRef = useRef<HTMLInputElement>(null)
  const searchContainerRef = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    if (showSearch) searchRef.current?.focus()
  }, [showSearch])

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setShowSearch(false)
        setSearchQuery('')
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const goToSearch = (q: string) => {
    window.location.href = `/search?q=${encodeURIComponent(q.trim())}`
  }

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      goToSearch(searchQuery)
      setShowSearch(false)
      setSearchQuery('')
    }
  }

  const handleMobileSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      goToSearch(searchQuery)
      setMobileMenuOpen(false)
      setSearchQuery('')
    }
  }

  const closeSearch = useCallback(() => {
    setShowSearch(false)
    setSearchQuery('')
  }, [])

  const navLinks = [
    { label: 'Home', to: '/' },
    { label: 'Movies', to: '/browse/movies' },
    { label: 'TV Shows', to: '/browse/tv' },
    { label: 'New & Popular', to: '/browse/trending' },
  ]

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-[#141414]/97 backdrop-blur-sm shadow-lg'
          : 'bg-gradient-to-b from-black/80 to-transparent'
      }`}
    >
      <div className="flex items-center justify-between px-4 sm:px-8 lg:px-16 h-16">
        {/* Logo + Nav Links */}
        <div className="flex items-center gap-6 lg:gap-8">
          <Link to="/" className="flex-shrink-0">
            <span
              className="text-[#E50914] font-black text-xl sm:text-2xl"
              style={{ fontFamily: "'Bebas Neue', sans-serif", letterSpacing: '0.05em' }}
            >
              CINESTREAM
            </span>
          </Link>
          <div className="hidden lg:flex items-center gap-5">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="text-sm text-zinc-300 hover:text-white transition-colors font-medium whitespace-nowrap"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-1 sm:gap-2">
          {/* Search */}
          <div ref={searchContainerRef} className="relative">
            <AnimatePresence mode="wait">
              {showSearch ? (
                <motion.form
                  key="search-open"
                  initial={{ width: 40, opacity: 0 }}
                  animate={{ width: 'auto', opacity: 1 }}
                  exit={{ width: 40, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  onSubmit={handleSearchSubmit}
                  className="flex items-center bg-zinc-900/95 border border-zinc-600 rounded-lg overflow-hidden"
                >
                  <Search className="w-4 h-4 text-zinc-400 ml-3 flex-shrink-0" />
                  <input
                    ref={searchRef}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Titles, people, genres"
                    className="bg-transparent text-white text-sm px-3 py-2 w-44 sm:w-60 outline-none placeholder:text-zinc-500"
                  />
                  <button
                    type="button"
                    onClick={closeSearch}
                    className="p-2 text-zinc-400 hover:text-white transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </motion.form>
              ) : (
                <motion.button
                  key="search-closed"
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  onClick={() => setShowSearch(true)}
                  className="text-zinc-300 hover:text-white p-2 rounded-full transition-colors"
                >
                  <Search className="w-5 h-5" />
                </motion.button>
              )}
            </AnimatePresence>

            {/* Instant dropdown */}
            <AnimatePresence>
              {showSearch && searchQuery.length >= 2 && (
                <SearchDropdown
                  query={searchQuery}
                  onClose={closeSearch}
                  onSelect={closeSearch}
                />
              )}
            </AnimatePresence>
          </div>

          <button className="text-zinc-300 hover:text-white p-2 rounded-full transition-colors hidden sm:block">
            <Bell className="w-5 h-5" />
          </button>

          <Link
            to="/profile"
            className="hidden sm:flex items-center gap-1.5 text-zinc-300 hover:text-white transition-colors"
          >
            <div className="w-8 h-8 rounded bg-[#E50914] flex items-center justify-center">
              <User className="w-4 h-4 text-white" />
            </div>
          </Link>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden text-zinc-300 hover:text-white p-2 transition-colors"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="lg:hidden bg-[#0a0a0a]/98 border-t border-white/10 px-4 py-4 space-y-1"
          >
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setMobileMenuOpen(false)}
                className="block text-base text-zinc-300 hover:text-white py-3 px-2 rounded-lg hover:bg-zinc-800/50 transition-all font-medium"
              >
                {link.label}
              </Link>
            ))}
            <div className="pt-3 border-t border-white/10">
              <form onSubmit={handleMobileSearch}>
                <div className="flex items-center bg-zinc-800 rounded-lg px-3 py-2.5">
                  <Search className="w-4 h-4 text-zinc-400 mr-2 flex-shrink-0" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search movies, shows..."
                    className="bg-transparent text-white text-sm flex-1 outline-none placeholder:text-zinc-500"
                  />
                  {searchQuery && (
                    <button type="submit" className="text-[#E50914] text-xs font-semibold ml-2">
                      Go
                    </button>
                  )}
                </div>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  )
}
