# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Input validation with Zod schemas
- Unit tests with Vitest
- E2E tests with Playwright
- GitHub Actions CI/CD pipeline
- Sentry error tracking
- Error Boundary component
- Pre-commit hooks with Husky
- Lint-staged for code quality
- Comprehensive documentation (README, CONTRIBUTING, SECURITY)
- Security policy and guidelines
- GitHub issue and PR templates
- ESLint configuration with TypeScript support
- Prettier code formatting
- Test setup and utilities

### Changed
- Upgraded TypeScript to strict mode
- Restructured Watchlist to use Context API instead of Global State
- Improved Service Worker error handling
- Enhanced accessibility with ARIA labels
- Updated package.json with new scripts and dependencies

### Fixed
- Memory leaks in WatchPage and AnimeWatchPage
- Missing input validation in SearchPage
- Type safety issues throughout codebase
- Removed unused imports and variables

## [1.0.0] - 2026-04-17

### Added
- Initial release of Zyflixa
- Support for Movies from TMDB
- Support for TV Shows from TMDB
- Support for Anime from MyAnimeList
- Search functionality across all content types
- Browse pages with filtering
- Detailed information pages with trailers
- Watch page with multi-server support
- Watchlist feature with localStorage
- Continue watching functionality
- Server ranking system
- Responsive design for mobile and desktop
- Dark mode theme
- SEO optimization with meta tags
- Service Worker for image caching
- Google Analytics integration
- Adsterra ads integration
- Sentry error tracking setup
- Full TypeScript implementation
- Comprehensive component library

### Technical Details
- React 19 with TypeScript strict mode
- Vite 7.2 for fast builds
- TanStack Router for efficient routing
- TanStack React Query for data management
- Tailwind CSS for styling
- Framer Motion for animations
- Responsive images with srcset
- Lazy loading with Intersection Observer
- Code splitting by route
- Service Worker for offline image caching

---

## Release Notes

### Version Support
- **Current**: 1.0.0
- **LTS**: N/A (will be determined after 1.0 release)
- **EOL**: Check individual release notes

### Migration Guides
- [0.x → 1.0.0](./docs/MIGRATION.md)

### Known Issues
None reported. Please file issues on [GitHub](https://github.com/yourusername/zyflixa/issues)

---

## How to Contribute

See [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines.

## Credits

- Built with React, TypeScript, and Vite
- Data from TMDB and MyAnimeList
- Hosted on Vercel
- Monitored with Sentry
