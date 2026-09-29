import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import useProduct from '../hooks/useProduct.js'
import useProducts from '../hooks/useProducts.js'
import Rating from '../components/Rating.jsx'
import ProductGrid from '../components/ProductGrid.jsx'
import Badge from '../../../shared/ui/Badge.jsx'
import OptimizedImage from '../../../shared/ui/OptimizedImage.jsx'
import Skeleton from '../../../shared/ui/Skeleton.jsx'
import { useCart } from '../../../app/providers/CartProvider.jsx'
import useDocumentMeta from '../../../shared/hooks/useDocumentMeta.js'
import { formatPrice, discountPercent } from '../../../shared/lib/format.js'
import { getCategoryLabel } from '../data/products.js'

/**
 * Product detail page.
 *
 * Two things worth calling out:
 *  1. The `<script type="application/ld+json">` block emits schema.org Product
 *     markup, which is what makes rich results (price, rating stars) appear in
 *     search listings.
 *  2. Quantity is local state and resets when `slug` changes — otherwise adding
 *     3 of one item then navigating to another would pre-fill 3 incorrectly.
 */
export default function ProductPage() {
  const { slug } = useParams()
  const { product, isLoading, notFound } = useProduct(slug)
  const { products } = useProducts()
  const { addItem } = useCart()
  const [qty, setQty] = useState(1)

  useEffect(() => {
    setQty(1)
  }, [slug])

  useDocumentMeta({
    title: product ? `${product.name} — ${formatPrice(product.price)} | Lumen` : 'Lumen',
    description: product?.blurb
  })

  if (isLoading) {
    return (
      <div className="container section detail" aria-busy="true">
        <Skeleton height="26rem" radius="20px" />
        <div className="detail__info">
          <Skeleton height="2rem" width="80%" />
          <Skeleton height="1rem" width="40%" />
          <Skeleton height="5rem" />
          <Skeleton height="3rem" width="60%" />
        </div>
      </div>
    )
  }

  if (notFound) {
    return (
      <div className="container empty-state">
        <h1>Product not found</h1>
        <p>We couldn't find anything at that address.</p>
        <Link className="btn btn--primary" to="/shop">
          Back to the catalog
        </Link>
      </div>
    )
  }

  const discount = discountPercent(product.price, product.compareAt)
  const soldOut = product.stock === 0
  const related = products
    .filter((item) => item.category === product.category && item.id !== product.id)
    .slice(0, 3)

  const productSchema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.blurb,
    image: product.image,
    category: getCategoryLabel(product.category),
    offers: {
      '@type': 'Offer',
      price: product.price,
      priceCurrency: 'USD',
      availability: soldOut ? 'https://schema.org/OutOfStock' : 'https://schema.org/InStock'
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: product.rating,
      reviewCount: product.reviews
    }
  }

  return (
    <div className="container section">
      <nav className="breadcrumbs" aria-label="Breadcrumb">
        <ol>
          <li>
            <Link to="/">Home</Link>
          </li>
          <li>
            <Link to={`/shop?category=${product.category}`}>
              {getCategoryLabel(product.category)}
            </Link>
          </li>
          <li aria-current="page">{product.name}</li>
        </ol>
      </nav>

      <div className="detail">
        <div className="detail__media">
          <OptimizedImage
            src={product.image}
            alt={product.name}
            width={1000}
            height={1000}
            priority
            quality={75}
            sizes="(max-width: 900px) 92vw, 50vw"
          />
        </div>

        <div className="detail__info">
          <div className="detail__badges">
            {discount != null && <Badge tone="sale">Save {discount}%</Badge>}
            {product.tags.map((tag) => (
              <Badge key={tag} tone={tag === 'new' ? 'new' : 'neutral'}>
                {tag}
              </Badge>
            ))}
          </div>

          <h1>{product.name}</h1>
          <Rating value={product.rating} reviews={product.reviews} size="md" />

          <p className="detail__price">
            <strong>{formatPrice(product.price)}</strong>
            {product.compareAt && <s>{formatPrice(product.compareAt)}</s>}
          </p>

          <p className="detail__blurb">{product.blurb}</p>

          <div className="detail__buy">
            <div className="qty">
              <label className="visually-hidden" htmlFor="qty">
                Quantity
              </label>
              <button
                type="button"
                onClick={() => setQty((value) => Math.max(1, value - 1))}
                aria-label="Decrease quantity"
              >
                −
              </button>
              <input
                id="qty"
                type="number"
                min="1"
                max={Math.max(1, product.stock)}
                value={qty}
                onChange={(event) => {
                  const next = Number(event.target.value)
                  // Clamp so a typed "9999" can't exceed stock or go negative.
                  setQty(Math.min(Math.max(1, next || 1), Math.max(1, product.stock)))
                }}
              />
              <button
                type="button"
                onClick={() => setQty((value) => Math.min(product.stock || 1, value + 1))}
                aria-label="Increase quantity"
              >
                +
              </button>
            </div>

            <button
              type="button"
              className="btn btn--primary btn--lg"
              disabled={soldOut}
              onClick={() => addItem(product.id, qty)}
            >
              {soldOut ? 'Sold out' : `Add ${qty > 1 ? `${qty} ` : ''}to cart`}
            </button>
          </div>

          <p className="detail__stock" role="status">
            {soldOut
              ? 'Currently out of stock.'
              : product.stock <= 10
                ? `Only ${product.stock} left in stock.`
                : 'In stock — ships within 24 hours.'}
          </p>

          <p className="detail__description">{product.description}</p>

          <table className="spec-table">
            <caption className="visually-hidden">Specifications for {product.name}</caption>
            <tbody>
              {Object.entries(product.specs).map(([label, value]) => (
                <tr key={label}>
                  <th scope="row">{label}</th>
                  <td>{value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {related.length > 0 && (
        <section className="section">
          <div className="section__head">
            <h2>More in {getCategoryLabel(product.category)}</h2>
          </div>
          <ProductGrid products={related} skeletonCount={3} priorityCount={0} />
        </section>
      )}

      {/* Structured data — lets search engines show price/rating in results. */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
      />
    </div>
  )
}