import { useMemo } from 'react'
import CartLineItem from './CartLineItem.jsx'
import { useCart } from '../../../app/providers/CartProvider.jsx'
import { getProductById } from '../../catalog/data/products.js'
import { formatPrice } from '../../../shared/lib/format.js'

/** Free-shipping threshold, shared by the summary and the progress hint. */
const FREE_SHIPPING_AT = 100
const SHIPPING_FLAT = 9
const TAX_RATE = 0.08

/** Order summary: subtotal, shipping, tax, total. */
export function CartSummary({ subtotal, itemCount }) {
  const shipping = subtotal === 0 || subtotal >= FREE_SHIPPING_AT ? 0 : SHIPPING_FLAT
  const tax = subtotal * TAX_RATE
  const total = subtotal + shipping + tax
  const remaining = Math.max(0, FREE_SHIPPING_AT - subtotal)

  return (
    <aside className="cart-summary" aria-label="Order summary">
      <h2>Order summary</h2>

      <dl className="cart-summary__lines">
        <div>
          <dt>
            Subtotal ({itemCount} {itemCount === 1 ? 'item' : 'items'})
          </dt>
          <dd>{formatPrice(subtotal)}</dd>
        </div>
        <div>
          <dt>Shipping</dt>
          <dd>{shipping === 0 ? 'Free' : formatPrice(shipping)}</dd>
        </div>
        <div>
          <dt>Estimated tax</dt>
          <dd>{formatPrice(tax)}</dd>
        </div>
        <div className="cart-summary__total">
          <dt>Total</dt>
          <dd>{formatPrice(total)}</dd>
        </div>
      </dl>

      {remaining > 0 && (
        <p className="cart-summary__hint" role="status">
          Add {formatPrice(remaining)} more for free shipping.
        </p>
      )}

      <button type="button" className="btn btn--primary btn--lg btn--block">
        Checkout
      </button>
      <p className="cart-summary__note">
        Demo checkout — this catalog project has no payment backend.
      </p>
    </aside>
  )
}

/**
 * Cart line list + summary.
 *
 * Line totals are derived from live catalog prices on every render (never from
 * persisted snapshots), and `useMemo` keeps that reduce off the hot path when
 * unrelated state — like the search box — changes.
 */
export default function CartItems({ onEmpty }) {
  const { lines } = useCart()

  const { subtotal, itemCount } = useMemo(() => {
    let subtotal = 0
    let itemCount = 0

    for (const line of lines) {
      const product = getProductById(line.id)
      if (!product) continue
      subtotal += product.price * line.qty
      itemCount += line.qty
    }

    return { subtotal, itemCount }
  }, [lines])

  if (!lines.length) {
    return (
      <div className="empty-state">
        <h2>Your cart is empty</h2>
        <p>Nothing here yet — the catalog is a good place to start.</p>
        <button type="button" className="btn btn--primary" onClick={onEmpty}>
          Browse the catalog
        </button>
      </div>
    )
  }

  return (
    <div className="cart-layout">
      <ul className="cart-lines">
        {lines.map((line) => (
          <CartLineItem key={line.id} line={line} />
        ))}
      </ul>
      <CartSummary subtotal={subtotal} itemCount={itemCount} />
    </div>
  )
}