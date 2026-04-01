import { useState, useEffect, useCallback } from 'react'

export interface WatchlistItem {
  id: number
  title: string
  posterPath: string | null
  mediaType: 'movie' | 'tv' | 'anime'
  voteAverage: number
  addedAt: number
}

const STORAGE_KEY = 'zyflixa_watchlist'

const loadWatchlist = (): WatchlistItem[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEY)
    return data ? JSON.parse(data) : []
  } catch {
    return []
  }
}

const saveWatchlist = (items: WatchlistItem[]) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  } catch {}
}

// Global state so all components stay in sync
let globalItems: WatchlistItem[] = loadWatchlist()
const listeners = new Set<() => void>()
const notify = () => listeners.forEach((fn) => fn())

export const useWatchlist = () => {
  const [, forceUpdate] = useState(0)

  useEffect(() => {
    const fn = () => forceUpdate((n) => n + 1)
    listeners.add(fn)
    return () => { listeners.delete(fn) }
  }, [])

  const isInWatchlist = useCallback(
    (id: number) => globalItems.some((i) => i.id === id),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [globalItems.length],
  )

  const addToWatchlist = useCallback((item: Omit<WatchlistItem, 'addedAt'>) => {
    if (globalItems.some((i) => i.id === item.id)) return
    globalItems = [{ ...item, addedAt: Date.now() }, ...globalItems]
    saveWatchlist(globalItems)
    notify()
  }, [])

  const removeFromWatchlist = useCallback((id: number) => {
    globalItems = globalItems.filter((i) => i.id !== id)
    saveWatchlist(globalItems)
    notify()
  }, [])

  const toggleWatchlist = useCallback(
    (item: Omit<WatchlistItem, 'addedAt'>) => {
      if (isInWatchlist(item.id)) removeFromWatchlist(item.id)
      else addToWatchlist(item)
    },
    [isInWatchlist, addToWatchlist, removeFromWatchlist],
  )

  const clearWatchlist = useCallback(() => {
    globalItems = []
    saveWatchlist([])
    notify()
  }, [])

  return {
    watchlist: globalItems,
    isInWatchlist,
    addToWatchlist,
    removeFromWatchlist,
    toggleWatchlist,
    clearWatchlist,
    count: globalItems.length,
  }
}
