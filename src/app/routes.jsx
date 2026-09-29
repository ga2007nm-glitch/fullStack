import { lazy } from 'react'
import { NotFoundPage } from './App.jsx'

/*
 * Single source of truth for the app's routes.
 *
 * Each page is a `React.lazy` boundary, so Vite emits one JS chunk per route:
 * a visitor who never opens the cart never downloads the cart page. Keeping the
 * table declarative means the pre-renderer (scripts/prerender.mjs) can import
 * this exact list and walk it — routes and static output can never drift apart.
 */

const HomePage = lazy(() => import('../features/catalog/pages/HomePage.jsx'))
const CatalogPage = lazy(() => import('../features/catalog/pages/CatalogPage.jsx'))
const ProductPage = lazy(() => import('../features/catalog/pages/ProductPage.jsx'))
const CartPage = lazy(() => import('../features/cart/pages/CartPage.jsx'))

/**
 * @typedef {{ path: string, element: React.ComponentType, data: () => Promise<object> }} AppRoute
 */

/** @type {AppRoute[]} */
export const routeTable = [
  { path: '/', element: HomePage },
  { path: '/shop', element: CatalogPage },
  { path: '/product/:slug', element: ProductPage },
  { path: '/cart', element: CartPage },
  { path: '*', element: NotFoundPage }
]

/**
 * Static routes are rendered once. Dynamic routes (`:slug`) expand to one
 * concrete URL per record, supplied here so the pre-renderer knows what to emit.
 */
export async function enumerablePaths() {
  const { products } = await import('../features/catalog/data/products.js')

  const staticPaths = routeTable
    .filter((route) => !route.path.includes(':') && route.path !== '*')
    .map((route) => route.path)

  return [...staticPaths, ...products.map((product) => `/product/${product.slug}`)]
}