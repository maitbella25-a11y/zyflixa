import React, { useState } from 'react'
import { MovieCard } from './MovieCard'
import { SkeletonCard } from './ui/SkeletonCard'
import { useMoviesByGenre } from '../hooks/useMovies'

const MOVIE_GENRES = [
  { id: 28, name: 'Action' },
  { id: 35, name: 'Comedy' },
  { id: 27, name: 'Horror' },
  { id: 878, name: 'Sci-Fi' },
  { id: 18, name: 'Drama' },
  { id: 10749, name: 'Romance' },
  { id: 12, name: 'Adventure' },
  { id: 16, name: 'Animation' },
  { id: 80, name: 'Crime' },
  { id: 9648, name: 'Mystery' },
]

export const GenreRow: React.FC = () => {
  const [activeGenre, setActiveGenre] = useState(MOVIE_GENRES[0])
  const { data: movies = [], isLoading } = useMoviesByGenre(activeGenre.id)

  return (
    <div className="mb-10">
      {/* Header + tabs */}
      <div className="flex items-center gap-3 mb-4 px-4 sm:px-8 lg:px-16 flex-wrap">
        <h2 className="text-lg sm:text-xl font-semibold text-white mr-2">Browse by Genre</h2>
        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
          {MOVIE_GENRES.map((g) => (
            <button
              key={g.id}
              onClick={() => setActiveGenre(g)}
              className={`flex-shrink-0 px-3 py-1 rounded-full text-xs font-medium transition-all duration-200 ${
                activeGenre.id === g.id
                  ? 'bg-[#E50914] text-white'
                  : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-white'
              }`}
            >
              {g.name}
            </button>
          ))}
        </div>
      </div>

      {/* Cards row */}
      <div className="flex gap-3 overflow-x-auto scrollbar-hide px-4 sm:px-8 lg:px-16 pb-2">
        {isLoading
          ? Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)
          : movies.map((movie, i) => <MovieCard key={movie.id} movie={movie} index={i} />)}
      </div>
    </div>
  )
}
