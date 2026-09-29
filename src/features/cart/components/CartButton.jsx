import { Link } from 'react-router-dom'
import { useCart } from '../../../app/providers/CartProvider.jsx'

/**
 * Header cart button with a live item count.
 *
 * The count is announced politely (`aria-live`) so a screen-reader user hears
 * "Cart, 3 items" after adding something, without the badge being re-read on
 * every unrelated render.
 */
export default function CartButton() {
  const { count } = useCart()

  return (
    <Link className="cart-button" to="/cart" aria-label={`Cart, ${count} items`}>
      <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <path
          d="M3 4h2l2.4 11.2a2 2 0 0 0 2 1.6h7.7a2 2 0 0 0 2-1.55L21 8H6"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="10" cy="20" r="1.4" fill="currentColor" />
        <circle cx="17.5" cy="20" r="1.4" fill="currentColor" />
      </svg>
      <span className="cart-button__label">Cart</span>
      {count > 0 && (
        <span className="cart-button__count" aria-live="polite">
          {count}
        </span>
      )}
    </Link>
  )
}