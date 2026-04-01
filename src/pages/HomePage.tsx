import React from 'react'
import { Link } from '@tanstack/react-router'
import { Play, Clock } from 'lucide-react'
import { HeroBanner } from '../components/HeroBanner'
import { MovieRow } from '../components/MovieRow'
import { GenreRow } from '../components/GenreRow'
import {
  useTrending,
  usePopularMovies,
  usePopularTV,
  useTopRatedMovies,
  useNowPlaying,
  useUpcomingMovies,
  useTVByGenre,
  useActionMovies,
  useComedyMovies,
  useHorrorMovies,
  useSciFiMovies,
  useThrillerMovies,
  useAnimationMovies,
  useTopRatedTV,
  useAiringTodayTV,
  useActionTV,
  useCrimeTV,
  useTrendingMovies,
  useTrendingTV,
  useTopAnime,
  useSeasonalAnime,
  useTrendingAnime,
} from '../hooks/useMovies'
import { getAllProgress } from '../hooks/useWatchProgress'
import { getImageUrl } from '../lib/tmdb'
import type { Movie } from '../lib/tmdb'
import type { AnimeEntry } from '../lib/api'

// ─── Continue Watching ────────────────────────────────────────────────────────
const ContinueWatching: React.FC = () => {
  const progressItems = getAllProgress().slice(0, 10)
  if (progressItems.length === 0) return null

  return (
    <div className="mb-8">
      <div className="flex items-center gap-2 mb-3 px-4 sm:px-8 lg:px-16">
        <Clock className="w-4 h-4 text-[#E50914]" />
        <h2 className="text-lg sm:text-xl font-semibold text-white">Continue Watching</h2>
      </div>
      <div className="flex gap-3 overflow-x-auto scrollbar-hide px-4 sm:px-8 lg:px-16 pb-2">
        {progressItems.map((item) => {
          const pct = item.duration > 0 ? Math.min((item.currentTime / item.duration) * 100, 100) : 0
          return (
            <Link
              key={item.id}
              to="/watch/$mediaType/$id"
              params={{ mediaType: item.mediaType, id: String(item.id) }}
              className="flex-shrink-0 w-[200px] sm:w-[240px] group"
            >
              <div className="relative aspect-video rounded-lg overflow-hidden bg-zinc-800 mb-2">
                {item.posterPath && (
                  <img
                    src={getImageUrl(item.posterPath, 'w342')}
                    alt={item.title}
                    loading="lazy"
                    className="w-full h-full object-cover"
                  />
                )}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-lg">
                    <Play className="w-4 h-4 text-black fill-black ml-0.5" />
                  </div>
                </div>
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-zinc-700">
                  <div className="h-full bg-[#E50914] transition-all" style={{ width: `${pct}%` }} />
                </div>
              </div>
              <p className="text-sm text-zinc-300 line-clamp-1 group-hover:text-white transition-colors">
                {item.title}
              </p>
              <p className="text-xs text-zinc-500">{Math.round(pct)}% watched</p>
            </Link>
          )
        })}
      </div>
    </div>
  )
}

// ─── Section Divider ─────────────────────────────────────────────────────────
const SectionLabel: React.FC<{ label: string; color?: string }> = ({ label, color = '#E50914' }) => (
  <div className="flex items-center gap-3 px-4 sm:px-8 lg:px-16 pt-6 pb-1">
    <div className="w-1 h-5 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
    <span className="text-zinc-500 text-[11px] uppercase tracking-widest font-bold">{label}</span>
    <div className="flex-1 h-px bg-zinc-800/60" />
  </div>
)

// ─── HomePage ─────────────────────────────────────────────────────────────────
export const HomePage: React.FC = () => {
  const { data: trending = [], isLoading: trendingLoading } = useTrending('all', 'week')
  const { data: popularMovies = [], isLoading: popularMoviesLoading } = usePopularMovies()
  const { data: popularTV = [], isLoading: popularTVLoading } = usePopularTV()
  const { data: topRated = [], isLoading: topRatedLoading } = useTopRatedMovies()
  const { data: nowPlaying = [], isLoading: nowPlayingLoading } = useNowPlaying()
  const { data: upcoming = [] } = useUpcomingMovies()

  // Movies by genre
  const { data: actionMovies = [] } = useActionMovies()
  const { data: comedyMovies = [] } = useComedyMovies()
  const { data: horrorMovies = [] } = useHorrorMovies()
  const { data: sciFiMovies = [] } = useSciFiMovies()
  const { data: thrillerMovies = [] } = useThrillerMovies()
  const { data: animationMovies = [] } = useAnimationMovies()

  // TV Shows
  const { data: topRatedTV = [] } = useTopRatedTV()
  const { data: airingTodayTV = [] } = useAiringTodayTV()
  const { data: actionTV = [] } = useActionTV()
  const { data: crimeTV = [] } = useCrimeTV()
  const { data: dramaTV = [] } = useTVByGenre(18)
  const { data: mysteryTV = [] } = useTVByGenre(9648)
  const { data: animationTV = [] } = useTVByGenre(16)

  // Trending by type
  const { data: trendingMovies = [] } = useTrendingMovies()
  const { data: trendingTV = [] } = useTrendingTV()

  // Anime (Jikan)
  const { data: topAnime = [], isLoading: animeLoading } = useTopAnime()
  const { data: seasonalAnime = [] } = useSeasonalAnime()
  const { data: trendingAnime = [] } = useTrendingAnime()

  return (
    <main className="min-h-screen bg-[#141414]">
      {/* Hero */}
      <HeroBanner
        movies={trending.filter((m) => m.backdrop_path)}
        isLoading={trendingLoading}
      />

      {/* Main content — negative margin overlaps hero bottom gradient */}
      <div className="relative z-10 -mt-16 pb-16">
        <ContinueWatching />

        {/* ── TRENDING ── */}
        <SectionLabel label="Trending" />
        <MovieRow title="Trending This Week" movies={trending} isLoading={trendingLoading} subtitle="All" />
        <MovieRow title="Trending Movies Today" movies={trendingMovies} subtitle="Movies" />
        <MovieRow title="Trending TV Today" movies={trendingTV} subtitle="TV" />

        {/* ── MOVIES ── */}
        <SectionLabel label="Movies" />
        <MovieRow title="Now Playing" movies={nowPlaying} isLoading={nowPlayingLoading} />
        <MovieRow title="Popular Movies" movies={popularMovies} isLoading={popularMoviesLoading} />
        <MovieRow title="Top Rated Movies" movies={topRated} isLoading={topRatedLoading} subtitle="All Time" />
        <MovieRow title="Coming Soon" movies={upcoming} subtitle="Upcoming" />
        <MovieRow title="Action & Adventure" movies={actionMovies} />
        <MovieRow title="Comedy" movies={comedyMovies} />
        <MovieRow title="Sci-Fi & Fantasy" movies={sciFiMovies} />
        <MovieRow title="Thrillers" movies={thrillerMovies} />
        <MovieRow title="Horror" movies={horrorMovies} />
        <MovieRow title="Animation Films" movies={animationMovies} />

        {/* ── TV SHOWS ── */}
        <SectionLabel label="TV Shows" />
        <MovieRow title="Popular TV Shows" movies={popularTV} isLoading={popularTVLoading} />
        <MovieRow title="Top Rated Series" movies={topRatedTV} subtitle="All Time" />
        <MovieRow title="Airing Today" movies={airingTodayTV} />
        <MovieRow title="Drama Series" movies={dramaTV} />
        <MovieRow title="Action & Adventure Shows" movies={actionTV} />
        <MovieRow title="Crime & Thriller" movies={crimeTV} />
        <MovieRow title="Mystery" movies={mysteryTV} />
        <MovieRow title="Animation Series" movies={animationTV} />

        {/* ── ANIME ── */}
        <SectionLabel label="Anime" color="#7c3aed" />
        <MovieRow
          title="Top Anime"
          movies={topAnime as unknown as Movie[]}
          isLoading={animeLoading}
          subtitle="All Time"
        />
        <MovieRow
          title="Trending Anime"
          movies={trendingAnime as unknown as Movie[]}
          subtitle="Airing"
        />
        <MovieRow
          title="This Season"
          movies={seasonalAnime as unknown as Movie[]}
          subtitle="Seasonal"
        />

        {/* ── BROWSE BY GENRE ── */}
        <SectionLabel label="Browse by Genre" />
        <GenreRow />
      </div>

      {/* Footer */}
      <footer className="py-10 px-4 sm:px-8 lg:px-16 border-t border-zinc-800/60">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <span
            className="text-[#E50914] font-black text-xl"
            style={{ fontFamily: "'Bebas Neue', sans-serif", letterSpacing: '0.05em' }}
          >
            ZYFLIXA
          </span>
          <p className="text-zinc-600 text-xs text-center">
            Movie/TV data by TMDB · Anime data by Jikan (MyAnimeList)
          </p>
          <span className="text-zinc-600 text-xs">© 2025 Zyflixa</span>
        </div>
      </footer>
    </main>
  )
}
