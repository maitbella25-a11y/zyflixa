import React, { useState, useEffect } from 'react'
import { Link } from '@tanstack/react-router'
import { motion, AnimatePresence } from 'framer-motion'
import { Play, Info, Star } from 'lucide-react'
import { getBackdropUrl } from '../lib/tmdb'
import type { Movie } from '../lib/tmdb'

interface HeroBannerProps {
  movies: Movie[]
  isLoading?: boolean
}

export const HeroBanner: React.FC<HeroBannerProps> = ({ movies, isLoading }) => {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [imageLoaded, setImageLoaded] = useState(false)
  const featured = movies[currentIndex]

  useEffect(() => {
    if (movies.length <= 1) return
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % Math.min(movies.length, 5))
      setImageLoaded(false)
    }, 8000)
    return () => clearInterval(timer)
  }, [movies.length])

  if (isLoading) {
    return (
      <div className="relative w-full h-[56vw] min-h-[400px] max-h-[700px] bg-zinc-900 animate-pulse">
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 to-transparent" />
        <div className="absolute bottom-[15%] left-4 sm:left-8 lg:left-16 space-y-4">
          <div className="h-12 w-64 bg-white/10 rounded" />
          <div className="h-4 w-96 bg-white/10 rounded" />
          <div className="h-4 w-80 bg-white/10 rounded" />
          <div className="flex gap-3 mt-4">
            <div className="h-12 w-32 bg-white/10 rounded" />
            <div className="h-12 w-32 bg-white/10 rounded" />
          </div>
        </div>
      </div>
    )
  }

  if (!featured) return null

  const title = featured.title || featured.name || ''
  const mediaType = featured.media_type || (featured.title ? 'movie' : 'tv')
  const year = (featured.release_date || featured.first_air_date || '').slice(0, 4)
  const backdropUrl = getBackdropUrl(featured.backdrop_path)

  return (
    <div className="relative w-full h-[56vw] min-h-[400px] max-h-[700px] overflow-hidden bg-zinc-900">
      <AnimatePresence mode="wait">
        <motion.div
          key={featured.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8 }}
          className="absolute inset-0"
        >
          <img
            src={backdropUrl}
            alt={title}
            onLoad={() => setImageLoaded(true)}
            className={`w-full h-full object-cover object-center transition-opacity duration-500 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
          />
        </motion.div>
      </AnimatePresence>

      {/* Gradient overlays */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/40 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#141414] via-transparent to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-transparent" />

      {/* Content */}
      <motion.div
        key={`content-${featured.id}`}
        initial={{ opacity: 0, x: -30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="absolute bottom-[12%] left-4 sm:left-8 lg:left-16 max-w-xl xl:max-w-2xl"
      >
        <div className="flex items-center gap-2 mb-3 flex-wrap">
          <span className="text-xs font-semibold text-[#E50914] uppercase tracking-widest bg-[#E50914]/10 border border-[#E50914]/30 px-2 py-0.5 rounded">
            {mediaType === 'tv' ? 'Series' : 'Movie'}
          </span>
          {year && <span className="text-xs text-zinc-400">{year}</span>}
          <div className="flex items-center gap-1">
            <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
            <span className="text-xs text-zinc-300">{featured.vote_average?.toFixed(1)}</span>
          </div>
        </div>

        <h1
          className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-black text-white mb-3 leading-tight"
          style={{ fontFamily: "'Bebas Neue', sans-serif", letterSpacing: '0.02em' }}
        >
          {title}
        </h1>

        <p className="text-sm sm:text-base text-zinc-300 line-clamp-2 sm:line-clamp-3 mb-5 max-w-lg leading-relaxed">
          {featured.overview}
        </p>

        <div className="flex items-center gap-3 flex-wrap">
          <Link
            to="/watch/$mediaType/$id"
            params={{ mediaType, id: String(featured.id) }}
            className="flex items-center gap-2 bg-white text-black font-bold px-6 py-3 rounded-md hover:bg-white/90 transition-all duration-200 text-sm"
          >
            <Play className="w-5 h-5 fill-black" />
            Play
          </Link>
          <Link
            to="/details/$mediaType/$id"
            params={{ mediaType, id: String(featured.id) }}
            className="flex items-center gap-2 bg-zinc-600/70 text-white font-semibold px-6 py-3 rounded-md hover:bg-zinc-600/90 transition-all duration-200 text-sm backdrop-blur-sm"
          >
            <Info className="w-5 h-5" />
            More Info
          </Link>
        </div>
      </motion.div>

      {/* Dot indicators */}
      {movies.length > 1 && (
        <div className="absolute bottom-6 right-8 lg:right-16 flex gap-2">
          {movies.slice(0, 5).map((_, i) => (
            <button
              key={i}
              onClick={() => {
                setCurrentIndex(i)
                setImageLoaded(false)
              }}
              className={`h-2 rounded-full transition-all duration-300 ${i === currentIndex ? 'bg-[#E50914] w-6' : 'w-2 bg-white/40 hover:bg-white/60'}`}
            />
          ))}
        </div>
      )}
    </div>
  )
}
