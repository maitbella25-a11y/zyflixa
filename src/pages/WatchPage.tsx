import React, { useState, useRef, useEffect, useCallback } from 'react'
import { useParams, Link } from '@tanstack/react-router'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, Server, Monitor, RefreshCw, ChevronDown } from 'lucide-react'
import { useMovieDetails, useTVDetails } from '../hooks/useMovies'
import { Spinner } from '../components/ui/Spinner'

interface EmbedSource {
  id: string
  label: string
  getUrl: (type: 'movie' | 'tv', id: number, season?: number, episode?: number) => string
}

const SOURCES: EmbedSource[] = [
  {
    id: 'vidsrc',
    label: 'VidSrc',
    getUrl: (type, id, s, e) =>
      type === 'movie'
        ? `https://vidsrc.xyz/embed/movie/${id}`
        : `https://vidsrc.xyz/embed/tv/${id}/${s ?? 1}/${e ?? 1}`,
  },
  {
    id: 'vidsrc2',
    label: 'VidSrc 2',
    getUrl: (type, id, s, e) =>
      type === 'movie'
        ? `https://vidsrc.to/embed/movie/${id}`
        : `https://vidsrc.to/embed/tv/${id}/${s ?? 1}/${e ?? 1}`,
  },
  {
    id: 'superembed',
    label: 'SuperEmbed',
    getUrl: (type, id, s, e) =>
      type === 'movie'
        ? `https://multiembed.mov/?video_id=${id}&tmdb=1`
        : `https://multiembed.mov/?video_id=${id}&tmdb=1&s=${s ?? 1}&e=${e ?? 1}`,
  },
  {
    id: '2embed',
    label: '2Embed',
    getUrl: (type, id, s, e) =>
      type === 'movie'
        ? `https://www.2embed.cc/embed/${id}`
        : `https://www.2embed.cc/embedtv/${id}&s=${s ?? 1}&e=${e ?? 1}`,
  },
]

export const WatchPage: React.FC = () => {
  const params = useParams({ from: '/watch/$mediaType/$id' })
  const mediaType = params.mediaType as 'movie' | 'tv'
  const id = parseInt(params.id, 10)

  const [sourceId, setSourceId] = useState(SOURCES[0].id)
  const [season, setSeason] = useState(1)
  const [episode, setEpisode] = useState(1)
  const [iframeKey, setIframeKey] = useState(0)
  const [iframeLoaded, setIframeLoaded] = useState(false)
  const [showOverlay, setShowOverlay] = useState(true)
  const [showSources, setShowSources] = useState(false)
  const [showEpisodes, setShowEpisodes] = useState(false)
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const { data: movieData, isLoading: movieLoading } = useMovieDetails(
    mediaType === 'movie' ? id : 0,
  )
  const { data: tvData, isLoading: tvLoading } = useTVDetails(mediaType === 'tv' ? id : 0)

  const details = mediaType === 'movie' ? movieData : tvData
  const isLoading = mediaType === 'movie' ? movieLoading : tvLoading

  const title = (details as any)?.title || (details as any)?.name || ''
  const totalSeasons = (details as any)?.number_of_seasons ?? 1
  const totalEpisodes = (details as any)?.number_of_episodes ?? 50
  const episodesPerSeason = Math.max(13, Math.ceil(totalEpisodes / Math.max(totalSeasons, 1)))

  const currentSource = SOURCES.find((s) => s.id === sourceId) ?? SOURCES[0]
  const embedUrl = currentSource.getUrl(mediaType, id, season, episode)

  useEffect(() => {
    setIframeLoaded(false)
  }, [iframeKey, sourceId, season, episode])

  const resetHideTimer = useCallback(() => {
    setShowOverlay(true)
    if (hideTimer.current) clearTimeout(hideTimer.current)
    hideTimer.current = setTimeout(() => {
      setShowOverlay(false)
      setShowSources(false)
      setShowEpisodes(false)
    }, 3000)
  }, [])

  useEffect(() => {
    resetHideTimer()
    return () => { if (hideTimer.current) clearTimeout(hideTimer.current) }
  }, [])

  useEffect(() => {
    if (showSources || showEpisodes) {
      if (hideTimer.current) clearTimeout(hideTimer.current)
    }
  }, [showSources, showEpisodes])

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center z-50">
        <Spinner size="lg" />
      </div>
    )
  }

  return (
    <div
      className="fixed inset-0 bg-black z-50"
      onMouseMove={resetHideTimer}
      onTouchStart={resetHideTimer}
      style={{ cursor: showOverlay ? 'default' : 'none' }}
    >
      {/* Loading */}
      {!iframeLoaded && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-black">
          <Spinner size="lg" />
        </div>
      )}

      {/* Fullscreen iframe */}
      <iframe
        key={`${iframeKey}-${sourceId}-${season}-${episode}`}
        src={embedUrl}
        title={title}
        allowFullScreen
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
        onLoad={() => setIframeLoaded(true)}
        className="absolute inset-0 w-full h-full border-0"
        style={{ colorScheme: 'dark' }}
        sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox allow-presentation allow-top-navigation-by-user-activation"
      />

      {/* Overlay */}
      <AnimatePresence>
        {showOverlay && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="absolute inset-0 z-20 pointer-events-none"
          >
            {/* Top gradient */}
            <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-black/75 to-transparent" />

            {/* Top controls bar */}
            <div className="absolute top-0 left-0 right-0 flex items-center gap-3 px-4 pt-5 pb-4 pointer-events-auto">

              {/* Back */}
              <Link
                to="/details/$mediaType/$id"
                params={{ mediaType, id: String(id) }}
                className="flex items-center justify-center w-9 h-9 rounded-full bg-black/40 hover:bg-black/70 text-white transition-colors backdrop-blur-sm flex-shrink-0"
              >
                <ChevronLeft className="w-5 h-5" />
              </Link>

              {/* Title */}
              <div className="flex-1 min-w-0">
                <p className="text-white font-semibold text-sm sm:text-base truncate drop-shadow">
                  {title}
                </p>
                {mediaType === 'tv' && (
                  <p className="text-white/60 text-xs">
                    Season {season} · Episode {episode}
                  </p>
                )}
              </div>

              {/* TV Episode picker */}
              {mediaType === 'tv' && (
                <div className="relative flex-shrink-0">
                  <button
                    onClick={() => { setShowEpisodes((v) => !v); setShowSources(false) }}
                    className="flex items-center gap-1.5 text-xs text-white/80 hover:text-white bg-black/40 hover:bg-black/70 backdrop-blur-sm border border-white/15 px-3 py-1.5 rounded-full transition-all"
                  >
                    <span>S{String(season).padStart(2, '0')} E{String(episode).padStart(2, '0')}</span>
                    <ChevronDown className="w-3 h-3" />
                  </button>

                  <AnimatePresence>
                    {showEpisodes && (
                      <motion.div
                        initial={{ opacity: 0, y: -6, scale: 0.97 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -6, scale: 0.97 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 top-full mt-2 bg-zinc-900/95 backdrop-blur-md border border-zinc-700/80 rounded-xl p-3 shadow-2xl"
                        style={{ minWidth: 220 }}
                      >
                        <p className="text-zinc-500 text-[10px] uppercase tracking-wider mb-2">Season</p>
                        <div className="flex flex-wrap gap-1.5 mb-3">
                          {Array.from({ length: totalSeasons }, (_, i) => i + 1).map((s) => (
                            <button
                              key={s}
                              onClick={() => { setSeason(s); setEpisode(1); setIframeKey((k) => k + 1); setShowEpisodes(false) }}
                              className={`text-xs px-2.5 py-1 rounded-full border transition-all ${
                                s === season
                                  ? 'bg-[#E50914] text-white border-[#E50914]'
                                  : 'bg-zinc-800 text-zinc-400 border-zinc-700 hover:text-white hover:bg-zinc-700'
                              }`}
                            >
                              S{String(s).padStart(2, '0')}
                            </button>
                          ))}
                        </div>
                        <p className="text-zinc-500 text-[10px] uppercase tracking-wider mb-2">Episode</p>
                        <div className="flex flex-wrap gap-1.5 max-h-44 overflow-y-auto scrollbar-hide">
                          {Array.from({ length: episodesPerSeason }, (_, i) => i + 1).map((ep) => (
                            <button
                              key={ep}
                              onClick={() => { setEpisode(ep); setIframeKey((k) => k + 1); setShowEpisodes(false) }}
                              className={`text-xs px-2.5 py-1 rounded-full border transition-all ${
                                ep === episode
                                  ? 'bg-[#E50914] text-white border-[#E50914]'
                                  : 'bg-zinc-800 text-zinc-400 border-zinc-700 hover:text-white hover:bg-zinc-700'
                              }`}
                            >
                              E{String(ep).padStart(2, '0')}
                            </button>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}

              {/* Server picker */}
              <div className="relative flex-shrink-0">
                <button
                  onClick={() => { setShowSources((v) => !v); setShowEpisodes(false) }}
                  className="flex items-center gap-1.5 text-xs text-white/80 hover:text-white bg-black/40 hover:bg-black/70 backdrop-blur-sm border border-white/15 px-3 py-1.5 rounded-full transition-all"
                >
                  <Server className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">{currentSource.label}</span>
                </button>

                <AnimatePresence>
                  {showSources && (
                    <motion.div
                      initial={{ opacity: 0, y: -6, scale: 0.97 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -6, scale: 0.97 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 top-full mt-2 bg-zinc-900/95 backdrop-blur-md border border-zinc-700/80 rounded-xl p-3 shadow-2xl"
                      style={{ minWidth: 160 }}
                    >
                      <p className="text-zinc-500 text-[10px] uppercase tracking-wider mb-2 flex items-center gap-1">
                        <Monitor className="w-3 h-3" /> Server
                      </p>
                      <div className="flex flex-col gap-1.5">
                        {SOURCES.map((src) => (
                          <button
                            key={src.id}
                            onClick={() => { setSourceId(src.id); setIframeKey((k) => k + 1); setShowSources(false) }}
                            className={`text-xs px-3 py-1.5 rounded-lg border text-left transition-all ${
                              src.id === sourceId
                                ? 'bg-[#E50914] text-white border-[#E50914]'
                                : 'bg-zinc-800 text-zinc-300 border-zinc-700 hover:bg-zinc-700 hover:text-white'
                            }`}
                          >
                            {src.label}
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Reload */}
              <button
                onClick={() => setIframeKey((k) => k + 1)}
                className="flex items-center justify-center w-9 h-9 rounded-full bg-black/40 hover:bg-black/70 text-white/70 hover:text-white transition-colors backdrop-blur-sm flex-shrink-0"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
