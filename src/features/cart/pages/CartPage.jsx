import { Link, useNavigate } from 'react-router-dom'
import CartItems from '../components/CartItems.jsx'
import useDocumentMeta from '../../../shared/hooks/useDocumentMeta.js'

/** Full-page cart. */
export default function CartPage() {
  const navigate = useNavigate()

  useDocumentMeta({
    title: 'Your cart | Lumen',
    description: 'Review the items in your Lumen cart before checkout.'
  })

  return (
    <div className="container section">
      <nav className="breadcrumbs" aria-label="Breadcrumb">
        <ol>
          <li>
            <Link to="/">Home</Link>
          </li>
          <li aria-current="page">Cart</li>
        </ol>
      </nav>

      <header className="page-head">
        <h1>Your cart</h1>
        <p className="page-head__lede">
          Items are saved to this browser, so the cart survives a refresh.
        </p>
      </header>

      <CartItems onEmpty={() => navigate('/shop')} />
    </div>
  )
}