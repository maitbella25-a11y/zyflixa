import React, { useState } from 'react'
import { useParams, Link } from '@tanstack/react-router'
import { motion } from 'framer-motion'
import { Play, Star, Clock, Calendar, Plus, ChevronLeft, ExternalLink } from 'lucide-react'
import { useMovieDetails, useTVDetails } from '../hooks/useMovies'
import { getImageUrl, getBackdropUrl } from '../lib/tmdb'
import { Spinner } from '../components/ui/Spinner'
import { MovieRow } from '../components/MovieRow'
import type { MovieDetails, TVDetails, Cast, Video } from '../lib/tmdb'

type DetailsData = MovieDetails | TVDetails

const CastCard: React.FC<{ cast: Cast }> = ({ cast }) => (
  <div className="flex-shrink-0 w-[120px] text-center">
    <div className="w-20 h-20 mx-auto rounded-full overflow-hidden bg-zinc-800 mb-2">
      {cast.profile_path ? (
        <img
          src={getImageUrl(cast.profile_path, 'w185')}
          alt={cast.name}
          loading="lazy"
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center text-zinc-500 text-lg font-semibold">
          {cast.name[0]}
        </div>
      )}
    </div>
    <p className="text-xs font-medium text-white line-clamp-1">{cast.name}</p>
    <p className="text-xs text-zinc-500 line-clamp-1">{cast.character}</p>
  </div>
)

export const DetailsPage: React.FC = () => {
  const params = useParams({ from: '/details/$mediaType/$id' })
  const mediaType = params.mediaType as 'movie' | 'tv'
  const id = parseInt(params.id, 10)

  const [trailerOpen, setTrailerOpen] = useState(false)

  const { data: movieData, isLoading: movieLoading } = useMovieDetails(
    mediaType === 'movie' ? id : 0,
  )
  const { data: tvData, isLoading: tvLoading } = useTVDetails(mediaType === 'tv' ? id : 0)

  const details: DetailsData | null =
    mediaType === 'movie' ? (movieData || null) : (tvData || null)
  const isLoading = mediaType === 'movie' ? movieLoading : tvLoading

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#141414] flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    )
  }

  if (!details) {
    return (
      <div className="min-h-screen bg-[#141414] flex flex-col items-center justify-center gap-4">
        <p className="text-zinc-400 text-lg">Content not found</p>
        <Link to="/" className="text-[#E50914] hover:underline">
          Go back home
        </Link>
      </div>
    )
  }

  const title = (details as { title?: string; name?: string }).title ||
    (details as { title?: string; name?: string }).name || ''
  const year = (
    (details as { release_date?: string; first_air_date?: string }).release_date ||
    (details as { release_date?: string; first_air_date?: string }).first_air_date ||
    ''
  ).slice(0, 4)
  const runtime = (details as { runtime?: number }).runtime
  const seasons = (details as { number_of_seasons?: number }).number_of_seasons
  const trailerVideo: Video | undefined =
    details.videos?.results?.find((v) => v.type === 'Trailer' && v.site === 'YouTube') ||
    details.videos?.results?.[0]
  const cast = details.credits?.cast?.slice(0, 12) || []
  const similar = details.similar?.results || []
  const backdropUrl = getBackdropUrl(details.backdrop_path)
  const posterUrl = getImageUrl(details.poster_path, 'w500')

  return (
    <div className="min-h-screen bg-[#141414]">
      {/* Backdrop */}
      <div className="relative w-full h-[40vw] min-h-[280px] max-h-[500px] overflow-hidden">
        <img src={backdropUrl} alt={title} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#141414] via-[#141414]/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#141414] via-transparent to-[#141414]/30" />
        <Link
          to="/"
          className="absolute top-20 left-4 sm:left-8 lg:left-16 flex items-center gap-2 text-zinc-300 hover:text-white transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
          <span className="text-sm font-medium">Back</span>
        </Link>
      </div>

      {/* Main content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative z-10 -mt-24 px-4 sm:px-8 lg:px-16 pb-16"
      >
        <div className="flex gap-8 mb-8">
          {/* Poster */}
          <div className="flex-shrink-0 hidden sm:block w-[160px] lg:w-[220px]">
            <img
              src={posterUrl}
              alt={title}
              className="w-full aspect-[2/3] rounded-lg object-cover shadow-2xl"
              loading="lazy"
            />
          </div>

          {/* Info */}
          <div className="flex-1 pt-4">
            <div className="flex items-center gap-2 flex-wrap mb-3">
              {details.genres?.map((g) => (
                <span
                  key={g.id}
                  className="text-xs bg-zinc-800 border border-zinc-700 text-zinc-300 px-2 py-0.5 rounded-full"
                >
                  {g.name}
                </span>
              ))}
            </div>

            <h1
              className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-black text-white mb-2 leading-tight"
              style={{ fontFamily: "'Bebas Neue', sans-serif" }}
            >
              {title}
            </h1>

            <div className="flex items-center gap-4 text-sm text-zinc-400 mb-4 flex-wrap">
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                <span className="text-white font-medium">{details.vote_average?.toFixed(1)}</span>
                <span className="text-zinc-500">({details.vote_count?.toLocaleString()})</span>
              </div>
              {year && (
                <div className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{year}</span>
                </div>
              )}
              {runtime != null && (
                <div className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  <span>
                    {Math.floor(runtime / 60)}h {runtime % 60}m
                  </span>
                </div>
              )}
              {seasons != null && (
                <span>
                  {seasons} Season{seasons > 1 ? 's' : ''}
                </span>
              )}
              <span className="capitalize">{mediaType === 'tv' ? 'TV Series' : 'Movie'}</span>
            </div>

            {details.tagline && (
              <p className="text-zinc-500 italic text-sm mb-3">"{details.tagline}"</p>
            )}

            <p className="text-zinc-300 text-sm sm:text-base leading-relaxed mb-6 max-w-2xl">
              {details.overview}
            </p>

            <div className="flex flex-wrap gap-3">
              <Link
                to="/watch/$mediaType/$id"
                params={{ mediaType, id: String(id) }}
                className="flex items-center gap-2 bg-white text-black font-bold px-6 py-3 rounded-md hover:bg-white/90 transition-all text-sm"
              >
                <Play className="w-5 h-5 fill-black" />
                Watch Now
              </Link>
              {trailerVideo && (
                <button
                  onClick={() => setTrailerOpen(true)}
                  className="flex items-center gap-2 bg-zinc-800 text-white font-semibold px-6 py-3 rounded-md hover:bg-zinc-700 transition-all text-sm border border-zinc-600"
                >
                  <ExternalLink className="w-4 h-4" />
                  Trailer
                </button>
              )}
              <button className="flex items-center gap-2 bg-zinc-800/80 text-zinc-300 font-semibold px-4 py-3 rounded-md hover:bg-zinc-700 transition-all text-sm border border-zinc-700">
                <Plus className="w-4 h-4" />
                My List
              </button>
            </div>
          </div>
        </div>

        {/* Cast */}
        {cast.length > 0 && (
          <div className="mb-10">
            <h2 className="text-xl font-semibold text-white mb-4">Cast</h2>
            <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-2">
              {cast.map((c) => (
                <CastCard key={c.id} cast={c} />
              ))}
            </div>
          </div>
        )}

        {/* Similar */}
        {similar.length > 0 && <MovieRow title="More Like This" movies={similar} />}
      </motion.div>

      {/* Trailer Modal */}
      {trailerOpen && trailerVideo && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setTrailerOpen(false)}
        >
          <div className="w-full max-w-4xl aspect-video" onClick={(e) => e.stopPropagation()}>
            <div className="relative w-full h-full bg-black rounded-lg overflow-hidden">
              <button
                onClick={() => setTrailerOpen(false)}
                className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-black/60 flex items-center justify-center text-white hover:bg-black transition-colors"
              >
                <span className="text-lg leading-none">×</span>
              </button>
              <iframe
                src={`https://www.youtube.com/embed/${trailerVideo.key}?autoplay=1&rel=0`}
                title="Trailer"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}