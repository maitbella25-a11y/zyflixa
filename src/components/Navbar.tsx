import React, { useState, useEffect, useRef, useCallback } from 'react'
import { Link } from '@tanstack/react-router'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Bell, User, Menu, X } from 'lucide-react'
import { useSearch } from '../hooks/useMovies'
import { getImageUrl } from '../lib/tmdb'
import type { Movie } from '../lib/tmdb'

const NAVBAR_HEIGHT = 64

const SearchDropdown = ({ query, onClose }: any) => {
const { data, isLoading } = useSearch(query)

const results = (data?.results || [])
.filter((m: Movie) => m.media_type !== 'person' && m.poster_path)
.slice(0, 6)

if (query.length < 2) return null

return ( <div className="absolute top-full right-0 mt-2 w-64 bg-zinc-900 rounded shadow-lg z-50">
{isLoading ? ( <p className="p-3 text-sm text-zinc-400">Searching...</p>
) : (
results.map((movie) => (
<Link
key={movie.id}
to="/details/$mediaType/$id"
params={{ mediaType: movie.media_type || 'movie', id: String(movie.id) }}
onClick={onClose}
className="flex items-center gap-2 p-2 hover:bg-zinc-800"
>
<img
src={getImageUrl(movie.poster_path, 'w92')}
className="w-8 h-12 object-cover"
/> <span className="text-white text-sm">
{movie.title || movie.name} </span> </Link>
))
)} </div>
)
}

export const Navbar = () => {
const [showSearch, setShowSearch] = useState(false)
const [searchQuery, setSearchQuery] = useState('')
const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

const searchRef = useRef<HTMLInputElement>(null)

useEffect(() => {
if (showSearch) searchRef.current?.focus()
}, [showSearch])

const closeSearch = useCallback(() => {
setShowSearch(false)
setSearchQuery('')
}, [])

return (
<> <nav className="fixed top-0 left-0 right-0 z-50 bg-[#141414]"> <div className="flex items-center justify-between px-4 sm:px-8 lg:px-16 h-16">

```
      {/* Logo */}
      <Link to="/" className="text-[#E50914] text-2xl font-bold">
        ZYFLIXA
      </Link>

      {/* Links */}
      <div className="hidden lg:flex gap-6">
        <Link to="/" className="text-zinc-300 hover:text-white">Home</Link>
        <Link to="/browse/movies" className="text-zinc-300 hover:text-white">Movies</Link>
        <Link to="/browse/tv" className="text-zinc-300 hover:text-white">TV Shows</Link>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3">

        {/* Search */}
        <div className="relative">
          <button onClick={() => setShowSearch(!showSearch)}>
            <Search className="w-5 h-5 text-white" />
          </button>

          {showSearch && (
            <div className="absolute right-0 mt-2 bg-zinc-900 p-2 rounded">
              <input
                ref={searchRef}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent text-white outline-none"
                placeholder="Search..."
              />

              <SearchDropdown
                query={searchQuery}
                onClose={closeSearch}
              />
            </div>
          )}
        </div>

        {/* Icons */}
        <Bell className="w-5 h-5 text-white" />
        <User className="w-5 h-5 text-white" />

        {/* Mobile */}
        <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          {mobileMenuOpen ? <X /> : <Menu />}
        </button>

      </div>
    </div>
  </nav>

  {/* حل مشكل navbar */}
  <div style={{ height: NAVBAR_HEIGHT }} />
</>
```

)
}
