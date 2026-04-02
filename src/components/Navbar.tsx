import React, { useState, useEffect, useRef } from 'react'
import { Link, useLocation } from '@tanstack/react-router'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Bell, User, Menu, X } from 'lucide-react'

export const Navbar: React.FC = () => {
const [isScrolled, setIsScrolled] = useState(false)
const [showSearch, setShowSearch] = useState(false)
const [searchQuery, setSearchQuery] = useState('')
const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

const location = useLocation()
const isWatchPage = location.pathname.startsWith('/watch')

const searchRef = useRef<HTMLInputElement>(null)

useEffect(() => {
const onScroll = () => setIsScrolled(window.scrollY > 20)
window.addEventListener('scroll', onScroll, { passive: true })
return () => window.removeEventListener('scroll', onScroll)
}, [])

useEffect(() => {
if (showSearch) searchRef.current?.focus()
}, [showSearch])

if (isWatchPage) return null

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
{ label: 'Anime', to: '/browse/anime' },
]

return (
<nav
className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-[#141414]/95 backdrop-blur-sm shadow-lg'
          : 'bg-gradient-to-b from-black/80 to-transparent'
      }`}
> <div className="flex items-center justify-between px-4 sm:px-8 lg:px-16 h-16"> <div className="flex items-center gap-8"> <Link to="/" className="flex-shrink-0"> <span className="text-[#E50914] font-black text-2xl tracking-tight">
ZYFLIXA </span> </Link>

```
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

    <div className="flex items-center gap-2 sm:gap-4">
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
              className="bg-transparent text-white text-sm px-3 py-2 w-48 sm:w-64 outline-none"
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
            onClick={() => setShowSearch(true)}
            className="text-zinc-300 hover:text-white p-1.5 rounded-full"
          >
            <Search className="w-5 h-5" />
          </motion.button>
        )}
      </AnimatePresence>

      <button className="text-zinc-300 hover:text-white p-1.5 hidden sm:block">
        <Bell className="w-5 h-5" />
      </button>

      <Link
        to="/profile"
        className="hidden sm:flex items-center gap-1.5 text-zinc-300 hover:text-white"
      >
        <div className="w-8 h-8 rounded bg-[#E50914] flex items-center justify-center">
          <User className="w-4 h-4 text-white" />
        </div>
      </Link>

      <button
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        className="lg:hidden text-zinc-300 hover:text-white p-1.5"
      >
        {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>
    </div>
  </div>
</nav>
```

)
}
