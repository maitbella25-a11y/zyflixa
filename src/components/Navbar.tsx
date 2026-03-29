import React, { useState, useEffect, useRef } from 'react'
import { Link } from '@tanstack/react-router'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Bell, User, Menu, X } from 'lucide-react'

export const Navbar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false)
  const [showSearch, setShowSearch] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const searchRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    if (showSearch) searchRef.current?.focus()
  }, [showSearch])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      window.location.href = `/search?q=${encodeURIComponent(searchQuery.trim())}`
      setShowSearch(false)
      setSearchQuery('')
    }
  }

  const handleMobileSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      window.location.href = `/search?q=${encodeURIComponent(searchQuery.trim())}`
      setMobileMenuOpen(false)
      setSearchQuery('')
    }
  }

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
          ? 'bg-[#141414]/95 backdrop-blur-sm shadow-lg'
          : 'bg-gradient-to-b from-black/80 to-transparent'
      }`}
    >
      <div className="flex items-center justify-between px-4 sm:px-8 lg:px-16 h-16">
        {/* Logo */}
        <div className="flex items-center gap-8">
          <Link to="/" className="flex-shrink-0">
            <span
              className="text-[#E50914] font-black text-2xl tracking-tight"
              style={{ fontFamily: "'Bebas Neue', sans-serif", letterSpacing: '0.05em' }}
            >
              Zyflixa
            </span>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden lg:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="text-sm text-zinc-300 hover:text-white transition-colors font-medium"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Search */}
          <AnimatePresence mode="wait">
            {showSearch ? (
              <motion.form
                key="search-open"
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: 'auto', opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                onSubmit={handleSearch}
                className="flex items-center bg-black/80 border border-white/30 rounded overflow-hidden"
              >
                <Search className="w-4 h-4 text-white ml-3 flex-shrink-0" />
                <input
                  ref={searchRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Titles, people, genres"
                  className="bg-transparent text-white text-sm px-3 py-2 w-48 sm:w-64 outline-none placeholder:text-zinc-500"
                />
                <button
                  type="button"
                  onClick={() => setShowSearch(false)}
                  className="p-2 text-zinc-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </motion.form>
            ) : (
              <motion.button
                key="search-closed"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowSearch(true)}
                className="text-zinc-300 hover:text-white p-1.5 rounded-full transition-colors"
              >
                <Search className="w-5 h-5" />
              </motion.button>
            )}
          </AnimatePresence>

          <button className="text-zinc-300 hover:text-white p-1.5 rounded-full transition-colors hidden sm:block">
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

          {/* Mobile menu toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden text-zinc-300 hover:text-white p-1.5"
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
            className="lg:hidden bg-[#141414]/98 border-t border-white/10 px-4 py-4 space-y-3"
          >
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setMobileMenuOpen(false)}
                className="block text-base text-zinc-300 hover:text-white py-2 transition-colors font-medium"
              >
                {link.label}
              </Link>
            ))}
            <div className="pt-2 border-t border-white/10">
              <form onSubmit={handleMobileSearch}>
                <div className="flex items-center bg-zinc-800 rounded px-3 py-2">
                  <Search className="w-4 h-4 text-zinc-400 mr-2 flex-shrink-0" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search..."
                    className="bg-transparent text-white text-sm flex-1 outline-none"
                  />
                </div>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  )
}
