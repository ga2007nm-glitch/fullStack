import { useEffect, useState } from 'react'
import { fetchProductBySlug } from '../data/products.js'

/** Single product by slug, with an explicit `notFound` state. */
export default function useProduct(slug) {
  const [product, setProduct] = useState(null)
  const [status, setStatus] = useState('loading')

  useEffect(() => {
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
  }, [slug])

  return {
    product,
    status,
    isLoading: status === 'loading',
    notFound: status === 'not-found'
  }
}