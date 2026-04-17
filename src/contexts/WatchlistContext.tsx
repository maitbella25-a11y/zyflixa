import React, { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { WatchlistItemSchema } from '../lib/validation'

export interface WatchlistItem {
  id: number
  title: string
  posterPath: string | null
  mediaType: 'movie' | 'tv' | 'anime'
  voteAverage: number
  addedAt: number
}

interface WatchlistContextType {
  watchlist: WatchlistItem[]
  isInWatchlist: (id: number, mediaType: 'movie' | 'tv' | 'anime') => boolean
  addToWatchlist: (item: Omit<WatchlistItem, 'addedAt'>) => void
  removeFromWatchlist: (id: number, mediaType: 'movie' | 'tv' | 'anime') => void
  toggleWatchlist: (item: Omit<WatchlistItem, 'addedAt'>) => void
  clearWatchlist: () => void
  count: number
}

const WatchlistContext = createContext<WatchlistContextType | undefined>(undefined)

const STORAGE_KEY = 'zyflixa_watchlist'

// Helper to create a composite key from id + mediaType
const getWatchlistKey = (id: number, mediaType: 'movie' | 'tv' | 'anime'): string =>
  `${mediaType}:${id}`

const loadWatchlist = (): WatchlistItem[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEY)
    if (!data) return []
    const parsed = JSON.parse(data)
    if (!Array.isArray(parsed)) return []
    // Validate each item with Zod and discard invalid ones
    return parsed.filter((item) => {
      const result = WatchlistItemSchema.safeParse(item)
      return result.success
    })
  } catch {
    return []
  }
}

const saveWatchlist = (items: WatchlistItem[]): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  } catch {
    // Silently fail if storage is unavailable
  }
}

export const WatchlistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>(() => loadWatchlist())

  // Persist to localStorage whenever watchlist changes
  useEffect(() => {
    saveWatchlist(watchlist)
  }, [watchlist])

  const isInWatchlist = useCallback(
    (id: number, mediaType: 'movie' | 'tv' | 'anime'): boolean => {
      const key = getWatchlistKey(id, mediaType)
      return watchlist.some((item) => getWatchlistKey(item.id, item.mediaType) === key)
    },
    [watchlist],
  )

  const addToWatchlist = useCallback((item: Omit<WatchlistItem, 'addedAt'>): void => {
    setWatchlist((prev) => {
      const key = getWatchlistKey(item.id, item.mediaType)
      if (prev.some((i) => getWatchlistKey(i.id, i.mediaType) === key)) return prev
      return [{ ...item, addedAt: Date.now() }, ...prev]
    })
  }, [])

  const removeFromWatchlist = useCallback((id: number, mediaType: 'movie' | 'tv' | 'anime'): void => {
    const key = getWatchlistKey(id, mediaType)
    setWatchlist((prev) => prev.filter((item) => getWatchlistKey(item.id, item.mediaType) !== key))
  }, [])

  const toggleWatchlist = useCallback(
    (item: Omit<WatchlistItem, 'addedAt'>): void => {
      if (isInWatchlist(item.id, item.mediaType)) {
        removeFromWatchlist(item.id, item.mediaType)
      } else {
        addToWatchlist(item)
      }
    },
    [isInWatchlist, addToWatchlist, removeFromWatchlist],
  )

  const clearWatchlist = useCallback((): void => {
    setWatchlist([])
  }, [])

  const value: WatchlistContextType = {
    watchlist,
    isInWatchlist,
    addToWatchlist,
    removeFromWatchlist,
    toggleWatchlist,
    clearWatchlist,
    count: watchlist.length,
  }

  return (
    <WatchlistContext.Provider value={value}>
      {children}
    </WatchlistContext.Provider>
  )
}

export const useWatchlist = (): WatchlistContextType => {
  const context = useContext(WatchlistContext)
  if (!context) {
    throw new Error('useWatchlist must be used within WatchlistProvider')
  }
  return context
}
