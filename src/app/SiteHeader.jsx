import { NavLink, Link } from 'react-router-dom'
import CartButton from '../features/cart/components/CartButton.jsx'

const NAV_ITEMS = [
  { to: '/shop', label: 'All products' },
  { to: '/shop?category=audio', label: 'Audio' },
  { to: '/shop?category=lighting', label: 'Lighting' },
  { to: '/shop?category=workspace', label: 'Workspace' },
  { to: '/shop?category=carry', label: 'Carry' }
]

/** Sticky site header: brand, primary nav, cart. */
export default function SiteHeader() {
  return (
    <header className="site-header">
      <div className="container site-header__inner">
        <Link className="brand" to="/">
          <span className="brand__mark" aria-hidden="true">
            ◈
          </span>
          <span className="brand__name">Lumen</span>
        </Link>

        <nav className="site-nav" aria-label="Primary">
          <ul>
            {NAV_ITEMS.map((item) => (
              <li key={item.to}>
                {/*
                 * `NavLink` only reports `isActive` for the exact pathname, so the
                 * query-string links above would never highlight. Styling those is
                 * left to the catalog page's own filter chips instead.
                 */}
                <NavLink
                  to={item.to}
                  className={({ isActive }) => (isActive ? 'site-nav__link is-active' : 'site-nav__link')}
                >
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <CartButton />
      </div>
    </header>
  )
}