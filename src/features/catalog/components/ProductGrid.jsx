import ProductCard from './ProductCard.jsx'
import Skeleton from '../../../shared/ui/Skeleton.jsx'

/**
 * Responsive product grid.
 *
 * `priorityCount` lets a page mark the first row (and only the first row) as
 * high-priority, so the LCP image loads eagerly while everything below the fold
 * stays lazy.
 */
export default function ProductGrid({
  products,
  isLoading = false,
  skeletonCount = 6,
  priorityCount = 2,
  emptyMessage = 'No products match those filters.'
}) {
  if (isLoading) {
    return (
      <div className="grid grid--3" aria-busy="true" aria-label="Loading products">
        {Array.from({ length: skeletonCount }).map((_, index) => (
          <div className="product-card product-card--skeleton" key={index}>
            <Skeleton height="15rem" radius="16px" />
            <Skeleton height="1rem" width="70%" />
            <Skeleton height="0.85rem" width="45%" />
          </div>
        ))}
      </div>
    )
  }

  if (!products.length) {
    return (
      <p className="empty-state" role="status">
        {emptyMessage}
      </p>
    )
  }

  return (
    <div className="grid grid--3">
      {products.map((product, index) => (
        <ProductCard key={product.id} product={product} priority={index < priorityCount} />
      ))}
    </div>
  )
}