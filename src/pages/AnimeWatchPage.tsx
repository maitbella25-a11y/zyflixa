import React, { useState, useRef, useEffect, useCallback } from 'react'
import { useParams, Link } from '@tanstack/react-router'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, Server, Monitor, RefreshCw, ChevronDown, AlertTriangle } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { getAnimeById } from '../lib/api'
import { Spinner } from '../components/ui/Spinner'
import { useSEO } from '../hooks/useSEO'

interface AnimeEmbedSource {
  id: string
  label: string
  getUrl: (malId: number, ep?: number) => string
}

// ── Servers that accept MAL ID directly ──────────────────────────────────────
const ANIME_SOURCES: AnimeEmbedSource[] = [
  {
    // MegaPlay: dedicated anime embed API — supports MAL ID + episode number
    id: 'megaplay',
    label: 'MegaPlay',
    getUrl: (id, ep = 1) => `https://megaplay.buzz/stream/s-2/${id}/sub?mal=${id}&ep=${ep}`,
  },
  {
    // Autoembed supports anime via MAL ID
    id: 'autoembed-anime',
    label: 'AutoEmbed',
    getUrl: (id, ep = 1) => `https://autoembed.cc/anime/mal/${id}/${ep}`,
  },
  {
    // Videasy — supports anime with MAL ID
    id: 'videasy-anime',
    label: 'Videasy',
    getUrl: (id, ep = 1) => `https://player.videasy.net/anime/${id}/${ep}`,
  },
  {
    // VidSrc supports anime too
    id: 'vidsrc-anime',
    label: 'VidSrc',
    getUrl: (id, ep = 1) => `https://vidsrc.me/embed/anime?mal=${id}&episode=${ep}`,
  },
  {
    // AniWatch.to (aniwatchtv.to) — still working in 2026 as HiAnime successor
    id: 'aniwatch',
    label: 'AniWatch',
    getUrl: (id) => `https://aniwatchtv.to/search?keyword=${id}`,
  },
  {
    // AnimePahe — known for good quality & minimal ads
    id: 'animepahe',
    label: 'AnimePahe',
    getUrl: (id) => `https://animepahe.ru/a/${id}`,
  },
  {
    // 9AnimeTV — popular mirror working in 2026
    id: '9animetv',
    label: '9AnimeTV',
    getUrl: (id) => `https://9animetv.to/search?keyword=${id}`,
  },
  {
    // GogoAnime (Anitaku) — massive library, still active
    id: 'gogoanime',
    label: 'GogoAnime',
    getUrl: (id) => `https://anitaku.pe/category/${id}`,
  },
  {
    // AllAnime — good alternative, active in 2026
    id: 'allanime',
    label: 'AllAnime',
    getUrl: (id) => `https://allanime.to/anime/${id}`,
  },
]

import { WatchShell } from '../components/WatchShell'

export const AnimeWatchPage: React.FC = () => {
  const params = useParams({ from: '/watch/anime/$id' })
  const malId  = parseInt(params.id, 10)

  const [sourceId, setSourceId]           = useState(ANIME_SOURCES[0].id)
  const [episode, setEpisode]             = useState(1)
  const [iframeKey, setIframeKey]         = useState(0)
  const [showSources, setShowSources]     = useState(false)
  const [showEpisodes, setShowEpisodes]   = useState(false)
  const [loadError, setLoadError]         = useState(false)
  const [autoFallback, setAutoFallback]   = useState(false)
  const errorTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const { data: anime, isLoading } = useQuery({
    queryKey: ['anime-detail', malId],
    queryFn: () => getAnimeById(malId),
    enabled: !!malId,
    staleTime: 30 * 60 * 1000,
  })

  const title          = (anime as any)?.title_english || (anime as any)?.title || ''
  const totalEpisodes  = (anime as any)?.episodes || 24
  const poster         = (anime as any)?.images?.jpg?.large_image_url || undefined

  useSEO({
    title:       title ? `Watch ${title} — Episode ${episode}` : 'Watch Anime',
    description: title ? `Stream ${title} episode ${episode} free on Zyflixa.` : undefined,
    image:       poster,
    url:         `/watch/anime/${malId}`,
  })

  const currentSource      = ANIME_SOURCES.find((s) => s.id === sourceId) ?? ANIME_SOURCES[0]
  const currentSourceIndex = ANIME_SOURCES.findIndex((s) => s.id === sourceId)
  const embedUrl           = currentSource.getUrl(malId, episode)

  // Auto-fallback after 10s
  useEffect(() => {
    setLoadError(false)
    setAutoFallback(false)
    if (errorTimer.current) clearTimeout(errorTimer.current)
    errorTimer.current = setTimeout(() => {
      const next = (currentSourceIndex + 1) % ANIME_SOURCES.length
      if (next !== 0) {
        setSourceId(ANIME_SOURCES[next].id)
        setIframeKey((k) => k + 1)
        setAutoFallback(true)
      } else {
        setLoadError(true)
      }
    }, 10000)
    return () => { if (errorTimer.current) clearTimeout(errorTimer.current) }
  }, [iframeKey, sourceId, currentSourceIndex])

  const handleNextSource = useCallback(() => {
    const next = ANIME_SOURCES[(currentSourceIndex + 1) % ANIME_SOURCES.length]
    setSourceId(next.id)
    setIframeKey((k) => k + 1)
    setAutoFallback(true)
    setLoadError(false)
  }, [currentSourceIndex])

  return (
    <WatchShell
      title={title}
      subtitle={`Episode ${episode}`}
      backTo={{ to: '/anime/$id', params: { id: String(malId) } }}
      currentSource={currentSource}
      sourceIndex={currentSourceIndex}
      totalSources={ANIME_SOURCES.length}
      onNextSource={handleNextSource}
      onReload={() => setIframeKey((k) => k + 1)}
      isLoading={isLoading}
      iframeKey={iframeKey}
      embedUrl={embedUrl}
      onIframeLoad={() => {
        setLoadError(false)
        if (errorTimer.current) clearTimeout(errorTimer.current)
      }}
      loadError={loadError}
      autoFallback={autoFallback}
      accentColor="#7c3aed" // Violet 600
      topRightControls={
        <div className="relative flex-shrink-0">
          <button
            onClick={() => { setShowEpisodes((v) => !v); setShowSources(false) }}
            className="flex items-center gap-1.5 text-xs text-white/80 hover:text-white bg-black/40 hover:bg-black/70 backdrop-blur-sm border border-white/15 px-3 py-1.5 rounded-full transition-all"
          >
            <span>EP {String(episode).padStart(2, '0')}</span>
            <ChevronDown className="w-3 h-3" />
          </button>

          <AnimatePresence>
            {showEpisodes && (
              <motion.div
                initial={{ opacity: 0, y: -6, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -6, scale: 0.97 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 top-full mt-2 bg-zinc-900/95 backdrop-blur-md border border-zinc-700/80 rounded-xl p-3 shadow-2xl pointer-events-auto"
                style={{ minWidth: 200 }}
              >
                <p className="text-zinc-500 text-[10px] uppercase tracking-wider mb-2">Episode</p>
                <div className="flex flex-wrap gap-1.5 max-h-52 overflow-y-auto scrollbar-hide">
                  {Array.from({ length: totalEpisodes }, (_, i) => i + 1).map((ep) => (
                    <button
                      key={ep}
                      onClick={() => { setEpisode(ep); setIframeKey((k) => k + 1); setShowEpisodes(false) }}
                      className={`text-xs px-2.5 py-1 rounded-full border transition-all ${
                        ep === episode
                          ? 'bg-violet-600 text-white border-violet-600'
                          : 'bg-zinc-800 text-zinc-400 border-zinc-700 hover:text-white hover:bg-zinc-700'
                      }`}
                    >
                      EP {String(ep).padStart(2, '0')}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      }
      overlayChildren={
        <div className="relative flex-shrink-0">
          <button
            onClick={() => { setShowSources((v) => !v); setShowEpisodes(false) }}
            className="flex items-center gap-1.5 text-xs text-white/80 hover:text-white bg-black/40 hover:bg-black/70 backdrop-blur-sm border border-white/15 px-3 py-1.5 rounded-full transition-all"
          >
            <Server className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{currentSource.label}</span>
            <span className="text-[10px] text-zinc-400">({currentSourceIndex + 1}/{ANIME_SOURCES.length})</span>
          </button>

          <AnimatePresence>
            {showSources && (
              <motion.div
                initial={{ opacity: 0, y: -6, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -6, scale: 0.97 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 top-full mt-2 bg-zinc-900/95 backdrop-blur-md border border-zinc-700/80 rounded-xl p-3 shadow-2xl pointer-events-auto"
                style={{ minWidth: 180 }}
              >
                <p className="text-zinc-500 text-[10px] uppercase tracking-wider mb-2 flex items-center gap-1">
                  <Monitor className="w-3 h-3" /> Anime Servers
                </p>
                <div className="flex flex-col gap-1.5">
                  {ANIME_SOURCES.map((src) => (
                    <button
                      key={src.id}
                      onClick={() => { setSourceId(src.id); setIframeKey((k) => k + 1); setShowSources(false) }}
                      className={`text-xs px-3 py-1.5 rounded-lg border text-left transition-all ${
                        src.id === sourceId
                          ? 'bg-violet-600 text-white border-violet-600'
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
      }
    />
  )
}

