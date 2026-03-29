// ─── Types ───────────────────────────────────────────────────────────────────

export interface WatchProgress {
  currentTime: number
  duration: number
  updatedAt: number
  title: string
  posterPath: string | null
  mediaType: 'movie' | 'tv'
  id: number
  season?: number
  episode?: number
}

// ─── Key Helpers ─────────────────────────────────────────────────────────────

export const getProgressKey = (mediaType: 'movie' | 'tv', id: number): string =>
  `cinestream_progress_${mediaType}_${id}`

// ─── Core Storage Functions ──────────────────────────────────────────────────

export const getProgress = (key: string): WatchProgress | null => {
  try {
    const data = localStorage.getItem(key)
    return data ? (JSON.parse(data) as WatchProgress) : null
  } catch {
    return null
  }
}

export const saveProgress = (key: string, progress: Partial<WatchProgress>): void => {
  try {
    const existing = getProgress(key) ?? {}
    localStorage.setItem(key, JSON.stringify({ ...existing, ...progress, updatedAt: Date.now() }))
  } catch {
    // Silently ignore storage errors (e.g. private browsing quota exceeded)
  }
}

export const clearProgress = (key: string): void => {
  try {
    localStorage.removeItem(key)
  } catch {
    // Silently ignore
  }
}

export const getAllProgress = (): WatchProgress[] => {
  try {
    const items: WatchProgress[] = []
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key?.startsWith('cinestream_progress_')) {
        const data = getProgress(key)
        if (data) items.push(data)
      }
    }
    // Most recently watched first
    return items.sort((a, b) => b.updatedAt - a.updatedAt)
  } catch {
    return []
  }
}

export const clearAllProgress = (): void => {
  try {
    const keysToRemove: string[] = []
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key?.startsWith('cinestream_progress_')) {
        keysToRemove.push(key)
      }
    }
    keysToRemove.forEach((key) => localStorage.removeItem(key))
  } catch {
    // Silently ignore
  }
}

// ─── Progress Percentage Helper ───────────────────────────────────────────────

export const getProgressPercent = (progress: WatchProgress | null): number => {
  if (!progress || !progress.duration || progress.duration === 0) return 0
  return Math.min(100, Math.round((progress.currentTime / progress.duration) * 100))
}

// ─── React Hook ──────────────────────────────────────────────────────────────

export const useWatchProgress = (mediaType: 'movie' | 'tv', id: number) => {
  const key = getProgressKey(mediaType, id)
  const progress = getProgress(key)

  /**
   * Save current playback position.
   * @param currentTime  Seconds elapsed
   * @param duration     Total duration in seconds
   * @param extra        Optional extra fields (title, posterPath, season, episode, …)
   */
  const save = (
    currentTime: number,
    duration: number,
    extra?: Partial<Omit<WatchProgress, 'currentTime' | 'duration' | 'mediaType' | 'id' | 'updatedAt'>>,
  ): void => {
    saveProgress(key, { currentTime, duration, mediaType, id, ...extra })
  }

  const clear = (): void => clearProgress(key)

  const percent = getProgressPercent(progress)

  return { progress, save, clear, key, percent }
}
