import { Link } from 'react-router-dom'

/** Site footer: secondary navigation and the demo disclaimer. */
export default function SiteFooter() {
  const year = new Date().getFullYear()

  return (
    <footer className="site-footer">
      <div className="container site-footer__inner">
        <div className="site-footer__brand">
          <span className="brand__mark" aria-hidden="true">
            ◈
          </span>
          <strong>Lumen</strong>
          <p>A curated catalog of considered objects for the modern home and workspace.</p>
        </div>

        <nav aria-label="Footer">
          <h2 className="site-footer__heading">Shop</h2>
          <ul>
            <li>
              <Link to="/shop">All products</Link>
            </li>
            <li>
              <Link to="/shop?sale=1">On sale</Link>
            </li>
            <li>
              <Link to="/shop?sort=rating">Top rated</Link>
            </li>
          </ul>
        </nav>

        <nav aria-label="Account">
          <h2 className="site-footer__heading">Account</h2>
          <ul>
            <li>
              <Link to="/cart">Your cart</Link>
            </li>
            <li>
              <Link to="/shop?category=carry">Gift ideas</Link>
            </li>
          </ul>
        </nav>
      </div>

      <div className="container site-footer__legal">
        <p>© {year} Lumen. A capstone demo project — no real transactions are processed.</p>
      </div>
    </footer>
  )
}