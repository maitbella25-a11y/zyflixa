import React, { useState, useRef, useEffect, useCallback } from 'react'
import { useParams, Link } from '@tanstack/react-router'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, Server, Monitor, RefreshCw, ChevronDown, AlertTriangle } from 'lucide-react'
import { useMovieDetails, useTVDetails } from '../hooks/useMovies'
import { Spinner } from '../components/ui/Spinner'

interface EmbedSource {
  id: string
  label: string
  getUrl: (type: 'movie' | 'tv', id: number, season?: number, episode?: number) => string
}

const SOURCES: EmbedSource[] = [
  {
    id: 'vidsrc-me',
    label: 'VidSrc',
    getUrl: (t, id, s, e) =>
      t === 'movie'
        ? `https://vidsrc.me/embed/movie?tmdb=${id}`
        : `https://vidsrc.me/embed/tv?tmdb=${id}&season=${s ?? 1}&episode=${e ?? 1}`,
  },
  {
    id: 'embedsu',
    label: 'EmbedSu',
    getUrl: (t, id, s, e) =>
      t === 'movie'
        ? `https://embed.su/embed/movie/${id}`
        : `https://embed.su/embed/tv/${id}/${s ?? 1}/${e ?? 1}`,
  },
  {
    id: 'vidlink',
    label: 'VidLink',
    getUrl: (t, id, s, e) =>
      t === 'movie'
        ? `https://vidlink.pro/movie/${id}?autoplay=true`
        : `https://vidlink.pro/tv/${id}/${s ?? 1}/${e ?? 1}?autoplay=true`,
  },
  {
    id: 'autoembed',
    label: 'AutoEmbed',
    getUrl: (t, id, s, e) =>
      t === 'movie'
        ? `https://autoembed.cc/movie/tmdb/${id}`
        : `https://autoembed.cc/tv/tmdb/${id}-${s ?? 1}-${e ?? 1}`,
  },
  {
    id: 'multiembed',
    label: 'MultiEmbed',
    getUrl: (t, id, s, e) =>
      t === 'movie'
        ? `https://multiembed.mov/?video_id=${id}&tmdb=1`
        : `https://multiembed.mov/?video_id=${id}&tmdb=1&s=${s ?? 1}&e=${e ?? 1}`,
  },
  {
    id: '2embed',
    label: '2Embed',
    getUrl: (t, id, s, e) =>
      t === 'movie'
        ? `https://www.2embed.cc/embed/${id}`
        : `https://www.2embed.cc/embedtv/${id}&s=${s ?? 1}&e=${e ?? 1}`,
  },
  {
    id: 'vidsrc-xyz',
    label: 'VidSrc Pro',
    getUrl: (t, id, s, e) =>
      t === 'movie'
        ? `https://vidsrc.xyz/embed/movie/${id}`
        : `https://vidsrc.xyz/embed/tv/${id}/${s ?? 1}/${e ?? 1}`,
  },
  {
    id: 'nontonfilm',
    label: 'NontonFilm',
    getUrl: (t, id, s, e) =>
      t === 'movie'
        ? `https://www.NontonFilm.net/api/?tmdb=${id}&type=movie`
        : `https://www.NontonFilm.net/api/?tmdb=${id}&type=serie&s=${s ?? 1}&e=${e ?? 1}`,
  },
]

export const WatchPage: React.FC = () => {
  const params    = useParams({ from: '/watch/$mediaType/$id' })
  const mediaType = params.mediaType as 'movie' | 'tv'
  const id        = parseInt(params.id, 10)

  const [sourceId, setSourceId]       = useState(SOURCES[0].id)
  const [season, setSeason]           = useState(1)
  const [episode, setEpisode]         = useState(1)
  const [iframeKey, setIframeKey]     = useState(0)
  const [iframeLoaded, setIframeLoaded] = useState(false)
  const [showOverlay, setShowOverlay] = useState(true)
  const [showSources, setShowSources] = useState(false)
  const [showEpisodes, setShowEpisodes] = useState(false)
  const [loadError, setLoadError]     = useState(false)
  const [autoFallback, setAutoFallback] = useState(false)
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const errorTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const { data: movieData, isLoading: movieLoading } = useMovieDetails(mediaType === 'movie' ? id : 0)
  const { data: tvData,    isLoading: tvLoading }    = useTVDetails(mediaType === 'tv' ? id : 0)

  const details    = mediaType === 'movie' ? movieData : tvData
  const isLoading  = mediaType === 'movie' ? movieLoading : tvLoading
  const title      = (details as any)?.title || (details as any)?.name || ''
  const totalSeasons      = (details as any)?.number_of_seasons ?? 1
  const totalEpisodes     = (details as any)?.number_of_episodes ?? 50
  const episodesPerSeason = Math.max(13, Math.ceil(totalEpisodes / Math.max(totalSeasons, 1)))

  const currentSource = SOURCES.find((s) => s.id === sourceId) ?? SOURCES[0]
  const embedUrl      = currentSource.getUrl(mediaType, id, season, episode)
  const currentSourceIndex = SOURCES.findIndex((s) => s.id === sourceId)

  // Auto-fallback: after 10s with no load → silently switch to next source
  useEffect(() => {
    setIframeLoaded(false)
    setLoadError(false)
    setAutoFallback(false)
    if (errorTimer.current) clearTimeout(errorTimer.current)
    errorTimer.current = setTimeout(() => {
      const next = (currentSourceIndex + 1) % SOURCES.length
      if (next !== 0) {
        // still have servers to try → auto-switch silently
        setSourceId(SOURCES[next].id)
        setIframeKey((k) => k + 1)
        setAutoFallback(true)
      } else {
        // tried them all → show error banner
        setLoadError(true)
      }
    }, 10000)
    return () => { if (errorTimer.current) clearTimeout(errorTimer.current) }
  }, [iframeKey, sourceId, currentSourceIndex])

  const tryNextSource = useCallback(() => {
    const next = SOURCES[(currentSourceIndex + 1) % SOURCES.length]
    setSourceId(next.id)
    setIframeKey((k) => k + 1)
    setAutoFallback(true)
    setLoadError(false)
  }, [currentSourceIndex])

  // Show/hide overlay on mouse move
  const handleMouseMove = useCallback(() => {
    setShowOverlay(true)
    if (hideTimer.current) clearTimeout(hideTimer.current)
    hideTimer.current = setTimeout(() => setShowOverlay(false), 3000)
  }, [])

  useEffect(() => {
    return () => {
      if (hideTimer.current) clearTimeout(hideTimer.current)
      if (errorTimer.current) clearTimeout(errorTimer.current)
    }
  }, [])

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    )
  }

  return (
    <div
      className="fixed inset-0 z-[100] bg-black flex flex-col"
      onMouseMove={handleMouseMove}
      onClick={() => setShowOverlay((v) => !v)}
    >
      {/* ── iframe ── */}
      {!iframeLoaded && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black gap-4">
          <Spinner size="lg" />
          <p className="text-zinc-400 text-sm">Loading {currentSource.label}...</p>
        </div>
      )}

      <iframe
        key={iframeKey}
        src={embedUrl}
        className="w-full h-full border-0"
        allowFullScreen
        allow="autoplay; fullscreen; picture-in-picture"
        onLoad={() => {
          setIframeLoaded(true)
          setLoadError(false)
          if (errorTimer.current) clearTimeout(errorTimer.current)
        }}
      />

      {/* ── Load error banner ── */}
      <AnimatePresence>
        {loadError && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="absolute bottom-8 left-1/2 -translate-x-1/2 z-50 bg-zinc-900/95 border border-zinc-700 rounded-xl px-5 py-4 flex items-center gap-4 shadow-2xl max-w-sm w-full mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <AlertTriangle className="w-5 h-5 text-yellow-400 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-medium">
                {autoFallback ? `Switched to ${currentSource.label}` : `${currentSource.label} not responding`}
              </p>
              <p className="text-zinc-400 text-xs mt-0.5">
                {autoFallback ? 'Try another server if this one fails too' : 'Try another server below'}
              </p>
            </div>
            <button
              onClick={tryNextSource}
              className="flex-shrink-0 bg-[#E50914] text-white text-xs font-semibold px-3 py-1.5 rounded-lg hover:bg-[#E50914]/80 transition-colors"
            >
              Next Server
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Overlay controls ── */}
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

            {/* Controls bar */}
            <div className="absolute top-0 left-0 right-0 flex items-center gap-3 px-4 pt-5 pb-4 pointer-events-auto"
              onClick={(e) => e.stopPropagation()}>

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
                <p className="text-white font-semibold text-sm sm:text-base truncate drop-shadow">{title}</p>
                {mediaType === 'tv' && (
                  <p className="text-white/60 text-xs">Season {season} · Episode {episode}</p>
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
                            <button key={s}
                              onClick={() => { setSeason(s); setEpisode(1); setIframeKey((k) => k + 1); setShowEpisodes(false) }}
                              className={`text-xs px-2.5 py-1 rounded-full border transition-all ${
                                s === season ? 'bg-[#E50914] text-white border-[#E50914]' : 'bg-zinc-800 text-zinc-400 border-zinc-700 hover:text-white hover:bg-zinc-700'
                              }`}
                            >S{String(s).padStart(2, '0')}</button>
                          ))}
                        </div>
                        <p className="text-zinc-500 text-[10px] uppercase tracking-wider mb-2">Episode</p>
                        <div className="flex flex-wrap gap-1.5 max-h-44 overflow-y-auto scrollbar-hide">
                          {Array.from({ length: episodesPerSeason }, (_, i) => i + 1).map((ep) => (
                            <button key={ep}
                              onClick={() => { setEpisode(ep); setIframeKey((k) => k + 1); setShowEpisodes(false) }}
                              className={`text-xs px-2.5 py-1 rounded-full border transition-all ${
                                ep === episode ? 'bg-[#E50914] text-white border-[#E50914]' : 'bg-zinc-800 text-zinc-400 border-zinc-700 hover:text-white hover:bg-zinc-700'
                              }`}
                            >E{String(ep).padStart(2, '0')}</button>
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
                  <span className="text-[10px] text-zinc-400">({currentSourceIndex + 1}/{SOURCES.length})</span>
                </button>

                <AnimatePresence>
                  {showSources && (
                    <motion.div
                      initial={{ opacity: 0, y: -6, scale: 0.97 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -6, scale: 0.97 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 top-full mt-2 bg-zinc-900/95 backdrop-blur-md border border-zinc-700/80 rounded-xl p-3 shadow-2xl"
                      style={{ minWidth: 180 }}
                    >
                      <p className="text-zinc-500 text-[10px] uppercase tracking-wider mb-2 flex items-center gap-1">
                        <Monitor className="w-3 h-3" /> Servers ({SOURCES.length})
                      </p>
                      <div className="flex flex-col gap-1.5">
                        {SOURCES.map((src) => (
                          <button key={src.id}
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
                title="Reload"
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
