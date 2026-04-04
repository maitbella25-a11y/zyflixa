import React, { useState } from 'react'
import { useParams, Link } from '@tanstack/react-router'
import { motion } from 'framer-motion'
import { useQuery } from '@tanstack/react-query'
import { Play, Star, Clock, Calendar, Plus, Check, ChevronLeft, ExternalLink } from 'lucide-react'
import { getAnimeById, getAnimeCharacters } from '../lib/api'
import { Spinner } from '../components/ui/Spinner'
import { useWatchlist } from '../hooks/useWatchlist'
import { useSEO } from '../hooks/useSEO'

export const AnimeDetailsPage: React.FC = () => {
  const params = useParams({ from: '/anime/$id' })
  const id = parseInt(params.id, 10)
  const [trailerOpen, setTrailerOpen] = useState(false)
  const { isInWatchlist, toggleWatchlist } = useWatchlist()

  const { data: anime, isLoading } = useQuery({
    queryKey: ['anime-detail', id],
    queryFn: () => getAnimeById(id),
    enabled: !!id,
    staleTime: 30 * 60 * 1000,
  })

  const { data: characters = [] } = useQuery({
    queryKey: ['anime-characters', id],
    queryFn: () => getAnimeCharacters(id),
    enabled: !!id,
    staleTime: 30 * 60 * 1000,
  })

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#141414] flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    )
  }

  if (!anime) {
    return (
      <div className="min-h-screen bg-[#141414] flex flex-col items-center justify-center gap-4">
        <p className="text-zinc-400 text-lg">Anime not found</p>
        <Link to="/" className="text-[#E50914] hover:underline">Go back home</Link>
      </div>
    )
  }

  const title = (anime as any).title_english || (anime as any).title || ''
  const poster = (anime as any).images?.jpg?.large_image_url || (anime as any).poster_path || ''
  const synopsis = (anime as any).synopsis || (anime as any).overview || ''
  const score = (anime as any).score || (anime as any).vote_average || 0
  const year = (anime as any).year || ((anime as any).release_date || '').slice(0, 4)
  const episodes = (anime as any).episodes
  const status = (anime as any).status
  const genres: { name: string }[] = (anime as any).genres || []
  const trailerUrl = (anime as any).trailer?.embed_url || (anime as any).trailer?.url

  const ytKey = trailerUrl?.match(/embed\/([^?]+)/)?.[1]

  useSEO({
    title:       year ? `${title} (${year})` : title,
    description: synopsis ? synopsis.slice(0, 160) : `Watch ${title} anime free on Zyflixa.`,
    image:       poster || undefined,
    url:         `/anime/${id}`,
    type:        'video.tv_show',
  })

  return (
    <div className="min-h-screen bg-[#141414]">
      {/* Backdrop */}
      <div className="relative w-full pt-16">
        <div className="relative w-full h-[45vw] min-h-[260px] max-h-[520px] overflow-hidden">
          <img
            src={poster}
            alt={title}
            className="w-full h-full object-cover object-top blur-sm scale-105 opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#141414] via-[#141414]/60 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#141414] via-transparent to-transparent" />
          <Link
            to="/browse/anime"
            className="absolute top-4 left-4 sm:left-8 lg:left-16 flex items-center gap-2 text-zinc-300 hover:text-white transition-colors bg-black/40 hover:bg-black/60 backdrop-blur-sm px-3 py-1.5 rounded-full text-sm"
          >
            <ChevronLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Anime</span>
          </Link>
        </div>
      </div>

      {/* Main content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative z-10 -mt-20 sm:-mt-28 px-4 sm:px-8 lg:px-16 pb-16"
      >
        <div className="flex flex-col sm:flex-row gap-6 sm:gap-8 mb-8">
          {/* Poster */}
          <div className="flex-shrink-0 w-36 sm:w-[160px] lg:w-[220px] mx-auto sm:mx-0">
            <img
              src={poster}
              alt={title}
              className="w-full aspect-[2/3] rounded-xl object-cover shadow-2xl ring-1 ring-white/10"
            />
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0 pt-0 sm:pt-6">
            {/* Badges */}
            <div className="flex items-center gap-2 flex-wrap mb-3">
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-violet-600/20 text-violet-400 border border-violet-600/30">
                ANIME
              </span>
              {genres.slice(0, 4).map((g) => (
                <span key={g.name} className="text-xs bg-zinc-800 border border-zinc-700 text-zinc-300 px-2.5 py-1 rounded-full">
                  {g.name}
                </span>
              ))}
            </div>

            {/* Title */}
            <h1
              className="text-3xl sm:text-4xl lg:text-5xl font-black text-white mb-3 leading-tight"
              style={{ fontFamily: "'Bebas Neue', sans-serif" }}
            >
              {title}
            </h1>

            {/* Meta */}
            <div className="flex items-center gap-4 text-sm text-zinc-400 mb-4 flex-wrap">
              {score > 0 && (
                <div className="flex items-center gap-1.5">
                  <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                  <span className="text-white font-semibold">{score.toFixed(1)}</span>
                </div>
              )}
              {year && (
                <div className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{year}</span>
                </div>
              )}
              {episodes && (
                <div className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{episodes} episodes</span>
                </div>
              )}
              {status && (
                <span className={`text-xs px-2 py-0.5 rounded-full border ${
                  status === 'Currently Airing'
                    ? 'text-green-400 border-green-400/30 bg-green-400/10'
                    : 'text-zinc-400 border-zinc-700 bg-zinc-800'
                }`}>
                  {status}
                </span>
              )}
            </div>

            <p className="text-zinc-300 text-sm sm:text-base leading-relaxed mb-6 max-w-2xl line-clamp-4">
              {synopsis}
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap gap-3">
              <Link
                to="/watch/anime/$id"
                params={{ id: String(id) }}
                className="flex items-center gap-2 bg-white text-black font-bold px-6 py-3 rounded-lg hover:bg-white/90 active:scale-95 transition-all text-sm shadow-lg"
              >
                <Play className="w-5 h-5 fill-black" />
                Watch Now
              </Link>

              {ytKey && (
                <button
                  onClick={() => setTrailerOpen(true)}
                  className="flex items-center gap-2 bg-zinc-800 text-white font-semibold px-5 py-3 rounded-lg hover:bg-zinc-700 active:scale-95 transition-all text-sm border border-zinc-600"
                >
                  <ExternalLink className="w-4 h-4" />
                  Trailer
                </button>
              )}

              <button
                onClick={() => toggleWatchlist({
                  id,
                  title,
                  posterPath: poster,
                  mediaType: 'anime',
                  voteAverage: score,
                })}
                className={`flex items-center gap-2 font-semibold px-4 py-3 rounded-lg active:scale-95 transition-all text-sm border ${
                  isInWatchlist(id)
                    ? 'bg-violet-600/20 text-violet-400 border-violet-600/50 hover:bg-violet-600/30'
                    : 'bg-zinc-800/60 text-zinc-300 border-zinc-700 hover:bg-zinc-700'
                }`}
              >
                {isInWatchlist(id) ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                {isInWatchlist(id) ? 'In My List' : 'My List'}
              </button>
            </div>
          </div>
        </div>

        {/* Characters */}
        {characters.length > 0 && (
          <div className="mb-10">
            <h2 className="text-lg sm:text-xl font-bold text-white mb-4">Characters</h2>
            <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-2">
              {characters.map((c, i) => (
                <div key={i} className="flex-shrink-0 w-[110px] text-center">
                  <div className="w-16 h-16 mx-auto rounded-full overflow-hidden bg-zinc-800 mb-2 ring-2 ring-zinc-700">
                    {c.character?.images?.jpg?.image_url ? (
                      <img
                        src={c.character.images.jpg.image_url}
                        alt={c.character.name}
                        loading="lazy"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-zinc-400 text-lg font-bold bg-gradient-to-br from-zinc-700 to-zinc-800">
                        {c.character?.name?.[0] || '?'}
                      </div>
                    )}
                  </div>
                  <p className="text-xs font-medium text-white line-clamp-1">{c.character?.name}</p>
                  <p className="text-xs text-zinc-500 line-clamp-1">{c.role}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </motion.div>

      {/* Trailer Modal */}
      {trailerOpen && ytKey && (
        <div
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4"
          onClick={() => setTrailerOpen(false)}
        >
          <div className="w-full max-w-4xl aspect-video" onClick={(e) => e.stopPropagation()}>
            <div className="relative w-full h-full bg-black rounded-xl overflow-hidden ring-1 ring-white/10">
              <button
                onClick={() => setTrailerOpen(false)}
                className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-black/70 flex items-center justify-center text-white hover:bg-black text-lg"
              >×</button>
              <iframe
                src={`https://www.youtube.com/embed/${ytKey}?autoplay=1&rel=0`}
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
