import React, { useState, memo } from 'react'
import { Link } from '@tanstack/react-router'
import { motion } from 'framer-motion'
import { Star, Play, Plus, Check, Tv } from 'lucide-react'
import { getImageUrl } from '../lib/tmdb'
import { useWatchlist } from '../hooks/useWatchlist'
import type { Movie } from '../lib/tmdb'

interface MovieCardProps {
  movie: Movie
  index?: number
}

export const MovieCard: React.FC<MovieCardProps> = memo(({ movie, index = 0 }) => {
  const [imageLoaded, setImageLoaded] = useState(false)
  const [imageError, setImageError] = useState(false)

  const { isInWatchlist, toggleWatchlist } = useWatchlist()

  const title = movie.title || movie.name || 'Unknown'
  const rawMediaType = movie.media_type || (movie.title ? 'movie' : 'tv')
  const isAnime = rawMediaType === 'anime'
  const mediaTypeForLink = isAnime ? 'tv' : rawMediaType

  const year = (movie.release_date || movie.first_air_date || '').slice(0, 4)
  const rating = movie.vote_average?.toFixed(1) || '0.0'
  const inList = isInWatchlist(movie.id)

  const posterUrl = imageError
    ? null
    : isAnime
    ? (movie.poster_path || null)
    : getImageUrl(movie.poster_path, 'w342')

  const badge = isAnime ? 'ANIME' : rawMediaType === 'tv' ? 'TV' : null

  const handleWatchlistToggle = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    toggleWatchlist({
      id: movie.id,
      title,
      posterPath: movie.poster_path,
      mediaType: isAnime ? 'anime' : (rawMediaType as 'movie' | 'tv'),
      voteAverage: movie.vote_average || 0,
    })
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: Math.min(index * 0.04, 0.5) }}
      className="flex-shrink-0 w-[140px] xs:w-[150px] sm:w-[160px] md:w-[180px] lg:w-[195px] group cursor-pointer"
    >
      <Link
        to="/details/$mediaType/$id"
        params={{ mediaType: mediaTypeForLink, id: String(movie.id) }}
      >
        <div className="relative overflow-hidden rounded-lg bg-zinc-800 aspect-[2/3] mb-2 transition-all duration-300 group-hover:scale-[1.03] group-hover:shadow-[0_10px_40px_rgba(0,0,0,0.9)] group-hover:ring-1 group-hover:ring-white/20">
          {/* Image */}
          {posterUrl ? (
            <img
              src={posterUrl}
              alt={title}
              loading="lazy"
              decoding="async"
              onLoad={() => setImageLoaded(true)}
              onError={() => setImageError(true)}
              className={`w-full h-full object-cover transition-opacity duration-300 ${
                imageLoaded ? 'opacity-100' : 'opacity-0'
              }`}
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-zinc-800 to-zinc-900 text-zinc-500 text-xs text-center p-3 gap-2">
              <Tv className="w-6 h-6 opacity-50" />
              <span className="line-clamp-2">{title}</span>
            </div>
          )}

          {/* Skeleton shimmer */}
          {!imageLoaded && !imageError && posterUrl && (
            <div className="absolute inset-0 bg-zinc-800 animate-pulse" />
          )}

          {/* Type badge */}
          {badge && (
            <div className={`absolute top-2 left-2 text-[10px] font-bold px-1.5 py-0.5 rounded ${
              isAnime ? 'bg-violet-600/90 text-white' : 'bg-blue-600/80 text-white'
            }`}>
              {badge}
            </div>
          )}

          {/* Rating badge top-right */}
          {Number(rating) > 0 && (
            <div className="absolute top-2 right-2 bg-black/70 text-yellow-400 text-[10px] font-bold px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity">
              ★ {rating}
            </div>
          )}

          {/* Hover overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col justify-end p-2.5">
            <div className="flex gap-1.5 mb-1">
              {/* Play button */}
              <button
                onClick={(e) => { e.preventDefault(); e.stopPropagation() }}
                className="w-8 h-8 rounded-full bg-white flex items-center justify-center hover:bg-white/90 transition-colors shadow-lg"
                aria-label="Play"
              >
                <Play className="w-3 h-3 text-black fill-black ml-0.5" />
              </button>
              {/* Watchlist button */}
              <button
                onClick={handleWatchlistToggle}
                className={`w-8 h-8 rounded-full border flex items-center justify-center transition-all ${
                  inList
                    ? 'bg-[#E50914] border-[#E50914] hover:bg-[#E50914]/80'
                    : 'bg-zinc-700/80 border-zinc-500 hover:bg-zinc-600'
                }`}
                aria-label={inList ? 'Remove from watchlist' : 'Add to watchlist'}
              >
                {inList
                  ? <Check className="w-3 h-3 text-white" />
                  : <Plus className="w-3 h-3 text-white" />
                }
              </button>
            </div>
            <p className="text-white text-xs font-medium line-clamp-2 leading-tight">{title}</p>
          </div>
        </div>

        {/* Below card info */}
        <div>
          <h3 className="text-sm font-medium text-white/90 line-clamp-1 group-hover:text-white transition-colors">
            {title}
          </h3>
          <div className="flex items-center gap-2 mt-0.5 flex-wrap">
            {Number(rating) > 0 && (
              <div className="flex items-center gap-0.5">
                <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                <span className="text-xs text-zinc-400">{rating}</span>
              </div>
            )}
            {year && <span className="text-xs text-zinc-500">{year}</span>}
            {isAnime && <span className="text-xs text-violet-400 font-medium">Anime</span>}
          </div>
        </div>
      </Link>
    </motion.div>
  )
})

MovieCard.displayName = 'MovieCard'
