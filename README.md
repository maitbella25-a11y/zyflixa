# 🎬 Zyflixa - Streaming Movies, TV Shows & Anime Platform

A modern, full-featured streaming platform for discovering and watching movies, TV shows, and anime with an amazing user experience.

![License](https://img.shields.io/badge/license-MIT-green)
![React](https://img.shields.io/badge/React-19+-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9+-blue)
![Vite](https://img.shields.io/badge/Vite-7.2+-purple)
![Tests](https://img.shields.io/badge/Tests-Vitest%20%26%20Playwright-brightgreen)

## ✨ Features

### 📺 Content
- 🎥 **Movies** - Latest and trending movies from TMDB
- 📺 **TV Shows** - Complete TV series collection  
- 🎌 **Anime** - Extensive anime library from MyAnimeList
- 🔍 **Search** - Fast, validated search across all content types
- 🏷️ **Browse** - Filter and browse by genres
- ⭐ **Trending** - Discover trending content daily/weekly

### 💾 User Features
- 📚 **Watchlist** - Save favorites for later (Context API + localStorage)
- ⏱️ **Continue Watching** - Resume from where you left off
- 🎬 **Multi-Server Support** - Automatic fallback between embed servers
- 🎤 **Server Ranking** - Smart server selection based on success rate

### 🚀 Technical Features
- ⚡ **Fast & Modern** - React 19, Vite 7.2, TanStack Router/Query
- 📱 **Responsive Design** - Mobile-first, works on all devices
- 🎨 **Beautiful UI** - Tailwind CSS with Framer Motion animations
- 🔒 **Type Safe** - Full TypeScript with strict mode (no `any`)
- ♿ **Accessible** - WCAG 2.1 AA compliant with ARIA labels
- 🌙 **Dark Mode** - Optimized for comfortable viewing
- 📊 **SEO Optimized** - Dynamic meta tags and JSON-LD schema
- 🚨 **Error Tracking** - Sentry integration + Error Boundaries
- ✅ **Fully Tested** - Unit tests, E2E tests, and 90%+ coverage

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | React 19, TypeScript, Tailwind CSS |
| **Build** | Vite 7.2 |
| **Routing** | TanStack Router |
| **State** | TanStack React Query, Context API |
| **Forms** | Zod (validation) |
| **Animations** | Framer Motion |
| **Testing** | Vitest, Playwright, React Testing Library |
| **Monitoring** | Sentry |
| **CI/CD** | GitHub Actions |
| **API** | TMDB, Jikan (MyAnimeList) |

## 📋 Prerequisites

- Node.js >= 18
- npm or yarn

## 🚀 Quick Start

### 1. Clone and Install

```bash
git clone https://github.com/yourusername/zyflixa.git
cd zyflixa
npm install
```

### 2. Setup Environment Variables

```bash
cp .env.example .env.local
```

Edit `.env.local` with your API keys:

```env
# Required
VITE_TMDB_API_KEY=your_tmdb_api_key_here
VITE_SENTRY_DSN=your_sentry_dsn

# Optional
VITE_ENABLE_ADS=true
```

**Get API Keys:**
- **TMDB**: [https://www.themoviedb.org/settings/api](https://www.themoviedb.org/settings/api) (Free)
- **Sentry**: [https://sentry.io/](https://sentry.io/) (Free tier available)

### 3. Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## 📖 Available Scripts

### Development & Building
```bash
npm run dev              # Start development server with HMR
npm run build            # Build for production (dist/)
npm run preview          # Preview production build locally
```

### Testing
```bash
npm run test             # Run unit tests once
npm run test:ui          # Run tests with interactive UI
npm run test:coverage    # Generate coverage report (90%+ target)
npm run test:e2e         # Run end-to-end tests
npm run test:e2e:ui      # Run E2E tests with interactive UI
```

### Code Quality
```bash
npm run lint             # Run all linters (types, JS, CSS)
npm run lint:types       # TypeScript type checking
npm run lint:js          # ESLint + auto-fix
npm run lint:css         # Stylelint + auto-fix
```

## 📁 Project Structure

```
zyflixa/
├── src/
│   ├── components/              # React components
│   │   ├── ui/                 # UI primitives
│   │   ├── Navbar.tsx          # Navigation with search
│   │   ├── MovieCard.tsx       # Movie/TV/Anime card
│   │   ├── ErrorBoundary.tsx   # Error handling
│   │   └── ...
│   ├── contexts/               # React Contexts
│   │   └── WatchlistContext.tsx # Watchlist management
│   ├── hooks/                  # Custom React hooks
│   │   ├── useMovies.ts        # TMDB API hooks
│   │   ├── useWatchlist.ts     # Watchlist operations
│   │   └── ...
│   ├── lib/                    # Utilities & helpers
│   │   ├── api.ts              # API client
│   │   ├── tmdb.ts             # TMDB configuration
│   │   ├── validation.ts       # Zod schemas (Input validation)
│   │   ├── sentry.ts           # Error tracking setup
│   │   └── utils.ts            # General utilities
│   ├── pages/                  # Page components (Route views)
│   │   ├── HomePage.tsx
│   │   ├── SearchPage.tsx      # With input validation
│   │   ├── WatchPage.tsx
│   │   └── ...
│   ├── __tests__/              # Unit tests
│   │   ├── setup.ts            # Test setup & mocks
│   │   ├── validation.test.ts
│   │   ├── utils.test.ts
│   │   └── ErrorBoundary.test.tsx
│   ├── App.tsx                 # App root (with providers)
│   ├── main.tsx                # Entry point
│   └── index.css               # Global styles
├── e2e/                        # End-to-end tests
│   └── app.spec.ts             # Playwright tests
├── .github/
│   └── workflows/
│       └── ci.yml              # GitHub Actions CI/CD
├── .husky/                     # Pre-commit hooks
│   └── pre-commit              # Lint before commit
├── vitest.config.ts            # Unit test config
├── playwright.config.ts        # E2E test config
├── tsconfig.json               # TypeScript config (strict mode)
├── vite.config.ts              # Vite config
├── .env.example                # Environment template
└── package.json                # Dependencies & scripts
```

## 🏗️ Architecture

### Component Hierarchy
```
App (Error Boundary)
├── WatchlistProvider (Context)
│   └── RouterProvider
│       ├── Layout (Navbar + Outlet)
│       ├── HomePage
│       ├── SearchPage (with validation)
│       ├── BrowsePage
│       ├── DetailsPage
│       ├── WatchPage
│       └── WatchlistPage
```

### Data Flow
```
TMDB API / Jikan API
    ↓
React Query (Caching Layer)
    ↓
Contexts & Hooks (State)
    ↓
Components (UI)
    ↓
Sentry (Error Tracking)
```

## 🧪 Testing

### Unit Tests
```bash
npm run test
```

Tests cover:
- Input validation (Zod schemas)
- Utility functions
- Component logic
- Error boundaries

### E2E Tests
```bash
npm run test:e2e
```

Tests cover:
- User workflows
- Navigation
- Search functionality
- Accessibility
- Performance (< 5s load time)

### Coverage
```bash
npm run test:coverage
```

Target: 90%+ coverage on critical paths

## 🚀 Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Connect repo to Vercel: [vercel.com/new](https://vercel.com/new)
3. Set environment variables
4. Deploy!

```bash
npm run build  # Creates dist/ folder
```

### Environment Variables
Set these in Vercel dashboard:
- `VITE_TMDB_API_KEY` - TMDB API key
- `VITE_SENTRY_DSN` - Sentry DSN for error tracking

### Docker

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "run", "preview"]
```

```bash
docker build -t zyflixa .
docker run -p 3000:3000 zyflixa
```

## 🔒 Security & Monitoring

### Input Validation
- Zod schemas for all user inputs
- Search query validation (max 256 chars)
- Media ID validation
- Type-safe API responses

### Error Tracking
- Sentry integration (production only)
- Automatic error reporting with context
- Session replay for debugging
- Error boundaries for graceful failures

### CORS & Headers
- API calls proxied safely
- Environment variables for secrets
- Service Worker caching

## ♿ Accessibility

✅ WCAG 2.1 AA Compliant
- ARIA labels on all interactive elements
- Keyboard navigation support
- Screen reader friendly
- High contrast dark mode
- Focus indicators on all buttons

## 📊 Performance

- **LCP**: < 2.5s (Largest Contentful Paint)
- **FID**: < 100ms (First Input Delay)
- **CLS**: < 0.1 (Cumulative Layout Shift)
- **Code Splitting**: By route
- **Image Optimization**: srcset, responsive loading
- **Caching**: Service Worker for images

## � Documentation

- [Architecture Guide](./docs/ARCHITECTURE.md) — System design & data flow
- [Deployment Guide](./docs/DEPLOYMENT.md) — Deploy to Vercel, Netlify, Docker
- [API Documentation](./docs/API.md) — TMDB & Jikan API reference
- [Contributing Guide](./CONTRIBUTING.md) — Code style & contribution workflow
- [Security Policy](./SECURITY.md) — Report vulnerabilities & best practices
- [Ads Removal](./docs/ADS_REMOVAL.md) — No ads, clean user experience ✨

## �🐛 Troubleshooting

### API Key Issues
```bash
# Verify key is in .env.local
cat .env.local | grep VITE_TMDB_API_KEY

# Test API key
curl "https://api.themoviedb.org/3/trending/all/week?api_key=YOUR_KEY"
```

### Port Already in Use
```bash
# macOS/Linux
lsof -ti:3000 | xargs kill -9

# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

### Tests Failing
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install

# Run tests with debug output
npm run test -- --reporter=verbose
```

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Commit: `git commit -m 'Add amazing feature'`
4. Push: `git push origin feature/amazing-feature`
5. Open Pull Request

### Before Submitting
```bash
npm run lint      # Check code quality
npm run test      # Run tests
npm run build     # Verify build succeeds
```

## 📜 License

MIT License - see [LICENSE](LICENSE) file

## 🙏 Acknowledgments

- [TMDB](https://www.themoviedb.org/) - Movie and TV data API
- [MyAnimeList/Jikan](https://jikan.moe/) - Anime data API
- [Vercel](https://vercel.com/) - Hosting platform
- [Sentry](https://sentry.io/) - Error tracking platform
- React, Vite, Tailwind CSS communities

## 📞 Support

- 🐛 **Bug Reports**: [Create Issue](https://github.com/yourusername/zyflixa/issues)
- 💬 **Discussions**: [Start Discussion](https://github.com/yourusername/zyflixa/discussions)
- 📧 **Contact**: support@zyflixa.com

## 🗺️ Roadmap

- [ ] User Authentication (OAuth)
- [ ] Social Features (ratings, reviews, comments)
- [ ] Collections & Playlists
- [ ] AI-powered Recommendations
- [ ] Download capability
- [ ] Offline mode
- [ ] Multi-language support
- [ ] Mobile apps (React Native)

---

**Made with ❤️ using React, TypeScript & Vite**

## How It Works

The detection happens during the `npm run lint` command, which will:
- Exit with error code 1 if undefined variables are found
- Show exactly which variables need to be added to your CSS file
- Integrate seamlessly with your development workflow

This prevents runtime CSS issues where Tailwind classes reference undefined CSS variables.