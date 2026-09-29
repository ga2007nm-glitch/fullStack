import { categories } from '../data/products.js'
import { SORT_OPTIONS } from '../hooks/useProductFilters.js'

/**
 * Filter bar.
 *
 * Every control writes to the URL through the hook (uncontrolled by local state)
 * so the URL stays the single source of truth. Search input is debounced by the
 * caller, not here — the component stays presentational and reusable.
 */
export default function ProductFilters({
  category,
  query,
  sort,
  onlyDiscounted,
  activeFilterCount,
  resultCount,
  onCategoryChange,
  onQueryChange,
  onSortChange,
  onDiscountedChange,
  onClear
}) {
  return (
    <section className="filters" aria-label="Product filters">
      <div className="filters__row">
        <div className="field field--search">
          <label className="field__label" htmlFor="product-search">
            Search
          </label>
          <input
            id="product-search"
            type="search"
            className="field__input"
            placeholder="Search by name or feature…"
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
          />
        </div>

        <div className="field">
          <label className="field__label" htmlFor="product-sort">
            Sort by
          </label>
          <select
            id="product-sort"
            className="field__input"
            value={sort}
            onChange={(event) => onSortChange(event.target.value)}
          >
            {SORT_OPTIONS.map((option) => (
              <option key={option.id} value={option.id}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="filters__row filters__row--chips">
        <div className="chip-group" role="group" aria-label="Filter by category">
          {categories.map((item) => (
            <button
              key={item.id}
              type="button"
              className={`chip ${category === item.id ? 'chip--active' : ''}`}
              aria-pressed={category === item.id}
              onClick={() => onCategoryChange(item.id)}
            >
              {item.label}
            </button>
          ))}
        </div>

        <label className="toggle">
          <input
            type="checkbox"
            checked={onlyDiscounted}
            onChange={(event) => onDiscountedChange(event.target.checked)}
          />
          <span>On sale only</span>
        </label>
      </div>

      <div className="filters__status" role="status" aria-live="polite">
        <span>
          <strong>{resultCount}</strong> {resultCount === 1 ? 'product' : 'products'}
          {activeFilterCount > 0 ? ' matching your filters' : ''}
        </span>
        {activeFilterCount > 0 && (
          <button type="button" className="link-button" onClick={onClear}>
            Clear filters
          </button>
        )}
      </div>
    </section>
  )
}