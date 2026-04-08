import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react'
import { useParams, Link } from '@tanstack/react-router'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, Server, Monitor, RefreshCw, ChevronDown, Zap } from 'lucide-react'
import { useMovieDetails, useTVDetails } from '../hooks/useMovies'
import { Spinner } from '../components/ui/Spinner'
import { recordSuccess, recordFailure } from '../hooks/useServerRanking'
import { useSEO } from '../hooks/useSEO'
import { getBackdropUrl } from '../lib/tmdb'

interface EmbedSource {
  id: string
  label: string
  arabic?: boolean
  getUrl: (type: 'movie' | 'tv', id: number, season?: number, episode?: number) => string
}

const SOURCES: EmbedSource[] = [
  {
    id: 'videasy',
    label: 'Videasy',
    arabic: true,
    getUrl: (t, id, s, e) =>
      t === 'movie'
        ? `https://player.videasy.net/movie/${id}`
        : `https://player.videasy.net/tv/${id}/${s ?? 1}/${e ?? 1}`,
  },
  {
    id: 'vidsrc-cc',
    label: 'VidSrc CC',
    arabic: true,
    getUrl: (t, id, s, e) =>
      t === 'movie'
        ? `https://vidsrc.cc/v2/embed/movie/${id}`
        : `https://vidsrc.cc/v2/embed/tv/${id}/${s ?? 1}/${e ?? 1}`,
  },
  {
    id: 'embedsu',
    label: 'EmbedSu',
    arabic: true,
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
    id: 'vidsrc-pro',
    label: 'VidSrc Pro',
    getUrl: (t, id, s, e) =>
      t === 'movie'
        ? `https://vidsrc.pro/embed/movie/${id}`
        : `https://vidsrc.pro/embed/tv/${id}/${s ?? 1}/${e ?? 1}`,
  },
  {
    id: 'vidsrc-xyz',
    label: 'VidSrc XYZ',
    getUrl: (t, id, s, e) =>
      t === 'movie'
        ? `https://vidsrc.xyz/embed/movie/${id}`
        : `https://vidsrc.xyz/embed/tv/${id}/${s ?? 1}/${e ?? 1}`,
  },
  {
    id: 'vidfast',
    label: 'VidFast',
    getUrl: (t, id, s, e) =>
      t === 'movie'
        ? `https://vidfast.pro/movie/${id}?autoPlay=true`
        : `https://vidfast.pro/tv/${id}/${s ?? 1}/${e ?? 1}?autoPlay=true`,
  },
  {
    id: 'autoembed',
    label: 'AutoEmbed',
    arabic: true,
    getUrl: (t, id, s, e) =>
      t === 'movie'
        ? `https://autoembed.cc/movie/tmdb/${id}`
        : `https://autoembed.cc/tv/tmdb/${id}-${s ?? 1}-${e ?? 1}`,
  },
  {
    id: 'zyflixa',
    label: 'Zyflixa',
    arabic: true,
    getUrl: (t, id, s, e) =>
      t === 'movie'
        ? `https://zyflixa.eu.cc/embed/movie/${id}`
        : `https://zyflixa.eu.cc/embed/tv/${id}/${s ?? 1}/${e ?? 1}`,
  },
]

// sandbox attribute يمنع فتح نوافذ popup من السيرفر
const IFRAME_SANDBOX = 'allow-scripts allow-same-origin allow-forms allow-presentation allow-fullscreen'

export const WatchPage: React.FC = () => {
  const params    = useParams({ from: '/watch/$mediaType/$id' })
  const mediaType = params.mediaType as 'movie' | 'tv'
  const id        = parseInt(params.id, 10)

  const [season, setSeason]               = useState(1)
  const [episode, setEpisode]             = useState(1)
  const [iframeKey, setIframeKey]         = useState(0)
  const [raceKey, setRaceKey]             = useState(0)
  const [winnerId, setWinnerId]           = useState<string | null>(null)
  const [racing, setRacing]               = useState(true)
  const [manualSourceId, setManualSourceId] = useState<string | null>(null)
  const [showOverlay, setShowOverlay]     = useState(true)
  const [showSources, setShowSources]     = useState(false)
  const [showEpisodes, setShowEpisodes]   = useState(false)
  const hideTimer   = useRef<ReturnType<typeof setTimeout> | null>(null)
  const winnerSet   = useRef(false)
  const iframeRef   = useRef<HTMLIFrameElement>(null)

  const { data: movieData, isLoading: movieLoading } = useMovieDetails(mediaType === 'movie' ? id : 0)
  const { data: tvData,    isLoading: tvLoading }    = useTVDetails(mediaType === 'tv' ? id : 0)

  const details           = mediaType === 'movie' ? movieData : tvData
  const isLoading         = mediaType === 'movie' ? movieLoading : tvLoading
  const title             = (details as any)?.title || (details as any)?.name || ''
  const totalSeasons      = (details as any)?.number_of_seasons ?? 1
  const totalEpisodes     = (details as any)?.number_of_episodes ?? 50
  const episodesPerSeason = Math.max(13, Math.ceil(totalEpisodes / Math.max(totalSeasons, 1)))

  // السيرفرات: العربية أولاً
  const sortedSources = useMemo(() =>
    [...SOURCES].sort((a, b) => (b.arabic ? 1 : 0) - (a.arabic ? 1 : 0)),
    []
  )

  // ── Race: يطلق كل السيرفرات في نفس الوقت ويختار الأول الذي يستجيب ──────────
  useEffect(() => {
    setWinnerId(null)
    setRacing(true)
    winnerSet.current = false

    const iframes: HTMLIFrameElement[] = []

    const cleanup = () => {
      iframes.forEach((f) => {
        try { document.body.removeChild(f) } catch {}
      })
      clearTimeout(fallback)
    }

    sortedSources.forEach((src) => {
      const iframe = document.createElement('iframe')
      iframe.style.cssText = 'position:fixed;top:-9999px;left:-9999px;width:1px;height:1px;opacity:0;pointer-events:none;'
      iframe.src = src.getUrl(mediaType, id, season, episode)
      iframe.sandbox.value = IFRAME_SANDBOX
      document.body.appendChild(iframe)
      iframes.push(iframe)

      iframe.onload = () => {
        if (!winnerSet.current) {
          winnerSet.current = true
          setWinnerId(src.id)
          setRacing(false)
          recordSuccess(src.id)
          cleanup()
        }
      }
    })

    // fallback بعد 8 ثواني
    const fallback = setTimeout(() => {
      if (!winnerSet.current) {
        winnerSet.current = true
        setWinnerId(sortedSources[0].id)
        setRacing(false)
        recordFailure(sortedSources[0].id)
        cleanup()
      }
    }, 8000)

    return cleanup
  }, [raceKey, mediaType, id, season, episode])

  const activeId     = manualSourceId ?? winnerId ?? sortedSources[0].id
  const activeSource = sortedSources.find((s) => s.id === activeId) ?? sortedSources[0]
  const embedUrl     = activeSource.getUrl(mediaType, id, season, episode)

  const seoTitle = mediaType === 'tv' && title
    ? `Watch ${title} S${String(season).padStart(2,'0')}E${String(episode).padStart(2,'0')}`
    : title ? `Watch ${title}` : 'Watch'

  useSEO({
    title:       seoTitle,
    description: title ? `Stream ${title} free on Zyflixa.` : undefined,
    image:       (details as any)?.backdrop_path
                   ? getBackdropUrl((details as any).backdrop_path, 'w1280')
                   : undefined,
    url:         `/watch/${mediaType}/${id}`,
  })

  const handleIframeLoad = useCallback(() => {
    recordSuccess(activeId)
  }, [activeId])

  const handleMouseMove = useCallback(() => {
    setShowOverlay(true)
    if (hideTimer.current) clearTimeout(hideTimer.current)
    hideTimer.current = setTimeout(() => setShowOverlay(false), 3000)
  }, [])

  const handleContainerClick = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget) setShowOverlay((v) => !v)
  }, [])

  useEffect(() => () => { if (hideTimer.current) clearTimeout(hideTimer.current) }, [])

  const reload = useCallback(() => {
    setManualSourceId(null)
    setRaceKey((k) => k + 1)
    setIframeKey((k) => k + 1)
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
      onClick={handleContainerClick}
    >
      {/* ── Racing overlay ── */}
      <AnimatePresence>
        {racing && !manualSourceId && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-black gap-4"
          >
            <Spinner size="lg" />
            <div className="flex items-center gap-2 text-zinc-400 text-sm">
              <Zap className="w-4 h-4 text-yellow-400 animate-pulse" />
              <span>جارٍ اختيار أسرع سيرفر...</span>
            </div>
            <div className="flex gap-1.5 flex-wrap justify-center max-w-xs px-4">
              {sortedSources.map((src) => (
                <span key={src.id} className="text-xs text-zinc-600 bg-zinc-900 px-2 py-0.5 rounded-full animate-pulse">
                  {src.label}{src.arabic ? ' 🇦🇪' : ''}
                </span>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── iframe — sandbox يمنع الـ popups ── */}
      {!racing || manualSourceId ? (
        <iframe
          ref={iframeRef}
          key={`${iframeKey}-${activeId}`}
          src={embedUrl}
          className="w-full h-full border-0"
          allowFullScreen
          allow="autoplay; fullscreen; picture-in-picture"
          sandbox={IFRAME_SANDBOX}
          onLoad={handleIframeLoad}
        />
      ) : null}

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
            <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-black/75 to-transparent" />

            <div
              className="absolute top-0 left-0 right-0 flex items-center gap-3 px-4 pt-5 pb-4 pointer-events-auto"
              onClick={(e) => e.stopPropagation()}
            >
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

              {/* Active server badge */}
              {!racing && (
                <div className="hidden sm:flex items-center gap-1 bg-green-500/20 border border-green-500/40 text-green-400 text-xs px-2.5 py-1 rounded-full flex-shrink-0">
                  <Zap className="w-3 h-3" />
                  <span>{activeSource.label}</span>
                  {activeSource.arabic && <span>🇦🇪</span>}
                </div>
              )}

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
                              onClick={() => { setSeason(s); setEpisode(1); reload(); setShowEpisodes(false) }}
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
                              onClick={() => { setEpisode(ep); reload(); setShowEpisodes(false) }}
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
                  <span className="hidden sm:inline">السيرفرات</span>
                </button>

                <AnimatePresence>
                  {showSources && (
                    <motion.div
                      initial={{ opacity: 0, y: -6, scale: 0.97 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -6, scale: 0.97 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 top-full mt-2 bg-zinc-900/95 backdrop-blur-md border border-zinc-700/80 rounded-xl p-3 shadow-2xl"
                      style={{ minWidth: 200 }}
                    >
                      <p className="text-zinc-500 text-[10px] uppercase tracking-wider mb-2 flex items-center gap-1">
                        <Monitor className="w-3 h-3" /> اختر سيرفر يدوياً
                      </p>
                      <div className="flex flex-col gap-1.5">
                        {sortedSources.map((src) => (
                          <button key={src.id}
                            onClick={() => {
                              setManualSourceId(src.id)
                              setIframeKey((k) => k + 1)
                              setShowSources(false)
                            }}
                            className={`text-xs px-3 py-1.5 rounded-lg border text-left transition-all flex items-center justify-between gap-2 ${
                              src.id === activeId
                                ? 'bg-[#E50914] text-white border-[#E50914]'
                                : 'bg-zinc-800 text-zinc-300 border-zinc-700 hover:bg-zinc-700 hover:text-white'
                            }`}
                          >
                            <span>{src.label}</span>
                            <div className="flex items-center gap-1">
                              {src.arabic && <span className="text-[10px] opacity-70">🇦🇪</span>}
                              {src.id === winnerId && !manualSourceId && (
                                <span className="text-[10px] text-green-400">⚡</span>
                              )}
                            </div>
                          </button>
                        ))}
                      </div>
                      <button
                        onClick={() => { setManualSourceId(null); setRaceKey((k) => k + 1); setIframeKey((k) => k + 1); setShowSources(false) }}
                        className="mt-2 w-full text-xs text-zinc-500 hover:text-white py-1.5 rounded-lg border border-zinc-700 hover:bg-zinc-800 transition-all flex items-center justify-center gap-1"
                      >
                        <Zap className="w-3 h-3" /> اختيار تلقائي
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Reload */}
              <button
                onClick={reload}
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
