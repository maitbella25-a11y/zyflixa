# Architecture Guide

## Overview

Zyflixa is built with a modern, scalable architecture designed for performance, maintainability, and testing.

## Project Structure

```
src/
├── components/     # Reusable UI components
├── contexts/       # React Context providers
├── hooks/          # Custom React hooks
├── lib/            # Utilities, APIs, validation
├── pages/          # Page-level components (routes)
├── types/          # TypeScript type definitions
├── App.tsx         # Root component
└── main.tsx        # Entry point
```

## Data Flow

```
┌─────────────────────────────────────────────────┐
│            External APIs (TMDB, Jikan)         │
└────────────────────┬────────────────────────────┘
                     │
                     ▼
         ┌──────────────────────────┐
         │   React Query (Cache)    │
         │  - Caching Layer         │
         │  - Request Deduplication │
         │  - Automatic Refetch     │
         └────────────┬─────────────┘
                      │
      ┌───────────────┼───────────────┐
      ▼               ▼               ▼
┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│  Contexts    │ │    Hooks     │ │   Selectors  │
│ (Watchlist)  │ │  (useMovies) │ │   (Derived)  │
└────────┬─────┘ └──────┬───────┘ └──────┬───────┘
         │               │               │
         └───────────────┼───────────────┘
                         │
                         ▼
            ┌────────────────────────┐
            │     Components (UI)    │
            │  - Pages               │
            │  - Cards               │
            │  - Modals              │
            └────────────────────────┘
```

## Key Layers

### 1. API Layer (`src/lib/`)

**Files:**
- `api.ts` - TMDB API functions
- `tmdb.ts` - Types and configuration
- `validation.ts` - Input validation schemas

**Responsibilities:**
- Direct API communication
- Type-safe responses
- Error handling
- Input validation

```typescript
// Example: API call
const getMovies = async (page: number): Promise<Movie[]> => {
  const data = await fetcher<{ results: Movie[] }>('/movie/popular', { page: String(page) })
  return data.results ?? []
}
```

### 2. Hooks Layer (`src/hooks/`)

**Files:**
- `useMovies.ts` - Movie/TV data hooks
- `useWatchlist.ts` - Watchlist operations
- `useSEO.ts` - Meta tags management
- `useInView.ts` - Intersection Observer

**Responsibilities:**
- React Query integration
- Custom logic
- Component-level state
- Caching strategies

```typescript
// Example: Hook with caching
export const usePopularMovies = (page: number = 1) => {
  return useQuery({
    queryKey: ['movies', 'popular', page],
    queryFn: () => getPopularMovies(page),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000,    // 30 minutes
  })
}
```

### 3. Context Layer (`src/contexts/`)

**Files:**
- `WatchlistContext.tsx` - Watchlist state management

**Responsibilities:**
- Global state
- LocalStorage persistence
- Context providers

```typescript
// Usage
const App = () => (
  <WatchlistProvider>
    <RouterProvider router={router} />
  </WatchlistProvider>
)
```

### 4. Component Layer (`src/components/`)

**UI Components:**
- Reusable, isolated components
- Props-based configuration
- No side effects
- Full TypeScript types

```typescript
interface MovieCardProps {
  movie: Movie
  onWatchlist?: boolean
}

export const MovieCard: React.FC<MovieCardProps> = ({ movie, onWatchlist }) => {
  // Render component
}
```

### 5. Page Layer (`src/pages/`)

**Route Components:**
- Page-level logic
- Route-specific state
- SEO management
- Layout composition

```typescript
export const HomePage: React.FC = () => {
  const { data: trending } = useTrendingMovies()
  
  useSEO({
    title: 'Zyflixa - Watch Movies & Anime',
    description: 'Stream latest movies, TV shows and anime'
  })

  return <div>{/* Page content */}</div>
}
```

## State Management Strategy

### Global State (Watchlist)
```
WatchlistContext
├── State: WatchlistItem[]
├── Functions: add, remove, toggle, clear
└── Persistence: localStorage
```

### Server State (Movies, TV, Anime)
```
React Query
├── Cache: Automatic caching
├── Stale-While-Revalidate: Smart invalidation
└── Deduplication: Request merging
```

### Component State (UI)
```
useState, useReducer
├── Modals open/close
├── Filter selections
└── Form inputs
```

## Type Safety

### TypeScript Strict Mode
```json
{
  "strict": true,
  "noImplicitAny": true,
  "strictNullChecks": true,
  "noUnusedLocals": true,
  "noUnusedParameters": true,
  "strictBindCallApply": true
}
```

### Validation with Zod
```typescript
const SearchQuerySchema = z.object({
  q: z.string().min(1).max(256)
})

const validationResult = SearchQuerySchema.safeParse(input)
if (validationResult.success) {
  // Use validationResult.data
}
```

## Error Handling

### Three Levels

1. **Component Level**
```typescript
<ErrorBoundary>
  <Component />
</ErrorBoundary>
```

2. **Hook Level**
```typescript
const { data, isError, error } = useQuery({ /* ... */ })

if (isError) {
  return <ErrorUI error={error} />
}
```

3. **Global Level**
```typescript
Sentry.captureException(error)
```

## Caching Strategy

### React Query Cache
```
Query Cache
├── Status: 'loading' | 'success' | 'error'
├── Stale Time: Data freshness threshold
├── GC Time: Cache expiration time
└── Auto-refetch: On window focus, network recovery
```

### Example Configuration
```typescript
{
  staleTime: 5 * 60 * 1000,        // 5 minutes fresh
  gcTime: 30 * 60 * 1000,          // 30 minutes in cache
  refetchOnWindowFocus: false,     // Manual control
  retry: 2,                        // Retry failed requests
}
```

## Performance Optimizations

### 1. Code Splitting
```typescript
const AnimeWatchPage = lazy(() => 
  import('../pages/AnimeWatchPage')
)
```

### 2. Component Memoization
```typescript
export const MovieCard = memo(function MovieCard(props) {
  return <div>{/* content */}</div>
})
```

### 3. Callback Memoization
```typescript
const handleSearch = useCallback((query) => {
  // search logic
}, [dependencies])
```

### 4. Lazy Loading
```typescript
const MyComponent: React.FC = () => {
  const { ref, inView } = useInView()
  
  useEffect(() => {
    if (inView) {
      // Load data
    }
  }, [inView])
}
```

## Testing Architecture

### Unit Tests
```
src/__tests__/
├── validation.test.ts     # Schema tests
├── utils.test.ts          # Utility tests
└── ErrorBoundary.test.tsx # Component tests
```

### E2E Tests
```
e2e/
└── app.spec.ts            # User workflows
```

### Coverage Targets
- Critical paths: 90%+
- Components: 80%+
- Utilities: 95%+
- Total: 85%+

## Environment Configuration

### Environment Variables
```bash
# Production APIs
VITE_TMDB_API_KEY          # TMDB API key
VITE_SENTRY_DSN            # Error tracking

# Feature Flags
VITE_ENABLE_ADS            # Ad system
VITE_ENABLE_AUTH           # Authentication
```

### Build Modes
```bash
npm run dev                # Development
npm run build              # Production
npm run preview            # Preview build
```

## Security Considerations

1. **Input Validation** - All user inputs validated with Zod
2. **Error Handling** - No sensitive data in errors
3. **API Keys** - Environment-based, never committed
4. **HTTPS** - All external calls secure
5. **Headers** - CSP, X-Frame-Options configured

## Scalability

### For Features
- Add new pages in `src/pages/`
- Add new hooks in `src/hooks/`
- Add new components in `src/components/`

### For Data
- Configure React Query cache
- Implement pagination/infinite scroll
- Use server-side filtering

### For Performance
- Profile with DevTools
- Monitor with Sentry
- Optimize images
- Split code by route

## Debugging

### Development Tools
```bash
# React DevTools
# - Component inspection
# - Props/State debugging

# React Query DevTools
# - Cache inspection
# - Query management

# Sentry
# - Error tracking
# - Session replay
```

### Console Commands
```typescript
// Check cache
window.__REACT_QUERY_DEVTOOLS__

// Manual error
throw new Error('Test error')
```

## Future Enhancements

- [ ] GraphQL for API
- [ ] Suspense for streaming
- [ ] Web Workers for heavy operations
- [ ] Micro-frontends architecture
- [ ] Real-time updates with WebSockets
