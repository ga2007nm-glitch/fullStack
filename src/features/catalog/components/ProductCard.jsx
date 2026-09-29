import { Link } from 'react-router-dom'
import OptimizedImage from '../../../shared/ui/OptimizedImage.jsx'
import Badge from '../../../shared/ui/Badge.jsx'
import Rating from './Rating.jsx'
import { useCart } from '../../../app/providers/CartProvider.jsx'
import { formatPrice, discountPercent } from '../../../shared/lib/format.js'

/**
 * Product card.
 *
 * The whole card is a `<Link>`, so keyboard and middle-click behave as users
 * expect. The "Add" control sits above the link in the DOM (via CSS z-index and
 * a stopPropagation-free layout) — it is a sibling, not a button nested inside
 * an anchor, which would be invalid HTML and break the click target.
 */
export default function ProductCard({ product, priority = false }) {
  const { addItem } = useCart()
  const discount = discountPercent(product.price, product.compareAt)
  const soldOut = product.stock === 0

  return (
    <article className="product-card">
      <Link
        className="product-card__media"
        to={`/product/${product.slug}`}
        aria-label={`View ${product.name}`}
      >
        <OptimizedImage
          src={product.image}
          alt={product.name}
          width={800}
          height={800}
          priority={priority}
          sizes="(max-width: 640px) 90vw, (max-width: 1024px) 45vw, 30vw"
        />
        <div className="product-card__badges">
          {discount != null && <Badge tone="sale">−{discount}%</Badge>}
          {product.tags.includes('new') && <Badge tone="new">New</Badge>}
          {soldOut && <Badge tone="muted">Sold out</Badge>}
        </div>
      </Link>

      <div className="product-card__body">
        <h3 className="product-card__name">
          <Link to={`/product/${product.slug}`}>{product.name}</Link>
        </h3>

        <Rating value={product.rating} reviews={product.reviews} />

        <p className="product-card__blurb">{product.blurb}</p>

        <div className="product-card__footer">
          <p className="product-card__price">
            <strong>{formatPrice(product.price)}</strong>
            {product.compareAt && (
              <s className="product-card__compare">{formatPrice(product.compareAt)}</s>
            )}
          </p>

          <button
            type="button"
            className="btn btn--primary btn--sm"
            onClick={() => addItem(product.id)}
            disabled={soldOut}
          >
            {soldOut ? 'Sold out' : 'Add to cart'}
          </button>
        </div>
      </div>
    </article>
  )
}