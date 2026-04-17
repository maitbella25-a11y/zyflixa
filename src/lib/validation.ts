import { z } from 'zod'

// Search validation
export const SearchQuerySchema = z.object({
  q: z.string().min(1, 'Search query cannot be empty').max(256, 'Search query is too long').trim(),
})

export type SearchQuery = z.infer<typeof SearchQuerySchema>

// Movie/TV ID validation
export const MediaIdSchema = z.coerce.number().int().positive('Invalid media ID')

// Media type validation
export const MediaTypeSchema = z.enum(['movie', 'tv', 'anime'])

export type MediaType = z.infer<typeof MediaTypeSchema>

// Watchlist item validation
export const WatchlistItemSchema = z.object({
  id: z.number().int().positive(),
  title: z.string().min(1).max(256),
  posterPath: z.string().nullable(),
  mediaType: MediaTypeSchema,
  voteAverage: z.number().min(0).max(10),
  addedAt: z.number().int().positive(),
})

export type WatchlistItemType = z.infer<typeof WatchlistItemSchema>

// Page number validation
export const PageNumberSchema = z.coerce.number().int().positive().default(1)

// Genre ID validation
export const GenreIdSchema = z.coerce.number().int().positive()

// Safe parsers with error handling
export const safeParseSearchQuery = (value: unknown) => {
  try {
    return SearchQuerySchema.safeParse(value)
  } catch {
    return { success: false, error: new Error('Invalid search query') }
  }
}

export const safeParseMediaId = (value: unknown) => {
  try {
    return MediaIdSchema.safeParse(value)
  } catch {
    return { success: false, error: new Error('Invalid media ID') }
  }
}

export const safeParseMediaType = (value: unknown) => {
  try {
    return MediaTypeSchema.safeParse(value)
  } catch {
    return { success: false, error: new Error('Invalid media type') }
  }
}

export const safeParseWatchlistItem = (value: unknown) => {
  try {
    return WatchlistItemSchema.safeParse(value)
  } catch {
    return { success: false, error: new Error('Invalid watchlist item') }
  }
}
