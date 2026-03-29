import React, { useState } from 'react'
import { Link } from '@tanstack/react-router'
import { motion } from 'framer-motion'
import { Star, Play, Plus } from 'lucide-react'
import { getImageUrl } from '../lib/tmdb'
import type { Movie } from '../lib/tmdb'

interface MovieCardProps {
  movie: Movie
  index?: number
}

export const MovieCard: React.FC<MovieCardProps> = ({ movie, index = 0 }) => {
  const [imageLoaded, setImageLoaded] = useState(false)
  const [imageError, setImageError] = useState(false)

  const title = movie.title || movie.name || 'Unknown'
  const mediaType = movie.media_type || (movie.title ? 'movie' : 'tv')
  const year = (movie.release_date || movie.first_air_date || '').slice(0, 4)
  const rating = movie.vote_average?.toFixed(1) || '0.0'
  const posterUrl = imageError ? null : getImageUrl(movie.poster_path, 'w342')

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className="flex-shrink-0 w-[140px] sm:w-[160px] md:w-[185px] lg:w-[200px] group cursor-pointer"
    >
      <Link to="/details/$mediaType/$id" params={{ mediaType, id: String(movie.id) }}>
        <div className="relative overflow-hidden rounded-md bg-zinc-800 aspect-[2/3] mb-2 transition-transform duration-300 group-hover:scale-105 group-hover:shadow-[0_8px_32px_rgba(0,0,0,0.8)]">
          {posterUrl ? (
            <img
              src={posterUrl}
              alt={title}
              loading="lazy"
              onLoad={() => setImageLoaded(true)}
              onError={() => setImageError(true)}
              className={`w-full h-full object-cover transition-opacity duration-300 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-zinc-800 text-zinc-500 text-xs text-center p-2">
              {title}
            </div>
          )}
          {!imageLoaded && !imageError && (
            <div className="absolute inset-0 bg-zinc-800 animate-pulse" />
          )}

          {/* Hover overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col justify-end p-2">
            <div className="flex gap-1">
              <button
                onClick={(e) => { e.preventDefault(); e.stopPropagation() }}
                className="w-8 h-8 rounded-full bg-white flex items-center justify-center hover:bg-white/90 transition-colors"
              >
                <Play className="w-3 h-3 text-black fill-black ml-0.5" />
              </button>
              <button
                onClick={(e) => { e.preventDefault(); e.stopPropagation() }}
                className="w-8 h-8 rounded-full bg-zinc-700/80 border border-zinc-500 flex items-center justify-center hover:bg-zinc-600 transition-colors"
              >
                <Plus className="w-3 h-3 text-white" />
              </button>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-medium text-white/90 line-clamp-1 group-hover:text-white transition-colors">
            {title}
          </h3>
          <div className="flex items-center gap-2 mt-0.5">
            <div className="flex items-center gap-0.5">
              <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
              <span className="text-xs text-zinc-400">{rating}</span>
            </div>
            {year && <span className="text-xs text-zinc-500">{year}</span>}
            <span className="text-xs text-zinc-600 capitalize">{mediaType}</span>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}
