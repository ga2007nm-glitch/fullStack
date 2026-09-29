import { useEffect, useState } from 'react'
import { fetchProducts, products as bundledProducts } from '../data/products.js'

/**
 * Loads the catalog.
 *
 * Seeded synchronously from the bundled data for the same reason as
 * `useProduct`: an effect-only load renders an empty catalog on the server (and
 * flashes skeletons on the client) even though the data is already in memory.
 */
export default function useProducts() {
  const [products, setProducts] = useState(bundledProducts)
  const [status, setStatus] = useState('ready')

  useEffect(() => {
    // Already populated from the bundle — the async call is a no-op today, but
    // keeps the hook shaped for a real API.
    if (bundledProducts.length > 0) return

    let active = true

    fetchProducts()
      .then((data) => {
        if (!active) return
        setProducts(data)
        setStatus('ready')
      })
      .catch(() => {
        if (active) setStatus('error')
      })

    // Guard against setting state after unmount / route change.
    return () => {
      active = false
    }
  }, [])

  return { products, status, isLoading: status === 'loading' }
}