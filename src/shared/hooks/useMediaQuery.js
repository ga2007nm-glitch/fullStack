import { useEffect, useState } from 'react'

/**
 * Subscribe to a CSS media query.
 *
 * Starts from the real `matches` value rather than `false`, so a desktop visitor
 * never gets a one-frame mobile layout on first paint.
 */
export default function useMediaQuery(query) {
  const [matches, setMatches] = useState(
    () => typeof window !== 'undefined' && window.matchMedia(query).matches
  )

  useEffect(() => {
    const list = window.matchMedia(query)
    const handleChange = (event) => setMatches(event.matches)

    setMatches(list.matches)
    list.addEventListener('change', handleChange)
    return () => list.removeEventListener('change', handleChange)
  }, [query])

  return matches
}