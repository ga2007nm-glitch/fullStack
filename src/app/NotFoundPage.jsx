import { Link } from 'react-router-dom'

/**
 * 404 page.
 *
 * Lives in its own module rather than in `App.jsx` because `routes.jsx` needs
 * it. Importing it from `App.jsx` would create a cycle — `App.jsx` imports
 * `routeTable` from `routes.jsx`, and `routes.jsx` would import this component
 * back from `App.jsx`. Whichever module is evaluated first sees the other's
 * exports as `undefined`, which silently renders `undefined` elements instead
 * of throwing.
 */
export default function NotFoundPage() {
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