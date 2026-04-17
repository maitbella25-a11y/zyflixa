# API Documentation

## Overview

Zyflixa integrates with two main APIs:

1. **TMDB (The Movie Database)** - Movies & TV Shows
2. **Jikan** - Anime data

## TMDB API

### Configuration

**Base URL**: `https://api.themoviedb.org/3`

**API Key**: Required in `.env.local`
```env
VITE_TMDB_API_KEY=your_api_key
```

### Authentication

All requests require the API key as a query parameter:
```
?api_key=YOUR_API_KEY
```

### Endpoints Used

#### Movies
```typescript
GET /trending/movie/week          // Trending movies
GET /movie/popular                 // Popular movies
GET /movie/top_rated               // Top rated movies
GET /movie/now_playing             // Now playing movies
GET /movie/upcoming                // Upcoming movies
GET /movie/{id}                    // Movie details
GET /genre/movie/list              // Movie genres
GET /discover/movie                // Browse movies
GET /search/multi                  // Search content
```

#### TV Shows
```typescript
GET /trending/tv/week              // Trending TV
GET /tv/popular                    // Popular TV shows
GET /tv/{id}                       // TV details
GET /genre/tv/list                 // TV genres
GET /discover/tv                   // Browse TV
```

### Response Format

#### Movie Object
```typescript
{
  id: number
  title: string
  overview: string
  poster_path: string | null
  backdrop_path: string | null
  vote_average: number
  vote_count: number
  release_date: string
  genre_ids: number[]
  popularity: number
  media_type: 'movie' | 'tv'
}
```

#### Movie Details
```typescript
{
  // Movie fields above +
  genres: Genre[]
  runtime: number
  status: string
  tagline: string
  videos: { results: Video[] }
  credits: { cast: Cast[] }
  similar: { results: Movie[] }
}
```

### Error Handling

```typescript
try {
  const data = await fetcher<Movie>(`/movie/${id}`)
  return data
} catch (error) {
  console.error('TMDB API error:', error)
  captureException(error)
  return null
}
```

### Rate Limiting

- **Free Tier**: 40 requests/10 seconds
- **Implement backoff** for rate limit errors

## Jikan API (MyAnimeList)

### Configuration

**Base URL**: `https://api.jikan.moe/v4`

**No Authentication Required**

### Endpoints Used

```typescript
GET /anime                         // Search anime
GET /anime/{id}                    // Anime details
GET /anime/{id}/full               // Full anime info
GET /top/anime                     // Top anime
GET /seasons/now                   // Current season
```

### Response Format

#### Anime Entry
```typescript
{
  mal_id: number
  title: string
  title_english?: string
  images: {
    jpg: {
      image_url: string
      large_image_url?: string
    }
  }
  synopsis?: string
  score?: number
  year?: number
  genres?: { name: string }[]
  type?: string
  episodes?: number
  status?: string
}
```

### Error Handling

```typescript
try {
  const data = await fetch('https://api.jikan.moe/v4/anime?query=...')
    .then(r => r.json())
  return data.data
} catch (error) {
  console.warn('Jikan API error:', error)
  return []
}
```

## Implementation Examples

### Using TMDB API

**Hook Pattern**:
```typescript
export const useMovieDetails = (id: number) => {
  return useQuery({
    queryKey: ['movie', id],
    queryFn: () => getMovieDetails(id),
    enabled: id > 0,
    staleTime: 30 * 60 * 1000,
  })
}
```

**API Function**:
```typescript
export const getMovieDetails = async (id: number): Promise<MovieDetails | null> => {
  try {
    return await fetcher<MovieDetails>(`/movie/${id}`, {
      append_to_response: 'videos,credits,similar',
    })
  } catch {
    return null
  }
}
```

### Using Jikan API

**Hook Pattern**:
```typescript
export const useAnimeSearch = (query: string) => {
  return useQuery({
    queryKey: ['anime-search', query],
    queryFn: () => searchAnime(query),
    enabled: query.length >= 1,
    staleTime: 5 * 60 * 1000,
  })
}
```

**API Function**:
```typescript
export const searchAnime = async (query: string): Promise<AnimeEntry[]> => {
  try {
    const res = await fetch(`https://api.jikan.moe/v4/anime?query=${query}`)
    const data = await res.json()
    return data.data || []
  } catch {
    return []
  }
}
```

## Validation

### Input Validation with Zod

```typescript
const MovieIdSchema = z.coerce.number().int().positive()
const SearchQuerySchema = z.object({
  q: z.string().min(1).max(256)
})

// Usage
const result = MovieIdSchema.safeParse(movieId)
if (result.success) {
  const id = result.data
  // Use ID safely
}
```

## Caching Strategy

### React Query Configuration

```typescript
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,      // 5 minutes
      gcTime: 30 * 60 * 1000,        // 30 minutes
      retry: 2,                      // Retry failed requests
      refetchOnWindowFocus: false,
    },
  },
})
```

### Cache Keys

```typescript
// Movies
['movies', 'trending', 'week']
['movie', movieId]
['movies', 'genre', genreId, page]

// TV
['tv', 'popular', page]
['tv', tvId]

// Anime
['anime-search', query]
['anime-detail', malId]
```

## Error Handling

### Global Error Handler

```typescript
// In main.tsx
initSentry()

// In components
try {
  const data = await apiCall()
} catch (error) {
  captureException(error, {
    component: 'ComponentName',
    context: { /* additional data */ }
  })
  return <ErrorUI />
}
```

## Rate Limits & Quotas

### TMDB
- 40 requests/10 seconds (free)
- Graceful degradation on limit

### Jikan
- No official limits
- ~60 requests/minute recommended
- Implement backoff for errors

## API Keys

### Getting API Keys

**TMDB**:
1. Go to [https://www.themoviedb.org/settings/api](https://www.themoviedb.org/settings/api)
2. Create an account
3. Request API access
4. Copy your API key

**Jikan**:
- No key needed
- Free public API

### Storing Keys

```bash
# .env.local (never commit)
VITE_TMDB_API_KEY=abc123xyz789

# .env.example (commit this)
VITE_TMDB_API_KEY=your_api_key_here
```

## Monitoring

### Sentry Integration

```typescript
captureException(error, {
  tags: {
    api: 'tmdb',
    endpoint: '/movie/popular',
    statusCode: 500,
  },
})
```

### Analytics

Track API usage:
```typescript
console.info('API Call', {
  endpoint: '/movie/popular',
  duration: 234,
  resultCount: 20,
})
```

## Testing

### Mocking APIs

```typescript
vi.mock('../lib/api', () => ({
  getPopularMovies: vi.fn().mockResolvedValue([
    { id: 1, title: 'Test Movie' }
  ])
}))
```

### Test Data

```typescript
const mockMovie: Movie = {
  id: 550,
  title: 'Fight Club',
  overview: 'An insomniac office worker...',
  poster_path: '/path/to/poster.jpg',
  vote_average: 8.8,
  // ... other fields
}
```

## Best Practices

1. **Always validate inputs** with Zod
2. **Handle errors gracefully** - show user-friendly messages
3. **Use React Query** for server state management
4. **Cache aggressively** - use staleTime and gcTime
5. **Implement retry logic** - handle transient failures
6. **Monitor errors** - use Sentry in production
7. **Respect rate limits** - implement backoff
8. **Log strategically** - include context for debugging

---

**For more help**: Check [DEPLOYMENT.md](DEPLOYMENT.md) or [ARCHITECTURE.md](ARCHITECTURE.md)
