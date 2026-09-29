import { Suspense } from 'react'
import { Routes, Route, Link, useLocation } from 'react-router-dom'
import { CartProvider } from './providers/CartProvider.jsx'
import { routeTable } from './routes.jsx'
import SiteHeader from './SiteHeader.jsx'
import SiteFooter from './SiteFooter.jsx'
import ErrorBoundary from '../shared/ui/ErrorBoundary.jsx'
import Skeleton from '../shared/ui/Skeleton.jsx'

/**
 * Composition root.
 *
 * Layout (header/footer) sits *outside* the Suspense boundary so navigation
 * chrome never unmounts while a route chunk is loading — only the page body
 * swaps to a skeleton. Provider sits at the top so both layout and routes share
 * cart state.
 */
export default function App() {
  const { pathname } = useLocation()

  return (
    <ErrorBoundary>
      <CartProvider>
        <a className="skip-link" href="#main">
          Skip to content
        </a>

        <SiteHeader />

        <main id="main" className="site-main">
          <Suspense fallback={<PageSkeleton />}>
            <Routes location={{ pathname }}>
              {routeTable.map(({ path, element: Element }) => (
                <Route key={path} path={path} element={<Element />} />
              ))}
            </Routes>
          </Suspense>
        </main>

        <SiteFooter />
      </CartProvider>
    </ErrorBoundary>
  )
}

function PageSkeleton() {
  return (
    <div className="container page-skeleton" aria-busy="true" aria-live="polite">
      <Skeleton height="2.5rem" width="40%" />
      <Skeleton height="1rem" width="70%" />
      <div className="grid grid--3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} height="18rem" />
        ))}
      </div>
    </div>
  )
}

/** Small shared 404 used as the route table's catch-all. */
export function NotFoundPage() {
  return (
    <div className="container empty-state">
      <h1>Page not found</h1>
      <p>The page you're looking for doesn't exist or has moved.</p>
      <Link className="btn btn--primary" to="/">
        Back to home
      </Link>
    </div>
  )
}