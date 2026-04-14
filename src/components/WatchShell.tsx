import React, { useState, useRef, useEffect, useCallback } from 'react'
import { Link } from '@tanstack/react-router'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, Server, Monitor, RefreshCw, AlertTriangle } from 'lucide-react'
import { Spinner } from './ui/Spinner'

interface WatchShellProps {
  title: string
  subtitle: string
  backTo: { to: string; params: any }
  currentSource: { label: string }
  sourceIndex: number
  totalSources: number
  onNextSource: () => void
  onReload: () => void
  isLoading: boolean
  iframeKey: number
  embedUrl: string
  onIframeLoad: () => void
  loadError: boolean
  autoFallback: boolean
  topRightControls?: React.ReactNode
  overlayChildren?: React.ReactNode
  accentColor?: string
}

export const WatchShell: React.FC<WatchShellProps> = ({
  title,
  subtitle,
  backTo,
  currentSource,
  sourceIndex,
  totalSources,
  onNextSource,
  onReload,
  isLoading,
  iframeKey,
  embedUrl,
  onIframeLoad,
  loadError,
  autoFallback,
  topRightControls,
  overlayChildren,
  accentColor = '#E50914',
}) => {
  const [showOverlay, setShowOverlay] = useState(true)
  const [iframeLoaded, setIframeLoaded] = useState(false)
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const handleMouseMove = useCallback(() => {
    setShowOverlay(true)
    if (hideTimer.current) clearTimeout(hideTimer.current)
    hideTimer.current = setTimeout(() => setShowOverlay(false), 3000)
  }, [])

  const handleContainerClick = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      setShowOverlay((v) => !v)
    }
  }, [])

  useEffect(() => {
    return () => { if (hideTimer.current) clearTimeout(hideTimer.current) }
  }, [])

  useEffect(() => {
    setIframeLoaded(false)
  }, [iframeKey])

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
      {/* Loading overlay */}
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
          onIframeLoad()
        }}
      />

      {/* Error banner */}
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
              <p className="text-zinc-400 text-xs mt-0.5">Try another server below</p>
            </div>
            <button
              onClick={onNextSource}
              className="flex-shrink-0 text-white text-xs font-semibold px-3 py-1.5 rounded-lg hover:opacity-80 transition-colors"
              style={{ backgroundColor: accentColor }}
            >
              Next Server
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Overlay controls */}
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
              <Link
                {...backTo}
                className="flex items-center justify-center w-9 h-9 rounded-full bg-black/40 hover:bg-black/70 text-white transition-colors backdrop-blur-sm flex-shrink-0"
              >
                <ChevronLeft className="w-5 h-5" />
              </Link>

              <div className="flex-1 min-w-0">
                <p className="text-white font-semibold text-sm sm:text-base truncate drop-shadow">{title}</p>
                <p className="text-white/60 text-xs">{subtitle}</p>
              </div>

              {topRightControls}

              {/* Server picker wrapper button */}
              <div className="relative flex-shrink-0">
                {overlayChildren}
              </div>

              <div className="relative flex-shrink-0">
                 <button
                  className="flex items-center gap-1.5 text-xs text-white/80 hover:text-white bg-black/40 hover:bg-black/70 backdrop-blur-sm border border-white/15 px-3 py-1.5 rounded-full transition-all"
                >
                  <Server className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">{currentSource.label}</span>
                  <span className="text-[10px] text-zinc-400">({sourceIndex + 1}/{totalSources})</span>
                </button>
              </div>

              <button
                onClick={onReload}
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
