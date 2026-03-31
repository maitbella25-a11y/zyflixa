import React, { useState, useEffect, useRef, useCallback } from 'react'
import { Link, useNavigate } from '@tanstack/react-router'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Bell, User, Menu, X, Film, Tv, Star } from 'lucide-react'
import { useSearch } from '../hooks/useMovies'
import { getImageUrl } from '../lib/tmdb'
import type { Movie } from '../lib/tmdb'

const NAVBAR_HEIGHT = 64

const SearchDropdown: React.FC<{
query: string
onClose: () => void
onSelect: () => void
}> = ({ query, onClose, onSelect }) => {
const { data, isLoading } = useSearch(query)

const results = (data?.results || [])
.filter((m: Movie) => m.media_type !== 'person' && (m.poster_path || m.backdrop_path))
.slice(0, 8)

if (query.length < 2) return null

return (
<motion.div
initial={{ opacity: 0, y: -6 }}
animate={{ opacity: 1, y: 0 }}
exit={{ opacity: 0, y: -6 }}
className="absolute top-full left-0 right-0 mt-1 bg-zinc-900 border border-zinc-700 rounded-xl shadow-2xl z-50"
>
{isLoading ? ( <div className="px-4 py-6 text-center text-zinc-500 text-sm">
Searching... </div>
) : results.length === 0 ? ( <div className="px-4 py-6 text-center text-zinc-500 text-sm">
No results for "{query}" </div>
) : (
<> <div className="max-h-[400px] overflow-y-auto">
{results.map((movie) => {
const title = movie.title || movie.name || ''
return (
<Link
key={movie.id}
to="/details/$mediaType/$id"
params={{ mediaType: movie.media_type || 'movie', id: String(movie.id) }}
onClick={onSelect}
className="flex items-center gap-3 px-4 py-3 hover:bg-zinc-800"
>
<img
src={getImageUrl(movie.poster_path, 'w92')}
className="w-10 h-14 object-cover rounded"
/> <p className="text-white text-sm">{title}</p> </Link>
)
})} </div>
</>
)}
</motion.div>
)
}

export const Navbar: React.FC = () => {
const [isScrolled, setIsScrolled] = useState(false)
const [showSearch, setShowSearch] = useState(false)
const [searchQuery, setSearchQuery] = useState('')
const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

const searchRef = useRef<HTMLInputElement>(null)
const searchContainerRef = useRef<HTMLDivElement>(null)

useEffect(() => {
const onScroll = () => setIsScrolled(window.scrollY > 20)
window.addEventListener('scroll', onScroll)
return () => window.removeEventListener('scroll', onScroll)
}, [])

useEffect(() => {
if (showSearch) searchRef.current?.focus()
}, [showSearch])

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
<> <nav className="fixed top-0 left-0 right-0 z-50 bg-[#141414]"> <div className="flex items-center justify-between px-4 sm:px-8 lg:px-16 h-16">

```
      <Link to="/" className="text-[#E50914] font-black text-xl">
        ZYFLIXA
      </Link>

      <div className="hidden lg:flex gap-5">
        {navLinks.map((link) => (
          <Link key={link.to} to={link.to} className="text-zinc-300 hover:text-white">
            {link.label}
          </Link>
        ))}
      </div>

      <div className="flex items-center gap-3">
        <div ref={searchContainerRef} className="relative">
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
              />
              <SearchDropdown
                query={searchQuery}
                onClose={closeSearch}
                onSelect={closeSearch}
              />
            </div>
          )}
        </div>

        <Bell className="w-5 h-5 text-white" />
        <User className="w-5 h-5 text-white" />

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
