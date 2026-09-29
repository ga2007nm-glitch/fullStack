import { useEffect, useMemo, useState } from 'react'
import { fetchProductBySlug, products } from '../data/products.js'

/** Synchronous lookup against the bundled catalog. */
const findLocally = (slug) => products.find((item) => item.slug === slug) ?? null

/**
 * Single product by slug, with an explicit `notFound` state.
 *
 * The catalog is bundled locally, so the product is available synchronously —
 * we seed state from it rather than starting at `loading` and filling in from an
 * effect. That matters for two reasons:
 *
 *  1. No loading flash on the client. The effect-based version always painted
 *     the skeleton for one frame before swapping in the real product.
 *  2. Server rendering. `useEffect` does not run during a pre-render, so the
 *     skeleton was what got baked into the static HTML — every product page
 *     shipped without an `<h1>`, which is what the pre-render guard caught.
 *
 * The async path is kept for a slug that is not in the bundle (i.e. a future
 * API-backed catalog), so swapping `products.js` for `fetch()` only changes this
 * hook.
 */
export default function useProduct(slug) {
  const localProduct = useMemo(() => findLocally(slug), [slug])
  const [product, setProduct] = useState(localProduct)
  const [status, setStatus] = useState(() => (localProduct ? 'ready' : 'loading'))

  useEffect(() => {
    // Already resolved from the bundle — nothing to fetch.
    if (localProduct) {
      setProduct(localProduct)
      setStatus('ready')
      return
    }

    let active = true
    setStatus('loading')

    fetchProductBySlug(slug).then((found) => {
      if (!active) return
      setProduct(found)
      setStatus(found ? 'ready' : 'not-found')
    })

    return () => {
      active = false
    }
  }, [slug, localProduct])

  return {
    product,
    status,
    isLoading: status === 'loading',
    notFound: status === 'not-found'
  }
}