import React, { useState, useEffect, useRef, useCallback } from 'react'
import { Link, useNavigate } from '@tanstack/react-router'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Bell, User, Menu, X, Film, Tv, Star } from 'lucide-react'
import { useSearch } from '../hooks/useMovies'
import { getImageUrl } from '../lib/tmdb'
import type { Movie } from '../lib/tmdb'

const NAVBAR_HEIGHT = 64 // 🔥 زيدنا غير هادي

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
{isLoading ? ( <div className="px-4 py-6 text-center text-zinc-500 text-sm">Searching...</div>
) : results.length === 0 ? ( <div className="px-4 py-6 text-center text-zinc-500 text-sm">
No results for "{query}" </div>
) : (
<> <div className="px-4 py-2 border-b border-zinc-800"> <span className="text-zinc-500 text-xs">
Quick Results — press Enter to see all </span> </div> <div className="max-h-[400px] overflow-y-auto">
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
> <div className="w-10 h-14 flex-shrink-0 rounded overflow-hidden bg-zinc-800">
{movie.poster_path ? (
<img
src={getImageUrl(movie.poster_path, 'w92')}
alt={t}
loading="lazy"
className="w-full h-full object-cover"
/>
) : ( <div className="w-full h-full flex items-center justify-center text-zinc-600">
{isTV ? <Tv className="w-4 h-4" /> : <Film className="w-4 h-4" />} </div>
)} </div> <div className="flex-1 min-w-0"> <p className="text-white text-sm font-medium group-hover:text-[#E50914] transition-colors truncate">
{t} </p> <div className="flex items-center gap-2 text-xs text-zinc-500 mt-0.5"> <span className="flex items-center gap-1">
{isTV ? <Tv className="w-3 h-3" /> : <Film className="w-3 h-3" />}
{isTV ? 'TV' : 'Movie'} </span>
{y && <span>• {y}</span>}
{movie.vote_average > 0 && ( <span className="flex items-center gap-0.5">
• <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
{movie.vote_average.toFixed(1)} </span>
)} </div> </div> </Link>
)
})} </div> <div className="px-4 py-2.5 border-t border-zinc-800 bg-zinc-950/60">
<a
href={`/search?q=${encodeURIComponent(query)}`}
onClick={onClose}
className="text-[#E50914] text-xs hover:underline w-full text-left block"
>
See all results for "{query}" → </a> </div>
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
<>
<nav
className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled
            ? 'bg-[#141414]/97 backdrop-blur-sm shadow-lg'
            : 'bg-gradient-to-b from-black/80 to-transparent'
        }`}
> <div className="flex items-center justify-between px-4 sm:px-8 lg:px-16 h-16"> <div className="flex items-center gap-6 lg:gap-8"> <Link to="/" className="flex-shrink-0"> <span className="text-[#E50914] font-black text-xl sm:text-2xl">
ZYFLIXA </span> </Link>

```
        <div className="hidden lg:flex items-center gap-5">
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

      <div className="flex items-center gap-2">
        <div ref={searchContainerRef} className="relative">
          <AnimatePresence>
            {showSearch && (
              <motion.form onSubmit={handleSearchSubmit}>
                <input
                  ref={searchRef}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-black text-white px-3 py-1 rounded"
                />
              </motion.form>
            )}
          </AnimatePresence>

          <button onClick={() => setShowSearch(!showSearch)}>
            <Search className="w-5 h-5 text-white" />
          </button>

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

        <button><Bell className="w-5 h-5 text-white" /></button>
        <button><User className="w-5 h-5 text-white" /></button>

        <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          {mobileMenuOpen ? <X /> : <Menu />}
        </button>
      </div>
    </div>
  </nav>

  {/* 🔥 الحل النهائي للمشكل */}
  <div style={{ height: NAVBAR_HEIGHT }} />
</>
```

)
}
