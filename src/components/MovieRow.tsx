import React, { useRef } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { MovieCard } from './MovieCard'
import { SkeletonCard } from './ui/SkeletonCard'
import type { Movie } from '../lib/tmdb'

interface MovieRowProps {
  title: string
  movies: Movie[]
  isLoading?: boolean
  subtitle?: string
}

export const MovieRow: React.FC<MovieRowProps> = ({ title, movies, isLoading, subtitle }) => {
  const rowRef = useRef<HTMLDivElement>(null)

  const scroll = (direction: 'left' | 'right') => {
    if (rowRef.current) {
      const scrollAmount = rowRef.current.clientWidth * 0.75
      rowRef.current.scrollBy({
        left: direction === 'right' ? scrollAmount : -scrollAmount,
        behavior: 'smooth',
      })
    }
  }

  return (
    <div className="mb-8 group/row">
      <div className="flex items-baseline gap-3 mb-3 px-4 sm:px-8 lg:px-16">
        <h2 className="text-lg sm:text-xl font-semibold text-white">{title}</h2>
        {subtitle && <span className="text-sm text-[#E50914] font-medium">{subtitle}</span>}
      </div>

      <div className="relative">
        <button
          onClick={() => scroll('left')}
          className="absolute left-0 top-0 bottom-8 z-10 w-10 sm:w-14 lg:w-16 flex items-center justify-center bg-gradient-to-r from-[#141414] to-transparent opacity-0 group-hover/row:opacity-100 transition-opacity duration-200"
        >
          <div className="w-8 h-8 rounded-full bg-black/60 border border-white/20 flex items-center justify-center hover:bg-black/80 transition-colors">
            <ChevronLeft className="w-4 h-4 text-white" />
          </div>
        </button>

        <div
          ref={rowRef}
          className="flex gap-3 overflow-x-auto scrollbar-hide px-4 sm:px-8 lg:px-16 pb-2"
        >
          {isLoading
            ? Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)
            : movies.map((movie, i) => (
                <MovieCard key={`${movie.id}-${i}`} movie={movie} index={i} />
              ))}
        </div>

        <button
          onClick={() => scroll('right')}
          className="absolute right-0 top-0 bottom-8 z-10 w-10 sm:w-14 lg:w-16 flex items-center justify-center bg-gradient-to-l from-[#141414] to-transparent opacity-0 group-hover/row:opacity-100 transition-opacity duration-200"
        >
          <div className="w-8 h-8 rounded-full bg-black/60 border border-white/20 flex items-center justify-center hover:bg-black/80 transition-colors">
            <ChevronRight className="w-4 h-4 text-white" />
          </div>
        </button>
      </div>
    </div>
  )
}
