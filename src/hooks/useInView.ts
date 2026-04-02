import { useEffect, useRef, useState } from 'react'

/**
 * Returns a ref and a boolean — true once the element enters the viewport.
 * Used for lazy-loading rows so we only fetch data when the user scrolls to them.
 */
export const useInView = (options?: IntersectionObserverInit) => {
  const ref = useRef<HTMLDivElement>(null)
  const [inView, setInView] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true)
          observer.disconnect() // only need to fire once
        }
      },
      { rootMargin: '200px', threshold: 0, ...options },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return { ref, inView }
}
