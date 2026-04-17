# Deployment Guide

## Quick Start

### Vercel (Recommended)

1. **Connect Repository**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository

2. **Configure Environment**
   ```
   VITE_TMDB_API_KEY = your_key
   VITE_SENTRY_DSN = your_dsn
   ```

3. **Deploy**
   - Click "Deploy"
   - Wait for build to complete
   - Access your live site!

### Environment Setup

```bash
# Create .env.local
cp .env.example .env.local

# Add your keys
VITE_TMDB_API_KEY=your_tmdb_key
VITE_SENTRY_DSN=your_sentry_dsn
```

## Pre-Deployment Checklist

- [ ] All tests pass: `npm run test`
- [ ] E2E tests pass: `npm run test:e2e`
- [ ] Build succeeds: `npm run build`
- [ ] No console errors
- [ ] Environment variables set
- [ ] SEO meta tags reviewed
- [ ] Performance optimized
- [ ] Security headers configured

## Build Process

```bash
# Install dependencies
npm install

# Build for production
npm run build

# Output: dist/
# - HTML files
# - JavaScript bundles
# - CSS files
# - Assets (images, etc)
```

## Deployment Platforms

### Vercel (Best)
```yaml
# vercel.json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "env": ["VITE_TMDB_API_KEY", "VITE_SENTRY_DSN"]
}
```

### Netlify
```yaml
# netlify.toml
[build]
command = "npm run build"
publish = "dist"

[build.environment]
NODE_VERSION = "20"
```

### GitHub Pages
- Not recommended for dynamic apps
- Use static site generation if needed

### Docker

**Dockerfile**
```dockerfile
FROM node:20-alpine as builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/dist ./dist
RUN npm install -g serve
EXPOSE 3000
CMD ["serve", "-s", "dist", "-l", "3000"]
```

**Build & Run**
```bash
docker build -t zyflixa .
docker run -p 3000:3000 zyflixa
```

## Environment Variables

### Required
- `VITE_TMDB_API_KEY` - TMDB API key (required)

### Optional
- `VITE_SENTRY_DSN` - Sentry error tracking DSN
- `VITE_ENABLE_ADS` - Enable ad system (default: true)
- `VITE_ENABLE_AUTH` - Enable authentication (default: false)

### Production Only
- `VITE_GA_ID` - Google Analytics ID

## Performance Optimization

### Build Output
```
npm run build

# Output sizes
dist/
├── index.html                 ~ 5KB
├── assets/
│   ├── index-abc123.js       ~ 180KB (minified)
│   ├── react-def456.js       ~ 45KB
│   ├── router-ghi789.js      ~ 35KB
│   └── styles-jkl012.css     ~ 25KB
└── index-mno345.css          ~ 8KB
```

### Optimizations Applied
- ✅ Tree-shaking
- ✅ Minification
- ✅ CSS splitting
- ✅ Image optimization
- ✅ Gzip compression

## Monitoring & Maintenance

### Sentry Setup
1. Create [Sentry](https://sentry.io) account
2. Create project for React
3. Copy DSN
4. Set `VITE_SENTRY_DSN` in environment

### Analytics
- Google Analytics for traffic
- Sentry for errors
- Core Web Vitals monitoring

### Uptime Monitoring
- UptimeRobot or similar
- Monitor API health
- Alert on failures

## Rollback Strategy

### Git Tags
```bash
# Tag release
git tag v1.0.0
git push --tags

# Rollback
git checkout v1.0.0
npm run build
# Re-deploy
```

### Vercel Deployments
- Automatic rollback available
- Preview deployments for testing
- Production deployments after approval

## SSL/TLS

### HTTPS Setup
- Vercel: Automatic (provided)
- Netlify: Automatic (provided)
- Self-hosted: Use Let's Encrypt with Certbot

### HSTS Headers
```
Strict-Transport-Security: max-age=31536000; includeSubDomains
```

## CDN Configuration

### Vercel Edge
- Automatic global distribution
- Instant deployment
- Regional failover

### Cloudflare (Optional)
1. Add domain
2. Update nameservers
3. Enable caching
4. Configure security

## Database (Future)

When adding backend:
- Use environment variables for connection
- Implement connection pooling
- Set up backups
- Enable replication

## DNS Configuration

```
# For Vercel
alias  zyflixa.com  cname.vercel-dns.com
alias  *.zyflixa.com  cname.vercel-dns.com

# For Netlify
alias  zyflixa.com  zyflixa.netlify.app
```

## Troubleshooting

### Build Fails
```bash
# Clear cache
rm -rf .next dist build

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Try again
npm run build
```

### Performance Issues
```bash
# Analyze bundle
npm install -D vite-bundle-visualizer
npm run build -- --analyze

# Check metrics
npm run test:coverage
```

### Environment Variables Not Loading
```bash
# Verify .env.local
cat .env.local

# Check Vercel dashboard
# Settings > Environment Variables

# Restart deployment
```

## Continuous Deployment

### GitHub Actions (Included)
```yaml
# Automatic deployment on push to main
- Build
- Test
- Deploy to Vercel
```

### Manual Deployment
```bash
# Build locally
npm run build

# Test build
npm run preview

# Deploy to Vercel
vercel --prod
```

## Production Checklist

### Security
- [ ] API keys in environment variables
- [ ] HTTPS enabled
- [ ] CORS configured
- [ ] Security headers set
- [ ] Sentry configured

### Performance
- [ ] Images optimized
- [ ] Code splitting working
- [ ] Caching headers set
- [ ] CDN configured
- [ ] Monitoring enabled

### Monitoring
- [ ] Error tracking (Sentry)
- [ ] Performance monitoring
- [ ] Uptime monitoring
- [ ] Analytics enabled
- [ ] Logs configured

### Maintenance
- [ ] Backup strategy
- [ ] Disaster recovery plan
- [ ] Update schedule
- [ ] Security patches
- [ ] Performance reviews

---

**Ready to deploy? Follow the Quick Start above! 🚀**
