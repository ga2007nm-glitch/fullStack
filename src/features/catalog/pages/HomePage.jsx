import { Link } from 'react-router-dom'
import useProducts from '../hooks/useProducts.js'
import ProductGrid from '../components/ProductGrid.jsx'
import OptimizedImage from '../../../shared/ui/OptimizedImage.jsx'
import useDocumentMeta from '../../../shared/hooks/useDocumentMeta.js'
import { categories } from '../data/products.js'

/** Landing page: hero + featured rail + category entry points. */
export default function HomePage() {
  const { products, isLoading } = useProducts()

  useDocumentMeta({
    title: 'Lumen — Curated Modern Products',
    description:
      'A curated catalog of considered objects — audio, lighting, workspace and everyday carry, chosen for how they feel to live with.'
  })

  // Highest-rated items make a more interesting rail than raw insertion order.
  const featured = [...products].sort((a, b) => b.rating - a.rating).slice(0, 4)

  return (
    <>
      <section className="hero">
        <div className="container hero__inner">
          <div className="hero__copy">
            <p className="eyebrow">Curated · Since 2019</p>
            <h1 className="hero__title">
              Objects worth
              <br />
              keeping.
            </h1>
            <p className="hero__lede">
              Twelve things we actually use — audio, lighting, workspace and carry. Chosen for how
              they feel after a year, not how they look in a photo.
            </p>
            <div className="hero__actions">
              <Link className="btn btn--primary btn--lg" to="/shop">
                Browse the catalog
              </Link>
              <Link className="btn btn--ghost btn--lg" to="/shop?sale=1">
                See what's on sale
              </Link>
            </div>
          </div>

          <div className="hero__media">
            {/* The LCP element: eager + high priority, preloaded in index.html. */}
            <OptimizedImage
              src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e"
              alt="Aperture over-ear headphones resting on a desk"
              width={900}
              height={1100}
              priority
              sizes="(max-width: 900px) 90vw, 42vw"
            />
          </div>
        </div>
      </section>

      <section className="container section">
        <div className="section__head">
          <h2>Shop by category</h2>
        </div>
        <ul className="category-strip">
          {categories
            .filter((category) => category.id !== 'all')
            .map((category) => (
              <li key={category.id}>
                <Link className="category-tile" to={`/shop?category=${category.id}`}>
                  <span className="category-tile__label">{category.label}</span>
                  <span className="category-tile__arrow" aria-hidden="true">
                    →
                  </span>
                </Link>
              </li>
            ))}
        </ul>
      </section>

      <section className="container section">
        <div className="section__head">
          <h2>Highest rated</h2>
          <Link className="link-button" to="/shop?sort=rating">
            View all
          </Link>
        </div>
        <ProductGrid
          products={featured}
          isLoading={isLoading}
          skeletonCount={4}
          priorityCount={0}
          emptyMessage="Nothing to show yet."
        />
      </section>

      <section className="container section">
        <div className="promo">
          <div>
            <h2>Free shipping over $100</h2>
            <p>And a 60-day return window on everything in the catalog.</p>
          </div>
          <Link className="btn btn--primary" to="/shop">
            Start shopping
          </Link>
        </div>
      </section>
    </>
  )
}