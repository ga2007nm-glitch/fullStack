import { useCallback, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'

/** Available sort strategies, exported so the UI renders them from one list. */
export const SORT_OPTIONS = [
  { id: 'featured', label: 'Featured' },
  { id: 'price-asc', label: 'Price: low to high' },
  { id: 'price-desc', label: 'Price: high to low' },
  { id: 'rating', label: 'Top rated' },
  { id: 'name', label: 'Name: A–Z' }
]

const comparators = {
  'price-asc': (a, b) => a.price - b.price,
  'price-desc': (a, b) => b.price - a.price,
  rating: (a, b) => b.rating - a.rating,
  name: (a, b) => a.name.localeCompare(b.name)
}

/**
 * Catalog filtering, driven entirely by the URL query string.
 *
 * Why the URL and not `useState`: a filtered catalogue is then a real, linkable
 * address — you can share `/shop?category=audio&sort=price-asc`, refresh without
 * losing the view, and the browser back button steps through filter changes for
 * free. It also means the pre-renderer can emit a real page per view.
 *
 * `useSearchParams` is the only source of truth; nothing is duplicated in local
 * state, so the two can never disagree.
 */
export default function useProductFilters(products) {
  const [searchParams, setSearchParams] = useSearchParams()

  const category = searchParams.get('category') || 'all'
  const query = searchParams.get('q') || ''
  const sort = searchParams.get('sort') || 'featured'
  const onlyDiscounted = searchParams.get('sale') === '1'

  /** Merge one or more params, dropping empties so URLs stay clean. */
  const updateParams = useCallback(
    (patch) => {
      setSearchParams(
        (previous) => {
          const next = new URLSearchParams(previous)
          for (const [key, value] of Object.entries(patch)) {
            if (value === null || value === undefined || value === '' || value === 'all') {
              next.delete(key)
            } else {
              next.set(key, String(value))
            }
          }
          return next
        },
        // `replace` would break the back button; pushing keeps history honest.
        { replace: false }
      )
    },
    [setSearchParams]
  )

  const visibleProducts = useMemo(() => {
    const needle = query.trim().toLowerCase()

    const filtered = products.filter((product) => {
      if (category !== 'all' && product.category !== category) return false
      if (onlyDiscounted && !product.compareAt) return false

      if (needle) {
        // Match name, blurb and tags so "quiet" or "bestseller" both work.
        const haystack = `${product.name} ${product.blurb} ${product.tags.join(' ')}`.toLowerCase()
        if (!haystack.includes(needle)) return false
      }
      return true
    })

    const comparator = comparators[sort]
    // Copy before sorting — never mutate the array received as a prop.
    return comparator ? [...filtered].sort(comparator) : filtered
  }, [products, category, query, sort, onlyDiscounted])

  const activeFilterCount =
    (category !== 'all' ? 1 : 0) + (query ? 1 : 0) + (onlyDiscounted ? 1 : 0)

  const clearFilters = useCallback(() => {
    setSearchParams({}, { replace: false })
  }, [setSearchParams])

  return {
    category,
    query,
    sort,
    onlyDiscounted,
    visibleProducts,
    activeFilterCount,
    isFiltered: activeFilterCount > 0,
    setCategory: (value) => updateParams({ category: value }),
    setQuery: (value) => updateParams({ q: value }),
    setSort: (value) => updateParams({ sort: value }),
    setOnlyDiscounted: (value) => updateParams({ sale: value ? '1' : null }),
    clearFilters
  }
}