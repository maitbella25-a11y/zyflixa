import React, { useState } from 'react'
import { useParams, Link } from '@tanstack/react-router'
import { motion } from 'framer-motion'
import { Play, Star, Clock, Calendar, Plus, Check, ChevronLeft, ExternalLink, Server } from 'lucide-react'
import { useMovieDetails, useTVDetails } from '../hooks/useMovies'
import { getImageUrl, getBackdropUrl, getBackdropSrcSet, getMediaTitle, getMediaYear } from '../lib/tmdb'
import type { MovieDetails, TVDetails, Cast, Video, MediaDetails } from '../lib/tmdb'

import { Spinner } from '../components/ui/Spinner'
import { MovieRow } from '../components/MovieRow'
import { useWatchlist } from '../hooks/useWatchlist'
import { useSEO } from '../hooks/useSEO'

const CastCard: React.FC<{ cast: Cast }> = ({ cast }) => (
  <div className="flex-shrink-0 w-[110px] text-center">
    <div className="w-16 h-16 mx-auto rounded-full overflow-hidden bg-zinc-800 mb-2 ring-2 ring-zinc-700">
      {cast.profile_path ? (
        <img
          src={getImageUrl(cast.profile_path, 'w185')}
          alt={cast.name}
          loading="lazy"
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center text-zinc-400 text-lg font-bold bg-gradient-to-br from-zinc-700 to-zinc-800">
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
  const { isInWatchlist, toggleWatchlist } = useWatchlist()

  const { data: movieData, isLoading: movieLoading } = useMovieDetails(
    mediaType === 'movie' ? id : 0,
  )
  const { data: tvData, isLoading: tvLoading } = useTVDetails(mediaType === 'tv' ? id : 0)

  const details: MediaDetails | null =
    mediaType === 'movie' ? (movieData || null) : (tvData || null)
  const isLoading = mediaType === 'movie' ? movieLoading : tvLoading

  // ── Derive values early (safe when details is null) ──────────────────────
  const title = getMediaTitle(details)
  const year = getMediaYear(details)
  const seoImage = details ? getBackdropUrl(details.backdrop_path, 'w1280') : undefined
  const seoDesc  = details?.overview
    ? details.overview.slice(0, 160)
    : `Watch ${title} on Zyflixa — stream free movies and TV shows.`

  // ── useSEO BEFORE any early return (Rules of Hooks) ──────────────────────
  useSEO({
    title:       year ? `${title} (${year})` : title || undefined,
    description: seoDesc,
    image:       seoImage,
    url:         `/details/${mediaType}/${id}`,
    type:        mediaType === 'movie' ? 'video.movie' : 'video.tv_show',
  })

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
        <Link to="/" className="text-[#E50914] hover:underline">Go back home</Link>
      </div>
    )
  }

  const runtime = 'runtime' in details ? details.runtime : undefined
  const seasons = 'number_of_seasons' in details ? details.number_of_seasons : undefined
  const trailerVideo: Video | undefined =
    details.videos?.results?.find((v) => v.type === 'Trailer' && v.site === 'YouTube') ||
    details.videos?.results?.[0]
  const cast = details.credits?.cast?.slice(0, 15) || []
  const similar = (details.similar?.results?.slice(0, 20) || []).map((m) => ({
    ...m,
    media_type: m.media_type || mediaType,
  }))
  const backdropUrl    = getBackdropUrl(details.backdrop_path, 'w1280')
  const backdropSrcSet = getBackdropSrcSet(details.backdrop_path)
  const posterUrl      = getImageUrl(details.poster_path, 'w342')

  return (
    <div className="min-h-screen bg-[#141414]">
      {/* ── Backdrop ── */}
      {/* pt-16 pushes backdrop below the fixed 64px navbar */}
      <div className="relative w-full pt-16">
        <div className="relative w-full h-[45vw] min-h-[260px] max-h-[520px] overflow-hidden">
          <img
            src={backdropUrl}
            srcSet={backdropSrcSet}
            sizes="100vw"
            alt={title}
            width={1280}
            height={720}
            className="w-full h-full object-cover object-top"
            loading="eager"
            fetchPriority="high"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#141414] via-[#141414]/50 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#141414] via-[#141414]/20 to-transparent" />

          {/* Back button — sits inside backdrop, not overlapping nav */}
          <Link
            to="/"
            className="absolute top-4 left-4 sm:left-8 lg:left-16 flex items-center gap-2 text-zinc-300 hover:text-white transition-colors bg-black/40 hover:bg-black/60 backdrop-blur-sm px-3 py-1.5 rounded-full text-sm"
          >
            <ChevronLeft className="w-4 h-4" />
            <span className="hidden sm:inline font-medium">Back</span>
          </Link>
        </div>
      </div>

      {/* ── Main Content ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative z-10 -mt-20 sm:-mt-28 px-4 sm:px-8 lg:px-16 pb-16"
      >
        <div className="flex flex-col sm:flex-row gap-6 sm:gap-8 mb-8">
          {/* ── Poster ── */}
          <div className="flex-shrink-0 w-36 sm:w-[160px] lg:w-[220px] mx-auto sm:mx-0">
            <img
              src={posterUrl}
              alt={title}
              className="w-full aspect-[2/3] rounded-xl object-cover shadow-2xl ring-1 ring-white/10"
              loading="lazy"
            />
          </div>

          {/* ── Info ── */}
          <div className="flex-1 min-w-0 pt-0 sm:pt-6">
            {/* Genres */}
            <div className="flex items-center gap-2 flex-wrap mb-3">
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[#E50914]/20 text-[#E50914] border border-[#E50914]/30">
                {mediaType === 'tv' ? 'TV Series' : 'Movie'}
              </span>
              {details.genres?.slice(0, 4).map((g) => (
                <span
                  key={g.id}
                  className="text-xs bg-zinc-800 border border-zinc-700 text-zinc-300 px-2.5 py-1 rounded-full"
                >
                  {g.name}
                </span>
              ))}
            </div>

            {/* Title */}
            <h1
              className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-black text-white mb-3 leading-tight"
              style={{ fontFamily: "'Bebas Neue', sans-serif" }}
            >
              {title}
            </h1>

            {/* Meta */}
            <div className="flex items-center gap-4 text-sm text-zinc-400 mb-4 flex-wrap">
              <div className="flex items-center gap-1.5">
                <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                <span className="text-white font-semibold">{details.vote_average?.toFixed(1)}</span>
                <span className="text-zinc-500 text-xs">({details.vote_count?.toLocaleString()})</span>
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
                  <span>{Math.floor(runtime / 60)}h {runtime % 60}m</span>
                </div>
              )}
              {seasons != null && (
                <span>{seasons} Season{seasons > 1 ? 's' : ''}</span>
              )}
            </div>

            {details.tagline && (
              <p className="text-zinc-500 italic text-sm mb-3">"{details.tagline}"</p>
            )}

            <p className="text-zinc-300 text-sm sm:text-base leading-relaxed mb-6 max-w-2xl">
              {details.overview}
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap gap-3">
              <Link
                to="/watch/$mediaType/$id"
                params={{ mediaType, id: String(id) }}
                className="flex items-center gap-2 bg-white text-black font-bold px-6 py-3 rounded-lg hover:bg-white/90 active:scale-95 transition-all text-sm shadow-lg"
              >
                <Play className="w-5 h-5 fill-black" />
                Watch Now
              </Link>
              {trailerVideo && (
                <button
                  onClick={() => setTrailerOpen(true)}
                  className="flex items-center gap-2 bg-zinc-800 text-white font-semibold px-5 py-3 rounded-lg hover:bg-zinc-700 active:scale-95 transition-all text-sm border border-zinc-600"
                >
                  <ExternalLink className="w-4 h-4" />
                  Trailer
                </button>
              )}
              <Link
                to="/watch/$mediaType/$id"
                params={{ mediaType, id: String(id) }}
                className="flex items-center gap-2 bg-zinc-800/80 text-zinc-300 font-semibold px-4 py-3 rounded-lg hover:bg-zinc-700 active:scale-95 transition-all text-sm border border-zinc-700"
              >
                <Server className="w-4 h-4" />
                Choose Server
              </Link>
              <button
                onClick={() => toggleWatchlist({
                  id,
                  title,
                  posterPath: details.poster_path,
                  mediaType: mediaType as 'movie' | 'tv',
                  voteAverage: details.vote_average || 0,
                })}
                className={`flex items-center gap-2 font-semibold px-4 py-3 rounded-lg active:scale-95 transition-all text-sm border ${
                  isInWatchlist(id)
                    ? 'bg-[#E50914]/20 text-[#E50914] border-[#E50914]/50 hover:bg-[#E50914]/30'
                    : 'bg-zinc-800/60 text-zinc-300 border-zinc-700 hover:bg-zinc-700'
                }`}
              >
                {isInWatchlist(id) ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                {isInWatchlist(id) ? 'In My List' : 'My List'}
              </button>
            </div>
          </div>
        </div>

        {/* ── Cast ── */}
        {cast.length > 0 && (
          <div className="mb-10">
            <h2 className="text-lg sm:text-xl font-bold text-white mb-4">Cast</h2>
            <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-2">
              {cast.map((c) => (
                <CastCard key={c.id} cast={c} />
              ))}
            </div>
          </div>
        )}

        {/* ── Similar ── */}
        {similar.length > 0 && (
          <MovieRow title="More Like This" movies={similar} />
        )}
      </motion.div>

      {/* ── Trailer Modal ── */}
      {trailerOpen && trailerVideo && (
        <div
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4"
          onClick={() => setTrailerOpen(false)}
        >
          <div className="w-full max-w-4xl aspect-video" onClick={(e) => e.stopPropagation()}>
            <div className="relative w-full h-full bg-black rounded-xl overflow-hidden ring-1 ring-white/10">
              <button
                onClick={() => setTrailerOpen(false)}
                className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-black/70 flex items-center justify-center text-white hover:bg-black transition-colors text-lg"
              >
                ×
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
