import React from 'react'
import {
  createRouter,
  createRoute,
  createRootRoute,
  RouterProvider,
  Outlet,
} from '@tanstack/react-router'
import { Navbar } from './components/Navbar'
import { HomePage } from './pages/HomePage'
import { SearchPage } from './pages/SearchPage'
import { DetailsPage } from './pages/DetailsPage'
import { AnimeDetailsPage } from './pages/AnimeDetailsPage'
import { WatchPage } from './pages/WatchPage'
import { AnimeWatchPage } from './pages/AnimeWatchPage'
import { BrowsePage } from './pages/BrowsePage'
import { WatchlistPage } from './pages/WatchlistPage'
import { Link } from '@tanstack/react-router'

// ── Root WITH Navbar (all normal pages) ──────────────────────────────────────
const rootRoute = createRootRoute({
  component: () => (
    <div className="min-h-screen bg-[#141414]">
      <Navbar />
      <Outlet />
    </div>
  ),
  notFoundComponent: () => (
    <div className="min-h-screen bg-[#141414] flex flex-col items-center justify-center gap-6 pt-16">
      <div className="text-center">
        <div
          className="text-8xl font-black text-[#E50914] mb-4"
          style={{ fontFamily: "'Bebas Neue', sans-serif" }}
        >
          404
        </div>
        <h1 className="text-2xl font-bold text-white mb-2">Page Not Found</h1>
        <p className="text-zinc-400 mb-6">The page you're looking for doesn't exist.</p>
        <Link
          to="/"
          className="bg-white text-black font-bold px-6 py-3 rounded-md hover:bg-white/90 transition-all text-sm inline-block"
        >
          Go Home
        </Link>
      </div>
    </div>
  ),
})

const ProfilePage: React.FC = () => (
  <div className="min-h-screen bg-[#141414] pt-24 px-8 flex items-center justify-center">
    <div className="text-center">
      <div className="w-24 h-24 mx-auto rounded-full bg-[#E50914] flex items-center justify-center text-white text-3xl font-bold mb-4">
        Z
      </div>
      <h1 className="text-2xl font-bold text-white mb-2">Guest User</h1>
      <p className="text-zinc-400 mb-6">Browse and watch your favorite content</p>
      <div className="flex gap-4 justify-center">
        <Link to="/" className="text-[#E50914] hover:underline text-sm font-medium">
          ← Browse Content
        </Link>
        <Link to="/watchlist" className="text-zinc-400 hover:text-white hover:underline text-sm font-medium">
          My Watchlist
        </Link>
      </div>
    </div>
  </div>
)

const indexRoute     = createRoute({ getParentRoute: () => rootRoute, path: '/',                       component: HomePage })
const searchRoute    = createRoute({ getParentRoute: () => rootRoute, path: '/search',                 component: SearchPage })
const detailsRoute   = createRoute({ getParentRoute: () => rootRoute, path: '/details/$mediaType/$id', component: DetailsPage })
const animeRoute     = createRoute({ getParentRoute: () => rootRoute, path: '/anime/$id',              component: AnimeDetailsPage })
const browseRoute    = createRoute({ getParentRoute: () => rootRoute, path: '/browse/$category',       component: BrowsePage })
const watchlistRoute = createRoute({ getParentRoute: () => rootRoute, path: '/watchlist',              component: WatchlistPage })
const profileRoute   = createRoute({ getParentRoute: () => rootRoute, path: '/profile',               component: ProfilePage })

// ── Watch route — NO Navbar, full black screen ───────────────────────────────
const watchRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/watch/$mediaType/$id',
  component: WatchPage,
})

const animeWatchRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/watch/anime/$id',
  component: AnimeWatchPage,
})

const routeTree = rootRoute.addChildren([
  indexRoute,
  searchRoute,
  detailsRoute,
  animeRoute,
  watchRoute,
  animeWatchRoute,
  browseRoute,
  watchlistRoute,
  profileRoute,
])

const router = createRouter({ routeTree })

declare module '@tanstack/react-router' {
  interface Register { router: typeof router }
}

function App() {
  return <RouterProvider router={router} />
}

export default App
