import { useEffect } from 'react'

interface SEOProps {
  title?: string
  description?: string
  image?: string
  url?: string
  type?: 'website' | 'video.movie' | 'video.tv_show'
}

const SITE_NAME = 'Zyflixa'
const BASE_URL  = 'https://zyflixa.eu.cc'

export const useSEO = ({ title, description, image, url, type = 'website' }: SEOProps) => {
  useEffect(() => {
    const fullTitle = title ? `${title} — ${SITE_NAME}` : `${SITE_NAME} — Stream Movies & TV Shows`
    const fullUrl   = url ? `${BASE_URL}${url}` : BASE_URL
    const desc      = description || 'Discover and stream the latest movies and TV shows on Zyflixa.'

    // Title
    document.title = fullTitle

    // Helper to set/create a meta tag
    const setMeta = (selector: string, attr: string, value: string) => {
      let el = document.querySelector(selector) as HTMLMetaElement | null
      if (!el) {
        el = document.createElement('meta')
        el.setAttribute(selector.includes('property') ? 'property' : 'name',
          selector.replace(/.*["'](.+)["']\]/, '$1'))
        document.head.appendChild(el)
      }
      el.setAttribute(attr, value)
    }

    setMeta('meta[name="description"]',         'content', desc)
    setMeta('meta[property="og:title"]',        'content', fullTitle)
    setMeta('meta[property="og:description"]',  'content', desc)
    setMeta('meta[property="og:url"]',          'content', fullUrl)
    setMeta('meta[property="og:type"]',         'content', type)
    setMeta('meta[property="og:site_name"]',    'content', SITE_NAME)
    setMeta('meta[name="twitter:title"]',       'content', fullTitle)
    setMeta('meta[name="twitter:description"]', 'content', desc)

    if (image) {
      setMeta('meta[property="og:image"]',      'content', image)
      setMeta('meta[name="twitter:image"]',     'content', image)
      setMeta('meta[name="twitter:card"]',      'content', 'summary_large_image')
    }

    // Canonical
    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null
    if (!canonical) {
      canonical = document.createElement('link')
      canonical.rel = 'canonical'
      document.head.appendChild(canonical)
    }
    canonical.href = fullUrl

    // Cleanup on unmount
    return () => {
      document.title = `${SITE_NAME} — Stream Movies & TV Shows`
    }
  }, [title, description, image, url, type])
}
