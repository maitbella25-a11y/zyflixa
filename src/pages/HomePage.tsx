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
  useDocumentaryMovies,
  useTopRatedTV,
  useAiringTodayTV,
  useOnTheAirTV,
  useActionTV,
  useComedyTV,
  useCrimeTV,
  useDocumentaryTV,
  useTrendingMovies,
  useTrendingTV,
} from '../hooks/useMovies'
import { getAllProgress } from '../hooks/useWatchProgress'
import { getImageUrl } from '../lib/tmdb'

// Continue watching mini-row
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
          const pct =
            item.duration > 0
              ? Math.min((item.currentTime / item.duration) * 100, 100)
              : 0
          return (
            <Link
              key={item.id}
              to="/watch/$mediaType/$id"
              params={{ mediaType: item.mediaType, id: String(item.id) }}
              className="flex-shrink-0 w-[200px] sm:w-[240px] group"
            >
              <div className="relative aspect-video rounded-md overflow-hidden bg-zinc-800 mb-2">
                {item.posterPath && (
                  <img
                    src={getImageUrl(item.posterPath, 'w342')}
                    alt={item.title}
                    loading="lazy"
                    className="w-full h-full object-cover"
                  />
                )}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center">
                    <Play className="w-4 h-4 text-black fill-black ml-0.5" />
                  </div>
                </div>
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-zinc-700">
                  <div
                    className="h-full bg-[#E50914] transition-all"
                    style={{ width: `${pct}%` }}
                  />
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

// Section divider with label
const SectionLabel: React.FC<{ label: string }> = ({ label }) => (
  <div className="flex items-center gap-3 px-4 sm:px-8 lg:px-16 py-2 mb-1">
    <div className="w-1 h-5 bg-[#E50914] rounded-full" />
    <span className="text-zinc-500 text-xs uppercase tracking-widest font-semibold">{label}</span>
    <div className="flex-1 h-px bg-zinc-800" />
  </div>
)

export const HomePage: React.FC = () => {
  const { data: trending = [], isLoading: trendingLoading } = useTrending('all', 'week')
  const { data: popularMovies = [], isLoading: popularMoviesLoading } = usePopularMovies()
  const { data: popularTV = [], isLoading: popularTVLoading } = usePopularTV()
  const { data: topRated = [], isLoading: topRatedLoading } = useTopRatedMovies()
  const { data: nowPlaying = [], isLoading: nowPlayingLoading } = useNowPlaying()
  const { data: upcoming = [] } = useUpcomingMovies()

  // Genre-based movie rows
  const { data: actionMovies = [] } = useActionMovies()
  const { data: comedyMovies = [] } = useComedyMovies()
  const { data: horrorMovies = [] } = useHorrorMovies()
  const { data: sciFiMovies = [] } = useSciFiMovies()
  const { data: thrillerMovies = [] } = useThrillerMovies()
  const { data: animationMovies = [] } = useAnimationMovies()
  const { data: documentaryMovies = [] } = useDocumentaryMovies()

  // TV Show rows
  const { data: topRatedTV = [] } = useTopRatedTV()
  const { data: airingTodayTV = [] } = useAiringTodayTV()
  const { data: onTheAirTV = [] } = useOnTheAirTV()
  const { data: actionTV = [] } = useActionTV()
  const { data: comedyTV = [] } = useComedyTV()
  const { data: crimeTV = [] } = useCrimeTV()
  const { data: documentaryTV = [] } = useDocumentaryTV()
  const { data: dramaTV = [] } = useTVByGenre(18)
  const { data: animationTV = [] } = useTVByGenre(16)
  const { data: mysteryTV = [] } = useTVByGenre(9648)

  // Trending by type
  const { data: trendingMovies = [] } = useTrendingMovies()
  const { data: trendingTV = [] } = useTrendingTV()

  return (
    <main className="min-h-screen bg-[#141414]">
      {/* Hero */}
      <HeroBanner
        movies={trending.filter((m) => m.backdrop_path)}
        isLoading={trendingLoading}
      />

      {/* Content below hero */}
      <div className="relative z-10 -mt-16">
        <ContinueWatching />

        {/* ── TRENDING ── */}
        <SectionLabel label="Trending" />
        <MovieRow
          title="Trending This Week"
          movies={trending}
          isLoading={trendingLoading}
          subtitle="All"
        />
        <MovieRow
          title="Trending Movies Today"
          movies={trendingMovies}
          subtitle="Movies"
        />
        <MovieRow
          title="Trending TV Shows Today"
          movies={trendingTV}
          subtitle="TV"
        />

        {/* ── MOVIES ── */}
        <SectionLabel label="Movies" />
        <MovieRow
          title="Now Playing in Theaters"
          movies={nowPlaying}
          isLoading={nowPlayingLoading}
        />
        <MovieRow
          title="Popular Movies"
          movies={popularMovies}
          isLoading={popularMoviesLoading}
        />
        <MovieRow
          title="Top Rated Movies"
          movies={topRated}
          isLoading={topRatedLoading}
          subtitle="All Time"
        />
        <MovieRow title="Coming Soon" movies={upcoming} subtitle="Upcoming" />
        <MovieRow title="Action & Adventure" movies={actionMovies} />
        <MovieRow title="Comedy" movies={comedyMovies} />
        <MovieRow title="Sci-Fi & Fantasy" movies={sciFiMovies} />
        <MovieRow title="Thrillers" movies={thrillerMovies} />
        <MovieRow title="Horror" movies={horrorMovies} />
        <MovieRow title="Animation Films" movies={animationMovies} />
        <MovieRow title="Documentaries" movies={documentaryMovies} />

        {/* ── TV SHOWS ── */}
        <SectionLabel label="TV Shows" />
        <MovieRow
          title="Popular TV Shows"
          movies={popularTV}
          isLoading={popularTVLoading}
        />
        <MovieRow title="Top Rated Series" movies={topRatedTV} subtitle="All Time" />
        <MovieRow title="Airing Today" movies={airingTodayTV} subtitle="Live" />
        <MovieRow title="Currently On Air" movies={onTheAirTV} />
        <MovieRow title="Drama Series" movies={dramaTV} />
        <MovieRow title="Action & Adventure Shows" movies={actionTV} />
        <MovieRow title="Crime & Mystery" movies={crimeTV} />
        <MovieRow title="Comedy Shows" movies={comedyTV} />
        <MovieRow title="Mystery & Suspense" movies={mysteryTV} />
        <MovieRow title="Animation Series" movies={animationTV} />
        <MovieRow title="Documentary Series" movies={documentaryTV} />

        {/* ── BROWSE BY GENRE ── */}
        <SectionLabel label="Browse by Genre" />
        <GenreRow />
      </div>

      {/* Footer */}
      <footer className="py-12 px-4 sm:px-8 lg:px-16 mt-8 border-t border-zinc-800/60">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <span
            className="text-[#E50914] font-black text-xl"
            style={{ fontFamily: "'Bebas Neue', sans-serif", letterSpacing: '0.05em' }}
          >
            Zyflixa
          </span>
          <p className="text-zinc-600 text-xs text-center">
            Powered by Zyflixa.
          </p>
          <div className="flex gap-4 text-xs text-zinc-600">
            <span>© 2026 Zyflixa</span>
          </div>
        </div>
      </footer>
    </main>
  )
}
