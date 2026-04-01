import React, { useState, useRef, useEffect, useCallback } from 'react'
import { useParams, Link } from '@tanstack/react-router'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ChevronLeft,
  Server,
  Monitor,
  Maximize,
  Minimize,
  RefreshCw,
  AlertTriangle,
  Play,
  Info,
} from 'lucide-react'
import { useMovieDetails, useTVDetails } from '../hooks/useMovies'
import { Spinner } from '../components/ui/Spinner'

// ─── Embed Sources ────────────────────────────────────────────────────────────

interface EmbedSource {
  id: string
  label: string
  icon: string
  getUrl: (type: 'movie' | 'tv', id: number, season?: number, episode?: number) => string
}

const SOURCES: EmbedSource[] = [
  {
    id: 'vidsrc',
    label: 'VidSrc',
    icon: '▶',
    getUrl: (type, id, season, episode) =>
      type === 'movie'
        ? `https://vidsrc.xyz/embed/movie/${id}`
        : `https://vidsrc.xyz/embed/tv/${id}/${season ?? 1}/${episode ?? 1}`,
  },
  {
    id: 'vidsrc2',
    label: 'VidSrc 2',
    icon: '▷',
    getUrl: (type, id, season, episode) =>
      type === 'movie'
        ? `https://vidsrc.to/embed/movie/${id}`
        : `https://vidsrc.to/embed/tv/${id}/${season ?? 1}/${episode ?? 1}`,
  },
  {
    id: 'superembed',
    label: 'SuperEmbed',
    icon: '◈',
    getUrl: (type, id, season, episode) =>
      type === 'movie'
        ? `https://multiembed.mov/?video_id=${id}&tmdb=1`
        : `https://multiembed.mov/?video_id=${id}&tmdb=1&s=${season ?? 1}&e=${episode ?? 1}`,
  },
  {
    id: '2embed',
    label: '2Embed',
    icon: '◉',
    getUrl: (type, id, season, episode) =>
      type === 'movie'
        ? `https://www.2embed.cc/embed/${id}`
        : `https://www.2embed.cc/embedtv/${id}&s=${season ?? 1}&e=${episode ?? 1}`,
  },
]

// ─── Lock Screen Orientation (mobile) ────────────────────────────────────────

const lockLandscape = async () => {
  try {
    const orientation = (screen as any).orientation
    if (orientation?.lock) {
      await orientation.lock('landscape')
    }
  } catch {
    // Not supported or denied — ignore
  }
}

const unlockOrientation = () => {
  try {
    const orientation = (screen as any).orientation
    if (orientation?.unlock) orientation.unlock()
  } catch {
    // ignore
  }
}

// ─── WatchPage ────────────────────────────────────────────────────────────────

export const WatchPage: React.FC = () => {
  const params = useParams({ from: '/watch/$mediaType/$id' })
  const mediaType = params.mediaType as 'movie' | 'tv'
  const id = parseInt(params.id, 10)

  const [sourceId, setSourceId] = useState(SOURCES[0].id)
  const [season, setSeason] = useState(1)
  const [episode, setEpisode] = useState(1)
  const [showSources, setShowSources] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [iframeKey, setIframeKey] = useState(0) // force reload
  const [iframeLoaded, setIframeLoaded] = useState(false)

  const containerRef = useRef<HTMLDivElement>(null)
  const iframeRef = useRef<HTMLIFrameElement>(null)

  const { data: movieData, isLoading: movieLoading } = useMovieDetails(
    mediaType === 'movie' ? id : 0,
  )
  const { data: tvData, isLoading: tvLoading } = useTVDetails(mediaType === 'tv' ? id : 0)

  const details = mediaType === 'movie' ? movieData : tvData
  const isLoading = mediaType === 'movie' ? movieLoading : tvLoading

  const title =
    (details as any)?.title || (details as any)?.name || 'Loading...'
  const totalSeasons = (details as any)?.number_of_seasons ?? 1

  const currentSource = SOURCES.find((s) => s.id === sourceId) ?? SOURCES[0]
  const embedUrl = currentSource.getUrl(mediaType, id, season, episode)

  // ── Fullscreen handler ──────────────────────────────────────────────────────
  const handleFullscreen = useCallback(async () => {
    const el = containerRef.current
    if (!el) return

    if (!document.fullscreenElement) {
      try {
        await el.requestFullscreen()
        await lockLandscape()
        setIsFullscreen(true)
      } catch {
        // fallback: try webkit
        const wkEl = el as any
        if (wkEl.webkitRequestFullscreen) {
          wkEl.webkitRequestFullscreen()
          setIsFullscreen(true)
        }
      }
    } else {
      document.exitFullscreen()
      unlockOrientation()
      setIsFullscreen(false)
    }
  }, [])

  useEffect(() => {
    const handler = () => {
      const inFS = !!document.fullscreenElement
      setIsFullscreen(inFS)
      if (!inFS) unlockOrientation()
    }
    document.addEventListener('fullscreenchange', handler)
    document.addEventListener('webkitfullscreenchange', handler)
    return () => {
      document.removeEventListener('fullscreenchange', handler)
      document.removeEventListener('webkitfullscreenchange', handler)
    }
  }, [])

  // Reset iframe loaded state on source/episode change
  useEffect(() => {
    setIframeLoaded(false)
  }, [iframeKey, sourceId, season, episode])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black flex flex-col">
      {/* ── Top Bar ── */}
      <div className="flex items-center gap-3 px-4 py-3 bg-zinc-950 border-b border-zinc-800/60 pt-20 flex-shrink-0">
        <Link
          to="/details/$mediaType/$id"
          params={{ mediaType, id: String(id) }}
          className="flex items-center gap-1.5 text-zinc-400 hover:text-white transition-colors text-sm"
        >
          <ChevronLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Back</span>
        </Link>

        <div className="flex-1 min-w-0">
          <h1 className="text-white font-semibold text-sm sm:text-base truncate">{title}</h1>
          {mediaType === 'tv' && (
            <p className="text-zinc-500 text-xs">
              Season {season} · Episode {episode}
            </p>
          )}
        </div>

        {/* Source selector button */}
        <button
          onClick={() => setShowSources((v) => !v)}
          className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 px-3 py-1.5 rounded-full transition-all"
        >
          <Server className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">{currentSource.label}</span>
          <span className="sm:hidden">Server</span>
        </button>
      </div>

      {/* ── Source Dropdown ── */}
      <AnimatePresence>
        {showSources && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.15 }}
            className="bg-zinc-900 border-b border-zinc-800 px-4 py-3 flex-shrink-0"
          >
            <p className="text-zinc-500 text-xs mb-2 flex items-center gap-1.5">
              <Monitor className="w-3 h-3" />
              Choose a server — try another if video doesn't load
            </p>
            <div className="flex gap-2 flex-wrap">
              {SOURCES.map((src) => (
                <button
                  key={src.id}
                  onClick={() => {
                    setSourceId(src.id)
                    setIframeKey((k) => k + 1)
                    setShowSources(false)
                  }}
                  className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border transition-all ${
                    src.id === sourceId
                      ? 'bg-[#E50914] text-white border-[#E50914]'
                      : 'bg-zinc-800 text-zinc-300 border-zinc-700 hover:bg-zinc-700 hover:text-white'
                  }`}
                >
                  <span>{src.icon}</span>
                  {src.label}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── TV: Season / Episode Picker ── */}
      {mediaType === 'tv' && (
        <div className="bg-zinc-950 border-b border-zinc-800/60 px-4 py-2 flex items-center gap-3 flex-shrink-0">
          <div className="flex items-center gap-2">
            <label className="text-zinc-500 text-xs">Season</label>
            <select
              value={season}
              onChange={(e) => {
                setSeason(Number(e.target.value))
                setEpisode(1)
                setIframeKey((k) => k + 1)
              }}
              className="bg-zinc-800 text-white text-xs border border-zinc-700 rounded px-2 py-1 focus:outline-none focus:border-[#E50914]"
            >
              {Array.from({ length: totalSeasons }, (_, i) => i + 1).map((s) => (
                <option key={s} value={s}>
                  S{String(s).padStart(2, '0')}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-zinc-500 text-xs">Episode</label>
            <select
              value={episode}
              onChange={(e) => {
                setEpisode(Number(e.target.value))
                setIframeKey((k) => k + 1)
              }}
              className="bg-zinc-800 text-white text-xs border border-zinc-700 rounded px-2 py-1 focus:outline-none focus:border-[#E50914]"
            >
              {Array.from({ length: 30 }, (_, i) => i + 1).map((ep) => (
                <option key={ep} value={ep}>
                  E{String(ep).padStart(2, '0')}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* ── Player ── */}
      {/* 
        - On desktop: 16/9 aspect ratio inside normal flow
        - On mobile fullscreen: fills entire screen in landscape via CSS 
          + screen.orientation.lock('landscape')
      */}
      <div className="flex-1 flex flex-col items-center justify-center bg-black px-0 sm:px-4 sm:py-4">
        <div
          ref={containerRef}
          className={`relative w-full bg-black overflow-hidden transition-all ${
            isFullscreen
              ? 'fixed inset-0 z-[9999] w-screen h-screen'
              : 'max-w-6xl mx-auto rounded-none sm:rounded-xl ring-0 sm:ring-1 sm:ring-zinc-800'
          }`}
          style={isFullscreen ? {} : { aspectRatio: '16/9' }}
        >
          {/* Loading overlay */}
          {!iframeLoaded && (
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-zinc-950 gap-3">
              <div className="w-12 h-12 rounded-full bg-[#E50914]/10 flex items-center justify-center mb-1">
                <Play className="w-6 h-6 text-[#E50914] fill-[#E50914]" />
              </div>
              <Spinner size="md" />
              <p className="text-zinc-500 text-xs">Loading {currentSource.label}…</p>
            </div>
          )}

          {/* Iframe */}
          <iframe
            ref={iframeRef}
            key={`${iframeKey}-${sourceId}-${season}-${episode}`}
            src={embedUrl}
            title={title}
            allowFullScreen
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
            onLoad={() => setIframeLoaded(true)}
            className="absolute inset-0 w-full h-full border-0"
            style={{ colorScheme: 'dark' }}
          />

          {/* Controls overlay (top-right corner of player) */}
          <div className="absolute top-3 right-3 z-20 flex items-center gap-2 opacity-0 hover:opacity-100 transition-opacity">
            {/* Reload */}
            <button
              onClick={() => setIframeKey((k) => k + 1)}
              title="Reload player"
              className="w-8 h-8 rounded-full bg-black/70 hover:bg-black flex items-center justify-center text-white/80 hover:text-white transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>

            {/* Fullscreen + landscape lock */}
            <button
              onClick={handleFullscreen}
              title={isFullscreen ? 'Exit fullscreen' : 'Fullscreen (landscape)'}
              className="w-8 h-8 rounded-full bg-black/70 hover:bg-black flex items-center justify-center text-white/80 hover:text-white transition-colors"
            >
              {isFullscreen ? (
                <Minimize className="w-3.5 h-3.5" />
              ) : (
                <Maximize className="w-3.5 h-3.5" />
              )}
            </button>
          </div>
        </div>

        {/* ── Tip ── */}
        {!isFullscreen && (
          <div className="w-full max-w-6xl mx-auto mt-3 px-4 sm:px-0">
            <div className="flex items-start gap-2 text-zinc-600 text-xs">
              <Info className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
              <p>
                فالموبايل — دير <strong className="text-zinc-500">Fullscreen</strong> وغادي يتحول
                للوضع الأفقي تلقائيا. إلا ما خدمش الفيديو، جرب سيرفر آخر.
              </p>
            </div>

            {/* Ad / popup warning */}
            <div className="flex items-start gap-2 text-zinc-600 text-xs mt-1.5">
              <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5 text-yellow-600/60" />
              <p>
                هاد السيرفيرات ممكن يطلعو إعلانات — خدم
                <strong className="text-zinc-500"> popup blocker</strong> فالمتصفح ديالك.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* ── CSS: force landscape inside fullscreen on mobile ── */}
      <style>{`
        @media screen and (orientation: portrait) {
          :-webkit-full-screen div[data-player] {
            transform: rotate(90deg);
            transform-origin: center center;
            width: 100vh;
            height: 100vw;
          }
        }

        /* Hide navbar when fullscreen */
        :fullscreen ~ * nav,
        :fullscreen ~ nav {
          display: none !important;
        }

        /* iOS Safari fullscreen helper */
        @supports (-webkit-touch-callout: none) {
          .fullscreen-ios {
            position: fixed;
            inset: 0;
            z-index: 9999;
            width: 100vw;
            height: 100vh;
          }
        }
      `}</style>
    </div>
  )
}
