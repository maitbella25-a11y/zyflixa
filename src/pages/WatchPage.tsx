import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react'
import { useParams, Link } from '@tanstack/react-router'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, Server, Monitor, RefreshCw, ChevronDown, AlertTriangle } from 'lucide-react'
import { useMovieDetails, useTVDetails } from '../hooks/useMovies'
import { Spinner } from '../components/ui/Spinner'
import { rankServers, recordSuccess, recordFailure } from '../hooks/useServerRanking'
import { useSEO } from '../hooks/useSEO'
import { getBackdropUrl, getMediaTitle } from '../lib/tmdb'
import type { MediaDetails } from '../lib/tmdb'

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
    id: 'videasy',
    label: 'Videasy',
    getUrl: (t, id, s, e) =>
      t === 'movie'
        ? `https://player.videasy.net/movie/${id}`
        : `https://player.videasy.net/tv/${id}/${s ?? 1}/${e ?? 1}`,
  },
  {
    id: 'vidsrc-cc',
    label: 'VidSrc CC',
    getUrl: (t, id, s, e) =>
      t === 'movie'
        ? `https://vidsrc.cc/v2/embed/movie/${id}`
        : `https://vidsrc.cc/v2/embed/tv/${id}/${s ?? 1}/${e ?? 1}`,
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
    getUrl: (t, id, s, e) =>
      t === 'movie'
        ? `https://autoembed.cc/movie/tmdb/${id}`
        : `https://autoembed.cc/tv/tmdb/${id}-${s ?? 1}-${e ?? 1}`,
  },
  {
    id: 'superembed',
    label: 'SuperEmbed',
    getUrl: (t, id, s, e) =>
      t === 'movie'
        ? `https://www.superembed.stream/embed/movie/${id}`
        : `https://www.superembed.stream/embed/tv/${id}/${s ?? 1}/${e ?? 1}`,
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
    id: 'rivestream',
    label: 'RiveStream',
    getUrl: (t, id, s, e) =>
      t === 'movie'
        ? `https://rivestream.org/embed?type=movie&id=${id}`
        : `https://rivestream.org/embed?type=tv&id=${id}&season=${s ?? 1}&episode=${e ?? 1}`,
  },
  {
    id: 'nontonfilm',
    label: 'NontonFilm',
    getUrl: (t, id, s, e) =>
      t === 'movie'
        ? `https://www.NontonFilm.net/api/?tmdb=${id}&type=movie`
        : `https://www.NontonFilm.net/api/?tmdb=${id}&type=serie&s=${s ?? 1}&e=${e ?? 1}`,
  },
  {
    id: 'zyflixa',
    label: 'Zyflixa',
    getUrl: (t, id, s, e) =>
      t === 'movie'
        ? `https://zyflixa.eu.cc/embed/movie/${id}`
        : `https://zyflixa.eu.cc/embed/tv/${id}/${s ?? 1}/${e ?? 1}`,
  },
]

import { WatchShell } from '../components/WatchShell'

export const WatchPage: React.FC = () => {
  const params    = useParams({ from: '/watch/$mediaType/$id' })
  const mediaType = params.mediaType as 'movie' | 'tv'
  const id        = parseInt(params.id, 10)

  // Sort servers by historical success score — best first
  const rankedSources = useMemo(() => rankServers(SOURCES), [])

  const [sourceId, setSourceId]         = useState(rankedSources[0].id)
  const [season, setSeason]             = useState(1)
  const [episode, setEpisode]           = useState(1)
  const [iframeKey, setIframeKey]       = useState(0)
  const [showSources, setShowSources]   = useState(false)
  const [showEpisodes, setShowEpisodes] = useState(false)
  const [loadError, setLoadError]       = useState(false)
  const [autoFallback, setAutoFallback] = useState(false)
  const errorTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const { data: movieData, isLoading: movieLoading } = useMovieDetails(mediaType === 'movie' ? id : 0)
  const { data: tvData,    isLoading: tvLoading }    = useTVDetails(mediaType === 'tv' ? id : 0)

  const details: MediaDetails | null = mediaType === 'movie' ? movieData ?? null : tvData ?? null
  const isLoading  = mediaType === 'movie' ? movieLoading : tvLoading
  const title      = getMediaTitle(details)
  const totalSeasons      = details && 'number_of_seasons' in details ? details.number_of_seasons ?? 1 : 1
  const seasons           = details && 'seasons' in details ? details.seasons : undefined

  // Improved episode count estimation
  const episodesPerSeason = useMemo(() => {
    if (seasons) {
      const found = seasons.find((s) => s.season_number === season)
      if (found?.episode_count) return found.episode_count
    }
    const totalEpisodes = (details as any)?.number_of_episodes ?? 50
    return Math.max(1, Math.ceil(totalEpisodes / Math.max(totalSeasons, 1)))
  }, [details, seasons, season, totalSeasons])

  const seoTitle = mediaType === 'tv' && title
    ? `Watch ${title} S${String(season).padStart(2,'0')}E${String(episode).padStart(2,'0')}`
    : title ? `Watch ${title}` : 'Watch'

  useSEO({
    title:       seoTitle,
    description: title ? `Stream ${title} free on Zyflixa.` : undefined,
    image:       details?.backdrop_path
                   ? getBackdropUrl(details.backdrop_path, 'w1280')
                   : undefined,
    url:         `/watch/${mediaType}/${id}`,
  })

  const currentSource      = rankedSources.find((s) => s.id === sourceId) ?? rankedSources[0]
  const embedUrl           = currentSource.getUrl(mediaType, id, season, episode)
  const currentSourceIndex = rankedSources.findIndex((s) => s.id === sourceId)

  // Auto-fallback logic
  useEffect(() => {
    setLoadError(false)
    setAutoFallback(false)
    if (errorTimer.current) clearTimeout(errorTimer.current)
    errorTimer.current = setTimeout(() => {
      recordFailure(sourceId)
      const next = (currentSourceIndex + 1) % rankedSources.length
      if (next !== 0) {
        setSourceId(rankedSources[next].id)
        setIframeKey((k) => k + 1)
        setAutoFallback(true)
      } else {
        setLoadError(true)
      }
    }, 10000)
    return () => { if (errorTimer.current) clearTimeout(errorTimer.current) }
  }, [iframeKey, sourceId, currentSourceIndex, rankedSources])

  const handleNextSource = useCallback(() => {
    recordFailure(sourceId)
    const next = rankedSources[(currentSourceIndex + 1) % rankedSources.length]
    setSourceId(next.id)
    setIframeKey((k) => k + 1)
    setAutoFallback(true)
    setLoadError(false)
  }, [currentSourceIndex, rankedSources, sourceId])

  const handleIframeLoad = useCallback(() => {
    setLoadError(false)
    recordSuccess(sourceId)
    if (errorTimer.current) clearTimeout(errorTimer.current)
  }, [sourceId])

  return (
    <WatchShell
      title={title}
      subtitle={mediaType === 'tv' ? `Season ${season} · Episode ${episode}` : ''}
      backTo={{ to: '/details/$mediaType/$id', params: { mediaType, id: String(id) } }}
      currentSource={currentSource}
      sourceIndex={currentSourceIndex}
      totalSources={rankedSources.length}
      onNextSource={handleNextSource}
      onReload={() => setIframeKey((k) => k + 1)}
      isLoading={isLoading}
      iframeKey={iframeKey}
      embedUrl={embedUrl}
      onIframeLoad={handleIframeLoad}
      loadError={loadError}
      autoFallback={autoFallback}
      topRightControls={mediaType === 'tv' && (
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
                className="absolute right-0 top-full mt-2 bg-zinc-900/95 backdrop-blur-md border border-zinc-700/80 rounded-xl p-3 shadow-2xl pointer-events-auto"
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
      overlayChildren={
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
                className="absolute right-0 top-full mt-2 bg-zinc-900/95 backdrop-blur-md border border-zinc-700/80 rounded-xl p-3 shadow-2xl pointer-events-auto"
                style={{ minWidth: 180 }}
              >
                <p className="text-zinc-500 text-[10px] uppercase tracking-wider mb-2 flex items-center gap-1">
                  <Monitor className="w-3 h-3" /> Servers ({rankedSources.length})
                </p>
                <div className="flex flex-col gap-1.5">
                  {rankedSources.map((src) => (
                    <button key={src.id}
                      onClick={() => { setSourceId(src.id); setIframeKey((k) => k + 1); setShowSources(false) }}
                      className={`text-xs px-3 py-1.5 rounded-lg border text-left transition-all flex items-center justify-between gap-2 ${
                        src.id === sourceId
                          ? 'bg-[#E50914] text-white border-[#E50914]'
                          : 'bg-zinc-800 text-zinc-300 border-zinc-700 hover:bg-zinc-700 hover:text-white'
                      }`}
                    >
                      <span>{src.label}</span>
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

