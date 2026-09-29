import { Link } from 'react-router-dom'
import OptimizedImage from '../../../shared/ui/OptimizedImage.jsx'
import { useCart } from '../../../app/providers/CartProvider.jsx'
import { getProductById } from '../../catalog/data/products.js'
import { formatPrice } from '../../../shared/lib/format.js'

/**
 * One cart row.
 *
 * Resolves the product from the catalog by id rather than trusting stored data
 * (see CartProvider) — the price shown is always current. `getProductById` is a
 * sync lookup so the cart never renders a loading state.
 */
export default function CartLineItem({ line }) {
  const { setQty, removeItem } = useCart()
  const product = getProductById(line.id)

  // Defensive: a product removed from the catalog but still in localStorage.
  if (!product) {
    return (
      <li className="cart-line cart-line--stale">
        <div className="cart-line__info">
          <p className="cart-line__name">This item is no longer available</p>
          <button type="button" className="link-button" onClick={() => removeItem(line.id)}>
            Remove
          </button>
        </div>
      </li>
    )
  }

  const lineTotal = product.price * line.qty

  return (
    <li className="cart-line">
      <Link className="cart-line__media" to={`/product/${product.slug}`}>
        <OptimizedImage
          src={product.image}
          alt={product.name}
          width={160}
          height={160}
          quality={55}
          sizes="80px"
        />
      </Link>

      <div className="cart-line__info">
        <h3 className="cart-line__name">
          <Link to={`/product/${product.slug}`}>{product.name}</Link>
        </h3>
        <p className="cart-line__unit">{formatPrice(product.price)} each</p>

        <div className="qty qty--sm">
          <button
            type="button"
            onClick={() => setQty(line.id, line.qty - 1)}
            aria-label={`Decrease quantity of ${product.name}`}
          >
            −
          </button>
          <input
            type="number"
            min="1"
            value={line.qty}
            aria-label={`Quantity of ${product.name}`}
            onChange={(event) => setQty(line.id, Math.max(1, Number(event.target.value) || 1))}
          />
          <button
            type="button"
            onClick={() => setQty(line.id, line.qty + 1)}
            aria-label={`Increase quantity of ${product.name}`}
          >
            +
          </button>
        </div>
      </div>

      <div className="cart-line__end">
        <p className="cart-line__total">{formatPrice(lineTotal)}</p>
        <button
          type="button"
          className="link-button"
          onClick={() => removeItem(line.id)}
          aria-label={`Remove ${product.name} from cart`}
        >
          Remove
        </button>
      </div>
    </li>
  )
}