import React, { createContext, useContext, useState, useCallback, useEffect } from 'react'

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
  isInWatchlist: (id: number) => boolean
  addToWatchlist: (item: Omit<WatchlistItem, 'addedAt'>) => void
  removeFromWatchlist: (id: number) => void
  toggleWatchlist: (item: Omit<WatchlistItem, 'addedAt'>) => void
  clearWatchlist: () => void
  count: number
}

const WatchlistContext = createContext<WatchlistContextType | undefined>(undefined)

const STORAGE_KEY = 'zyflixa_watchlist'

const loadWatchlist = (): WatchlistItem[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEY)
    return data ? JSON.parse(data) : []
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
    (id: number): boolean => watchlist.some((item) => item.id === id),
    [watchlist],
  )

  const addToWatchlist = useCallback((item: Omit<WatchlistItem, 'addedAt'>): void => {
    setWatchlist((prev) => {
      if (prev.some((i) => i.id === item.id)) return prev
      return [{ ...item, addedAt: Date.now() }, ...prev]
    })
  }, [])

  const removeFromWatchlist = useCallback((id: number): void => {
    setWatchlist((prev) => prev.filter((item) => item.id !== id))
  }, [])

  const toggleWatchlist = useCallback(
    (item: Omit<WatchlistItem, 'addedAt'>): void => {
      if (isInWatchlist(item.id)) {
        removeFromWatchlist(item.id)
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
