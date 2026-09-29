import { useEffect, useState } from 'react'
import useProducts from '../hooks/useProducts.js'
import useProductFilters from '../hooks/useProductFilters.js'
import ProductGrid from '../components/ProductGrid.jsx'
import ProductFilters from '../components/ProductFilters.jsx'
import useDocumentMeta from '../../../shared/hooks/useDocumentMeta.js'
import { getCategoryLabel } from '../data/products.js'

/**
 * Catalog page.
 *
 * All filter/sort/search state lives in the URL (see `useProductFilters`), so
 * this component holds no view state of its own except the debounced search box
 * — which is deliberately local, since a keystroke-by-keystroke history entry
 * would make the back button unusable.
 */
export default function CatalogPage() {
  const { products, isLoading } = useProducts()
  const filters = useProductFilters(products)

  // Local mirror of the search box, flushed to the URL after a pause.
  const [searchDraft, setSearchDraft] = useState(filters.query)

  // Keep the box in sync when the URL changes externally (back button, link).
  useEffect(() => {
    setSearchDraft(filters.query)
  }, [filters.query])

  useEffect(() => {
    if (searchDraft === filters.query) return
    const timer = setTimeout(() => filters.setQuery(searchDraft), 250)
    return () => clearTimeout(timer)
    // `filters.setQuery` is stable (useCallback); depending on the whole object
    // would re-arm the timer on every unrelated URL change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchDraft, filters.query])

  const categoryLabel = getCategoryLabel(filters.category)
  const title =
    filters.category === 'all' ? 'Shop all products' : `${categoryLabel} — Lumen Catalog`

  useDocumentMeta({
    title: `${title} | Lumen`,
    description: `Browse ${isLoading ? '' : `${products.length} `}curated products across audio, lighting, workspace and everyday carry. Filter by category, price and rating.`
  })

  return (
    <div className="container section">
      <header className="page-head">
        <nav className="breadcrumbs" aria-label="Breadcrumb">
          <ol>
            <li>
              <a href="/">Home</a>
            </li>
            <li aria-current="page">{categoryLabel}</li>
          </ol>
        </nav>
        <h1>{title}</h1>
        <p className="page-head__lede">
          Everything in the catalog, filterable and sortable. The URL tracks your filters, so any
          view you build is a link you can share.
        </p>
      </header>

      <ProductFilters
        category={filters.category}
        query={searchDraft}
        sort={filters.sort}
        onlyDiscounted={filters.onlyDiscounted}
        activeFilterCount={filters.activeFilterCount}
        resultCount={filters.visibleProducts.length}
        onCategoryChange={filters.setCategory}
        onQueryChange={setSearchDraft}
        onSortChange={filters.setSort}
        onDiscountedChange={filters.setOnlyDiscounted}
        onClear={() => {
          setSearchDraft('')
          filters.clearFilters()
        }}
      />

      <ProductGrid
        products={filters.visibleProducts}
        isLoading={isLoading}
        priorityCount={2}
        emptyMessage="No products match those filters. Try clearing them."
      />
    </div>
  )
}