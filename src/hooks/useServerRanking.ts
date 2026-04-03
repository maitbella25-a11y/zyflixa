/**
 * useServerRanking
 *
 * Tracks which embed servers work and which don't — per media type (movie/tv).
 * Stores results in localStorage so rankings persist across sessions.
 *
 * Score system:
 *   +2  on success (iframe loaded within timeout)
 *   -1  on failure (timeout / error)
 *   Score is capped between -10 and +20
 *   Servers with score < -3 are sorted to the end automatically
 */

const STORAGE_KEY = 'zyflixa_server_scores_v1'
const MIN_SCORE = -10
const MAX_SCORE = 20

interface ServerScores {
  [serverId: string]: number
}

// ── Read / Write ──────────────────────────────────────────────────────────────

const readScores = (): ServerScores => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

const writeScores = (scores: ServerScores) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(scores))
  } catch {}
}

// ── Public API ────────────────────────────────────────────────────────────────

/** Record a successful load for a server */
export const recordSuccess = (serverId: string) => {
  const scores = readScores()
  scores[serverId] = Math.min((scores[serverId] ?? 0) + 2, MAX_SCORE)
  writeScores(scores)
}

/** Record a failed load for a server */
export const recordFailure = (serverId: string) => {
  const scores = readScores()
  scores[serverId] = Math.max((scores[serverId] ?? 0) - 1, MIN_SCORE)
  writeScores(scores)
}

/** Get the score for a server (default 0) */
export const getScore = (serverId: string): number => {
  return readScores()[serverId] ?? 0
}

/**
 * Sort a list of server IDs by score — best first.
 * Servers with equal scores keep their original order.
 */
export const rankServers = <T extends { id: string }>(servers: T[]): T[] => {
  const scores = readScores()
  return [...servers].sort((a, b) => {
    const sa = scores[a.id] ?? 0
    const sb = scores[b.id] ?? 0
    return sb - sa // descending
  })
}

/** Reset all scores (useful for a "reset servers" button) */
export const resetScores = () => {
  try { localStorage.removeItem(STORAGE_KEY) } catch {}
}
