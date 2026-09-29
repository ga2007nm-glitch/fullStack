import { useEffect, useState } from 'react'
import { fetchProducts } from '../data/products.js'

/** Loads the catalog once and exposes a loading flag for skeleton UI. */
export default function useProducts() {
  const [products, setProducts] = useState([])
  const [status, setStatus] = useState('loading')

  useEffect(() => {
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