import React from 'react'
import { MovieRow } from './MovieRow'
import { useInView } from '../hooks/useInView'
import type { Movie } from '../lib/tmdb'

interface LazyMovieRowProps {
  title: string
  subtitle?: string
  /** Pass a hook result — but only enable fetching once visible */
  useFetch: (enabled: boolean) => { data?: Movie[]; isLoading: boolean }
}

/**
 * Renders a MovieRow that delays its API call until the row scrolls into view.
 * This reduces initial page load from 60+ simultaneous requests to ~6.
 */
export const LazyMovieRow: React.FC<LazyMovieRowProps> = ({ title, subtitle, useFetch }) => {
  const { ref, inView } = useInView()
  const { data = [], isLoading } = useFetch(inView)

  return (
    <div ref={ref}>
      <MovieRow
        title={title}
        subtitle={subtitle}
        movies={data}
        isLoading={!inView || isLoading}
        lazy={false} // inView is already handled here
      />
    </div>
  )
}
