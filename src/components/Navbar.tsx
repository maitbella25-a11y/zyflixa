import React, { useState, useEffect, useRef, useCallback } from 'react'
import { Link } from '@tanstack/react-router'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Bell, User, Menu, X } from 'lucide-react'
import { useSearch } from '../hooks/useMovies'
import { getImageUrl } from '../lib/tmdb'
import type { Movie } from '../lib/tmdb'

const NAVBAR_HEIGHT = 64

const SearchDropdown = ({ query, onClose }: { query: string; onClose: () => void }) => {
  const { data, isLoading } = useSearch(query)

  const results = (data?.results || [])
    .filter((m: Movie) => m.media_type !== 'person' && m.poster_path)
    .slice(0, 6)

  if (query.length < 2) return null

  return (
    <div className="absolute top-full right-0 mt-2 w-72 bg-zinc-900 rounded-xl shadow-2xl z-50 border border-zinc-700/50 overflow-hidden">
      {isLoading ? (
        <p className="p-4 text-sm text-zinc-400">Searching...</p>
      ) : results.length === 0 ? (
        <p className="p-4 text-sm text-zinc-400">No results found</p>
      ) : (
        results.map((movie: Movie) => (
          <Link
            key={movie.id}
            to="/details/$mediaType/$id"
            params={{ mediaType: movie.media_type || 'movie', id: String(movie.id) }}
            onClick={onClose}
            className="flex items-center gap-3 p-3 hover:bg-zinc-800 transition-colors"
          >
            <img
              src={getImageUrl(movie.poster_path, 'w92')}
              className="w-8 h-12 object-cover rounded flex-shrink-0"
              alt={movie.title || movie.name}
            />
            <div className="min-w-0">
              <span className="text-white text-sm font-medium line-clamp-1">
                {movie.title || movie.name}
              </span>
              <span className="text-zinc-500 text-xs capitalize">{movie.media_type}</span>
            </div>
          </Link>
        ))
      )}
    </div>
  )
}

export const Navbar = () => {
  const [showSearch, setShowSearch] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  const searchRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (showSearch) searchRef.current?.focus()
  }, [showSearch])

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const closeSearch = useCallback(() => {
    setShowSearch(false)
    setSearchQuery('')
  }, [])

  const closeMobileMenu = useCallback(() => {
    setMobileMenuOpen(false)
  }, [])

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-colors duration-300 ${
          scrolled ? 'bg-[#141414]' : 'bg-gradient-to-b from-black/80 to-transparent'
        }`}
      >
        <div className="flex items-center justify-between px-4 sm:px-8 lg:px-16 h-16">
          {/* Logo */}
          <Link
            to="/"
            className="text-[#E50914] text-2xl font-black flex-shrink-0"
            style={{ fontFamily: "'Bebas Neue', sans-serif", letterSpacing: '0.05em' }}
          >
            ZYFLIXA
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden lg:flex gap-6">
            <Link to="/" className="text-zinc-300 hover:text-white transition-colors text-sm font-medium">Home</Link>
            <Link to="/browse/movies" className="text-zinc-300 hover:text-white transition-colors text-sm font-medium">Movies</Link>
            <Link to="/browse/tv" className="text-zinc-300 hover:text-white transition-colors text-sm font-medium">TV Shows</Link>
            <Link to="/search" className="text-zinc-300 hover:text-white transition-colors text-sm font-medium">Anime</Link>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Search */}
            <div className="relative">
              <AnimatePresence>
                {showSearch ? (
                  <motion.div
                    initial={{ width: 0, opacity: 0 }}
                    animate={{ width: 200, opacity: 1 }}
                    exit={{ width: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="flex items-center bg-zinc-900 border border-zinc-700 rounded-lg overflow-hidden"
                  >
                    <Search className="w-4 h-4 text-zinc-400 ml-3 flex-shrink-0" />
                    <input
                      ref={searchRef}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="bg-transparent text-white text-sm outline-none px-2 py-2 w-full"
                      placeholder="Search..."
                    />
                    <button onClick={closeSearch} className="pr-2">
                      <X className="w-4 h-4 text-zinc-400 hover:text-white transition-colors" />
                    </button>
                  </motion.div>
                ) : (
                  <button
                    onClick={() => setShowSearch(true)}
                    className="p-2 rounded-full hover:bg-white/10 transition-colors"
                  >
                    <Search className="w-5 h-5 text-white" />
                  </button>
                )}
              </AnimatePresence>

              {showSearch && searchQuery.length >= 2 && (
                <SearchDropdown query={searchQuery} onClose={closeSearch} />
              )}
            </div>

            {/* Bell & User (desktop) */}
            <button className="hidden sm:flex p-2 rounded-full hover:bg-white/10 transition-colors">
              <Bell className="w-5 h-5 text-white" />
            </button>
            <Link to="/profile" className="hidden sm:flex p-2 rounded-full hover:bg-white/10 transition-colors">
              <User className="w-5 h-5 text-white" />
            </Link>

            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-full hover:bg-white/10 transition-colors"
            >
              {mobileMenuOpen ? <X className="w-5 h-5 text-white" /> : <Menu className="w-5 h-5 text-white" />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Dropdown Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="fixed top-16 left-0 right-0 z-40 bg-[#141414]/97 backdrop-blur-sm border-b border-zinc-800 lg:hidden"
          >
            <div className="px-4 py-4 flex flex-col gap-1">
              <Link to="/" onClick={closeMobileMenu} className="text-zinc-200 hover:text-white hover:bg-zinc-800 px-4 py-3 rounded-lg transition-colors text-sm font-medium">🏠 Home</Link>
              <Link to="/browse/movies" onClick={closeMobileMenu} className="text-zinc-200 hover:text-white hover:bg-zinc-800 px-4 py-3 rounded-lg transition-colors text-sm font-medium">🎬 Movies</Link>
              <Link to="/browse/tv" onClick={closeMobileMenu} className="text-zinc-200 hover:text-white hover:bg-zinc-800 px-4 py-3 rounded-lg transition-colors text-sm font-medium">📺 TV Shows</Link>
              <Link to="/search" onClick={closeMobileMenu} className="text-zinc-200 hover:text-white hover:bg-zinc-800 px-4 py-3 rounded-lg transition-colors text-sm font-medium">🎌 Anime</Link>
              <Link to="/search" onClick={closeMobileMenu} className="text-zinc-200 hover:text-white hover:bg-zinc-800 px-4 py-3 rounded-lg transition-colors text-sm font-medium">🔍 Search</Link>
              <Link to="/profile" onClick={closeMobileMenu} className="text-zinc-200 hover:text-white hover:bg-zinc-800 px-4 py-3 rounded-lg transition-colors text-sm font-medium">👤 Profile</Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Spacer */}
      <div style={{ height: NAVBAR_HEIGHT }} />
    </>
  )
}
