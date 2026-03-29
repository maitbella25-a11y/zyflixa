import React, { useEffect, useRef, useState, useCallback } from 'react'
import { useParams, Link } from '@tanstack/react-router'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ChevronLeft,
  Play,
  Star,
  Clock,
  SkipForward,
  Maximize2,
  Minimize2,
  Monitor,
  X,
} from 'lucide-react'
import { useMovieDetails, useTVDetails } from '../hooks/useMovies'
import { getImageUrl } from '../lib/tmdb'
import {
  getProgressKey,
  getProgress,
  saveProgress,
} from '../hooks/useWatchProgress'
import { Spinner } from '../components/ui/Spinner'

export const WatchPage: React.FC = () => {
  const params = useParams({ from: '/watch/$mediaType/$id' })
  const mediaType = params.mediaType as 'movie' | 'tv'
  const id = parseInt(params.id, 10)

  // TV-specific state
  const [season, setSeason] = useState(1)
  const [episode, setEpisode] = useState(1)

  // Fullscreen / cinema mode state
  const [isCinema, setIsCinema] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const playerContainerRef = useRef<HTMLDivElement>(null)

  const { data: movieData, isLoading: movieLoading } = useMovieDetails(
    mediaType === 'movie' ? id : 0,
  )
  const { data: tvData, isLoading: tvLoading } = useTVDetails(mediaType === 'tv' ? id : 0)

  const details = mediaType === 'movie' ? movieData : tvData
  const isLoading = mediaType === 'movie' ? movieLoading : tvLoading

  const progressKey = getProgressKey(mediaType, id)
  const savedProgress = getProgress(progressKey)
  const [showResume, setShowResume] = useState(false)

  const iframeRef = useRef<HTMLIFrameElement>(null)

  // Build embed URL
  const embedUrl =
    mediaType === 'movie'
      ? `https://vidking.net/embed/movie/${id}`
      : `https://vidking.net/embed/tv/${id}/${season}/${episode}`

  const title = details
    ? (details as { title?: string; name?: string }).title ||
      (details as { title?: string; name?: string }).name ||
      ''
    : ''
  const year = details
    ? (
        (details as { release_date?: string; first_air_date?: string }).release_date ||
        (details as { release_date?: string; first_air_date?: string }).first_air_date ||
        ''
      ).slice(0, 4)
    : ''
  const rating = details?.vote_average?.toFixed(1) || '0.0'
  const posterPath = details?.poster_path || null
  const numSeasons = (tvData as { number_of_seasons?: number } | null | undefined)
    ?.number_of_seasons

  // Show resume prompt if there's saved progress
  useEffect(() => {
    if (savedProgress && savedProgress.currentTime > 30 && savedProgress.duration > 0) {
      const pct = savedProgress.currentTime / savedProgress.duration
      if (pct > 0.02 && pct < 0.97) {
        setShowResume(true)
      }
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Listen for fullscreen change events
  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }
    document.addEventListener('fullscreenchange', handleFsChange)
    return () => document.removeEventListener('fullscreenchange', handleFsChange)
  }, [])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      // F key = fullscreen, T key = cinema mode, Escape = exit cinema
      if (e.key === 'f' || e.key === 'F') {
        e.preventDefault()
        handleToggleFullscreen()
      }
      if (e.key === 't' || e.key === 'T') {
        e.preventDefault()
        setIsCinema((prev) => !prev)
      }
      if (e.key === 'Escape' && isCinema) {
        setIsCinema(false)
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [isCinema]) // eslint-disable-line react-hooks/exhaustive-deps

  // Toggle native fullscreen on the player container
  const handleToggleFullscreen = useCallback(async () => {
    if (!playerContainerRef.current) return
    if (!document.fullscreenElement) {
      try {
        await playerContainerRef.current.requestFullscreen()
      } catch {
        // Fallback: just set cinema mode
        setIsCinema(true)
      }
    } else {
      await document.exitFullscreen()
    }
  }, [])

  // Listen for player events from Vidking iframe
  const handleMessage = useCallback(
    (event: MessageEvent) => {
      try {
        let data = event.data
        if (typeof data === 'string') {
          if (!data.startsWith('{') && !data.startsWith('[')) return
          data = JSON.parse(data) as unknown
        }

        if (!data || typeof data !== 'object') return

        const msgData = data as Record<string, unknown>

        // Only handle PLAYER_EVENT messages
        if (msgData['type'] !== 'PLAYER_EVENT') return

        const playerEvent = msgData['event'] as string | undefined
        const currentTime = msgData['currentTime'] as number | undefined
        const duration = msgData['duration'] as number | undefined

        if ((playerEvent === 'pause' || playerEvent === 'timeupdate') && currentTime != null) {
          saveProgress(progressKey, {
            currentTime,
            duration: duration || 0,
            mediaType,
            id,
            title,
            posterPath,
            season: mediaType === 'tv' ? season : undefined,
            episode: mediaType === 'tv' ? episode : undefined,
          })
        }
      } catch {
        // Silently ignore invalid JSON or unrelated messages
      }
    },
    [progressKey, mediaType, id, title, posterPath, season, episode],
  )

  useEffect(() => {
    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [handleMessage])

  // Send resume time to player via postMessage
  const handleResumeClick = () => {
    if (savedProgress?.currentTime && iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.postMessage(
        JSON.stringify({ type: 'SEEK', time: savedProgress.currentTime }),
        '*',
      )
    }
    setShowResume(false)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    )
  }

  return (
    <div className={`min-h-screen bg-black transition-all duration-300 ${isCinema ? 'bg-black' : ''}`}>
      {/* Header — hidden in cinema mode */}
      <AnimatePresence>
        {!isCinema && (
          <motion.div
            initial={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-4 px-4 sm:px-8 py-4 bg-gradient-to-b from-black to-transparent sticky top-0 z-10"
          >
            <Link
              to="/details/$mediaType/$id"
              params={{ mediaType, id: String(id) }}
              className="flex items-center gap-2 text-zinc-300 hover:text-white transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
              <span className="text-sm font-medium hidden sm:block">Back</span>
            </Link>
            <div className="flex-1">
              <h1 className="text-white font-semibold text-sm sm:text-base line-clamp-1">
                {title}
                {mediaType === 'tv' &&
                  ` — S${String(season).padStart(2, '0')}E${String(episode).padStart(2, '0')}`}
              </h1>
              <p className="text-zinc-500 text-xs">
                {year} • ⭐ {rating}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Cinema mode top bar */}
      <AnimatePresence>
        {isCinema && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-b from-black/80 to-transparent px-4 py-3 flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <Link
                to="/details/$mediaType/$id"
                params={{ mediaType, id: String(id) }}
                className="flex items-center gap-2 text-zinc-300 hover:text-white transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </Link>
              <span className="text-white font-semibold text-sm line-clamp-1">{title}</span>
            </div>
            <button
              onClick={() => setIsCinema(false)}
              className="flex items-center gap-1.5 text-zinc-400 hover:text-white transition-colors text-xs bg-zinc-800/70 hover:bg-zinc-700/90 px-3 py-1.5 rounded-full"
            >
              <X className="w-3.5 h-3.5" />
              Exit Cinema
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Video Player */}
      <div
        ref={playerContainerRef}
        className={`relative w-full bg-black transition-all duration-500 ${
          isCinema
            ? 'fixed inset-0 z-40 flex items-center justify-center'
            : ''
        }`}
        style={isCinema ? {} : { paddingTop: '56.25%' }}
      >
        {/* Fullscreen / Cinema control overlay — shown on hover */}
        <div
          className={`absolute ${isCinema ? 'inset-0' : 'inset-0'} z-30 group/player`}
          style={{ pointerEvents: 'none' }}
        >
          <div
            className="absolute bottom-3 right-3 flex items-center gap-2 opacity-0 group-hover/player:opacity-100 transition-opacity duration-200"
            style={{ pointerEvents: 'auto' }}
          >
            {/* Cinema mode toggle */}
            <button
              onClick={() => setIsCinema((prev) => !prev)}
              title={isCinema ? 'Exit Cinema (T)' : 'Cinema Mode (T)'}
              className="flex items-center gap-1.5 bg-black/70 hover:bg-black/90 text-white text-xs px-3 py-1.5 rounded-full border border-white/20 backdrop-blur-sm transition-all hover:scale-105"
            >
              <Monitor className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{isCinema ? 'Exit Cinema' : 'Cinema'}</span>
            </button>
            {/* Fullscreen toggle */}
            <button
              onClick={handleToggleFullscreen}
              title={isFullscreen ? 'Exit Fullscreen (F)' : 'Fullscreen (F)'}
              className="flex items-center gap-1.5 bg-black/70 hover:bg-black/90 text-white text-xs px-3 py-1.5 rounded-full border border-white/20 backdrop-blur-sm transition-all hover:scale-105"
            >
              {isFullscreen ? (
                <Minimize2 className="w-3.5 h-3.5" />
              ) : (
                <Maximize2 className="w-3.5 h-3.5" />
              )}
              <span className="hidden sm:inline">{isFullscreen ? 'Exit Full' : 'Fullscreen'}</span>
            </button>
          </div>
        </div>

        {/* Resume banner */}
        {showResume && savedProgress && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute top-0 left-0 right-0 z-20 bg-zinc-900/95 border-b border-zinc-700 px-4 py-3 flex items-center gap-3 flex-wrap"
          >
            <Clock className="w-4 h-4 text-[#E50914] flex-shrink-0" />
            <span className="text-sm text-zinc-300 flex-1">
              Continue from {Math.floor(savedProgress.currentTime / 60)}m{' '}
              {Math.floor(savedProgress.currentTime % 60)}s?
            </span>
            <div className="flex gap-2">
              <button
                onClick={handleResumeClick}
                className="flex items-center gap-1.5 bg-[#E50914] text-white text-xs font-semibold px-3 py-1.5 rounded hover:bg-[#c8070f] transition-colors"
              >
                <Play className="w-3 h-3 fill-white" />
                Resume
              </button>
              <button
                onClick={() => setShowResume(false)}
                className="text-zinc-400 hover:text-white text-xs px-3 py-1.5 rounded bg-zinc-800 hover:bg-zinc-700 transition-colors"
              >
                Start Over
              </button>
            </div>
          </motion.div>
        )}

        <iframe
          ref={iframeRef}
          src={embedUrl}
          title={title}
          allowFullScreen
          allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
          className={`border-0 bg-black ${
            isCinema
              ? 'w-full h-full max-w-[177.78vh] max-h-[56.25vw]'
              : 'absolute inset-0 w-full h-full'
          }`}
          style={
            isCinema
              ? { width: '100%', height: '100%' }
              : { top: showResume ? '56px' : '0', bottom: 0, left: 0, right: 0 }
          }
        />
      </div>

      {/* Keyboard shortcuts hint */}
      {!isCinema && (
        <div className="flex items-center gap-4 px-4 sm:px-8 py-2 bg-zinc-950 border-b border-zinc-800/60">
          <div className="flex items-center gap-3 text-xs text-zinc-600 flex-wrap">
            <span>
              <kbd className="bg-zinc-800 text-zinc-400 px-1.5 py-0.5 rounded text-[10px] font-mono">F</kbd>{' '}
              Fullscreen
            </span>
            <span>
              <kbd className="bg-zinc-800 text-zinc-400 px-1.5 py-0.5 rounded text-[10px] font-mono">T</kbd>{' '}
              Cinema Mode
            </span>
            <span>
              <kbd className="bg-zinc-800 text-zinc-400 px-1.5 py-0.5 rounded text-[10px] font-mono">Esc</kbd>{' '}
              Exit Cinema
            </span>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <button
              onClick={() => setIsCinema(true)}
              className="flex items-center gap-1.5 text-zinc-400 hover:text-white text-xs transition-colors group"
            >
              <Monitor className="w-3.5 h-3.5 group-hover:text-[#E50914] transition-colors" />
              Cinema Mode
            </button>
            <button
              onClick={handleToggleFullscreen}
              className="flex items-center gap-1.5 text-zinc-400 hover:text-white text-xs transition-colors group"
            >
              <Maximize2 className="w-3.5 h-3.5 group-hover:text-[#E50914] transition-colors" />
              Fullscreen
            </button>
          </div>
        </div>
      )}

      {/* TV Episode selector */}
      {!isCinema && mediaType === 'tv' && numSeasons != null && (
        <div className="bg-zinc-900 border-t border-zinc-800 px-4 sm:px-8 py-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <label className="text-zinc-400 text-sm">Season:</label>
              <select
                value={season}
                onChange={(e) => {
                  setSeason(Number(e.target.value))
                  setEpisode(1)
                }}
                className="bg-zinc-800 text-white text-sm border border-zinc-700 rounded px-2 py-1 outline-none focus:border-[#E50914]"
              >
                {Array.from({ length: numSeasons }, (_, i) => i + 1).map((s) => (
                  <option key={s} value={s}>
                    Season {s}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-2">
              <label className="text-zinc-400 text-sm">Episode:</label>
              <select
                value={episode}
                onChange={(e) => setEpisode(Number(e.target.value))}
                className="bg-zinc-800 text-white text-sm border border-zinc-700 rounded px-2 py-1 outline-none focus:border-[#E50914]"
              >
                {Array.from({ length: 20 }, (_, i) => i + 1).map((ep) => (
                  <option key={ep} value={ep}>
                    Episode {ep}
                  </option>
                ))}
              </select>
            </div>
            <button
              onClick={() => setEpisode((prev) => prev + 1)}
              className="flex items-center gap-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white text-sm px-3 py-1.5 rounded border border-zinc-700 transition-colors"
            >
              <SkipForward className="w-3.5 h-3.5" />
              Next Episode
            </button>
          </div>
        </div>
      )}

      {/* Movie Info below player */}
      {!isCinema && details && (
        <div className="px-4 sm:px-8 lg:px-16 py-8 border-t border-zinc-800">
          <div className="flex gap-6 max-w-4xl">
            {posterPath && (
              <div className="flex-shrink-0 hidden sm:block">
                <img
                  src={getImageUrl(posterPath, 'w185')}
                  alt={title}
                  className="w-28 rounded-md object-cover shadow-lg"
                  loading="lazy"
                />
              </div>
            )}
            <div>
              <h2 className="text-xl font-bold text-white mb-1">{title}</h2>
              <div className="flex items-center gap-3 text-sm text-zinc-400 mb-3 flex-wrap">
                <div className="flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
                  <span className="text-white">{rating}</span>
                </div>
                {year && <span>{year}</span>}
                {details.genres?.map((g) => (
                  <span
                    key={g.id}
                    className="bg-zinc-800 border border-zinc-700 px-2 py-0.5 rounded-full text-xs"
                  >
                    {g.name}
                  </span>
                ))}
              </div>
              <p className="text-zinc-400 text-sm leading-relaxed line-clamp-3">
                {details.overview}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Progress indicator */}
      {!isCinema && savedProgress && savedProgress.duration > 0 && (
        <div className="px-4 sm:px-8 lg:px-16 pb-8">
          <div className="flex items-center gap-3 text-xs text-zinc-500 mb-1.5">
            <Clock className="w-3.5 h-3.5" />
            <span>
              Progress:{' '}
              {Math.round((savedProgress.currentTime / savedProgress.duration) * 100)}% watched
            </span>
          </div>
          <div className="h-1 bg-zinc-800 rounded-full max-w-md">
            <div
              className="h-full bg-[#E50914] rounded-full transition-all"
              style={{
                width: `${Math.min((savedProgress.currentTime / savedProgress.duration) * 100, 100)}%`,
              }}
            />
          </div>
        </div>
      )}
    </div>
  )
}
