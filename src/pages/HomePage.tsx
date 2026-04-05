import React from 'react'
import { Link } from '@tanstack/react-router'
import { Play, Clock } from 'lucide-react'
import { HeroBanner } from '../components/HeroBanner'
import { MovieRow } from '../components/MovieRow'
import { LazyMovieRow } from '../components/LazyMovieRow'
import { GenreRow } from '../components/GenreRow'
import {
  useTrending, usePopularMovies, usePopularTV, useTopRatedMovies,
  useNowPlaying, useUpcomingMovies,
  useActionMovies, useHorrorMovies, useSciFiMovies, useThrillerMovies,
  useTopRatedTV, useAiringTodayTV, useDramaTV, useActionTV,
  useTrendingMovies, useTrendingTV,
  useTopAnime, useSeasonalAnime, useTrendingAnime,
} from '../hooks/useMovies'
import { getAllProgress } from '../hooks/useWatchProgress'
import { getImageUrl } from '../lib/tmdb'
import type { Movie } from '../lib/tmdb'
import type { AnimeEntry } from '../lib/api'
import { AdBanner300x250, AdNativeBanner } from '../components/AdBanner'

// ─── Continue Watching ────────────────────────────────────────────────────────
const ContinueWatching: React.FC = () => {
  const items = getAllProgress().slice(0, 10)
  if (!items.length) return null
  return (
    <div className="mb-8">
      <div className="flex items-center gap-2 mb-3 px-4 sm:px-8 lg:px-16">
        <Clock className="w-4 h-4 text-[#E50914]" />
        <h2 className="text-lg sm:text-xl font-semibold text-white">Continue Watching</h2>
      </div>
      <div className="flex gap-3 overflow-x-auto scrollbar-hide px-4 sm:px-8 lg:px-16 pb-2">
        {items.map((item) => {
          const pct = item.duration > 0 ? Math.min((item.currentTime / item.duration) * 100, 100) : 0
          return (
            <Link key={item.id} to="/watch/$mediaType/$id"
              params={{ mediaType: item.mediaType, id: String(item.id) }}
              className="flex-shrink-0 w-[200px] sm:w-[240px] group">
              <div className="relative aspect-video rounded-lg overflow-hidden bg-zinc-800 mb-2">
                {item.posterPath && (
                  <img src={getImageUrl(item.posterPath, 'w342')} alt={item.title}
                    loading="lazy" className="w-full h-full object-cover" />
                )}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-lg">
                    <Play className="w-4 h-4 text-black fill-black ml-0.5" />
                  </div>
                </div>
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-zinc-700">
                  <div className="h-full bg-[#E50914]" style={{ width: `${pct}%` }} />
                </div>
              </div>
              <p className="text-sm text-zinc-300 line-clamp-1 group-hover:text-white transition-colors">{item.title}</p>
              <p className="text-xs text-zinc-500">{Math.round(pct)}% watched</p>
            </Link>
          )
        })}
      </div>
    </div>
  )
}

// ─── Section Label ────────────────────────────────────────────────────────────
const SL: React.FC<{ label: string; color?: string }> = ({ label, color = '#E50914' }) => (
  <div className="flex items-center gap-3 px-4 sm:px-8 lg:px-16 pt-8 pb-1">
    <div className="w-1 h-5 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
    <span className="text-zinc-500 text-[11px] uppercase tracking-widest font-bold">{label}</span>
    <div className="flex-1 h-px bg-zinc-800/60" />
  </div>
)

const toMovie = (arr: AnimeEntry[]) => arr as unknown as Movie[]

// ─── HomePage ─────────────────────────────────────────────────────────────────
export const HomePage: React.FC = () => {
  // ── EAGER (above fold — load immediately) ──
  const { data: trending = [],      isLoading: trendingLoading }     = useTrending('all', 'week')
  const { data: popularMovies = [], isLoading: popularMoviesLoading } = usePopularMovies()
  const { data: popularTV = [],     isLoading: popularTVLoading }     = usePopularTV()
  const { data: nowPlaying = [],    isLoading: nowPlayingLoading }    = useNowPlaying()
  const { data: topAnime = [],      isLoading: animeLoading }         = useTopAnime()

  return (
    <main className="min-h-screen bg-[#141414]">
      <HeroBanner movies={trending.filter((m) => m.backdrop_path)} isLoading={trendingLoading} />
      <AdNativeBanner />

      <div className="relative z-10 -mt-16 pb-16">
        <ContinueWatching />
      <AdBanner300x250 />

        {/* ── TRENDING ── */}
        <SL label="🔥 Trending" />
        <MovieRow title="Trending This Week"    movies={trending}      isLoading={trendingLoading} subtitle="All" lazy={false} />
        <LazyMovieRow title="Trending Movies"   subtitle="Today"       useFetch={useTrendingMovies} />
        <LazyMovieRow title="Trending TV"       subtitle="Today"       useFetch={useTrendingTV} />

        {/* ── MOVIES ── */}
        <SL label="🎬 Movies" />
        <MovieRow title="Now Playing"     movies={nowPlaying}    isLoading={nowPlayingLoading}    lazy={false} />
        <MovieRow title="Popular Movies"  movies={popularMovies} isLoading={popularMoviesLoading} lazy={false} />
        <LazyMovieRow title="Top Rated"          subtitle="All Time"  useFetch={useTopRatedMovies} />
        <LazyMovieRow title="Coming Soon"        subtitle="Upcoming"  useFetch={useUpcomingMovies} />
        <LazyMovieRow title="Action"                                  useFetch={useActionMovies} />
        <LazyMovieRow title="Sci-Fi & Horror"                         useFetch={useSciFiMovies} />
        <LazyMovieRow title="Thrillers"                               useFetch={useThrillerMovies} />
        <LazyMovieRow title="Horror"                                  useFetch={useHorrorMovies} />

        {/* ── TV SHOWS ── */}
        <SL label="📺 TV Shows" />
        <MovieRow title="Popular TV Shows" movies={popularTV} isLoading={popularTVLoading} lazy={false} />
        <LazyMovieRow title="Top Rated Series"   subtitle="All Time" useFetch={useTopRatedTV} />
        <LazyMovieRow title="Airing Today"                           useFetch={useAiringTodayTV} />
        <LazyMovieRow title="Drama Series"                           useFetch={useDramaTV} />
        <LazyMovieRow title="Action & Adventure"                     useFetch={useActionTV} />

        {/* ── ANIME ── */}
        <SL label="🎌 Anime" color="#7c3aed" />
        <MovieRow title="Top Anime" movies={toMovie(topAnime)} isLoading={animeLoading} subtitle="All Time" lazy={false} />
        <LazyMovieRow title="Trending Anime"  subtitle="Airing"   useFetch={(e) => { const r = useTrendingAnime(e); return { data: toMovie(r.data ?? []), isLoading: r.isLoading } }} />
        <LazyMovieRow title="This Season"     subtitle="Seasonal" useFetch={(e) => { const r = useSeasonalAnime(e); return { data: toMovie(r.data ?? []), isLoading: r.isLoading } }} />

        {/* ── BROWSE BY GENRE ── */}
        <SL label="🎭 Browse by Genre" />
        <GenreRow />
      </div>

      {/* Footer */}
      <footer className="py-10 px-4 sm:px-8 lg:px-16 border-t border-zinc-800/60">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="text-[#E50914] font-black text-xl"
            style={{ fontFamily: "'Bebas Neue', sans-serif", letterSpacing: '0.05em' }}>
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
