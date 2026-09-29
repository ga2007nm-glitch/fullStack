import { useCallback, useEffect, useRef, useState } from 'react'

/**
 * State that survives reloads and syncs across tabs.
 *
 * Reads lazily in the initialiser (not in an effect) so the first render already
 * has the stored value — otherwise the cart badge would flash `0` on every load.
 * Writes are wrapped in try/catch because Safari private mode throws on
 * `setItem`, and a full quota should degrade to an in-memory cart, not a crash.
 */
export default function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => {
    try {
      const raw = window.localStorage.getItem(key)
      return raw ? JSON.parse(raw) : initialValue
    } catch {
      return initialValue
    }
  })

  // Keep the latest key without re-creating the setter on every render.
  const keyRef = useRef(key)
  keyRef.current = key

  const setStoredValue = useCallback((next) => {
    setValue((current) => {
      const resolved = typeof next === 'function' ? next(current) : next
      try {
        window.localStorage.setItem(keyRef.current, JSON.stringify(resolved))
      } catch {
        /* storage unavailable — keep the in-memory value */
      }
      return resolved
    })
  }, [])

  // Sync when another tab writes the same key.
  useEffect(() => {
    function handleStorage(event) {
      if (event.key !== keyRef.current || event.newValue === null) return
      try {
        setValue(JSON.parse(event.newValue))
      } catch {
        /* ignore malformed payloads */
      }
    }

    window.addEventListener('storage', handleStorage)
    return () => window.removeEventListener('storage', handleStorage)
  }, [])

  return [value, setStoredValue]
}