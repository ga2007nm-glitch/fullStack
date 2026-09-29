import { createContext, useCallback, useContext, useMemo, useReducer } from 'react'
import useLocalStorage from '../../shared/hooks/useLocalStorage.js'

const CartContext = createContext(null)

const STORAGE_KEY = 'lumen.cart.v1'

/**
 * Cart reducer.
 *
 * State is a plain `[{ id, qty }]` list — deliberately *not* full product
 * objects. Only the id and quantity are persisted, so stale prices or renamed
 * products in localStorage can never render incorrect data; the product record
 * is always re-read from the catalog at render time.
 */
function cartReducer(state, action) {
  switch (action.type) {
    case 'add': {
      const existing = state.find((line) => line.id === action.id)
      if (existing) {
        return state.map((line) =>
          line.id === action.id ? { ...line, qty: line.qty + (action.qty ?? 1) } : line
        )
      }
      return [...state, { id: action.id, qty: action.qty ?? 1 }]
    }

    case 'setQty': {
      if (action.qty <= 0) return state.filter((line) => line.id !== action.id)
      return state.map((line) => (line.id === action.id ? { ...line, qty: action.qty } : line))
    }

    case 'remove':
      return state.filter((line) => line.id !== action.id)

    case 'clear':
      return []

    default:
      return state
  }
}

export function CartProvider({ children }) {
  const [persisted, setPersisted] = useLocalStorage(STORAGE_KEY, [])

  /*
   * Wrap the reducer so every dispatch also writes through to localStorage.
   * Keeping persistence in one place means components just dispatch and never
   * think about storage.
   */
  const reducerWithPersistence = useCallback(
    (state, action) => {
      const next = cartReducer(state, action)
      setPersisted(next)
      return next
    },
    [setPersisted]
  )

  const [lines, dispatch] = useReducer(reducerWithPersistence, persisted)

  const value = useMemo(
    () => ({
      lines,
      addItem: (id, qty) => dispatch({ type: 'add', id, qty }),
      setQty: (id, qty) => dispatch({ type: 'setQty', id, qty }),
      removeItem: (id) => dispatch({ type: 'remove', id }),
      clear: () => dispatch({ type: 'clear' }),
      /** Total units, used for the header badge. */
      count: lines.reduce((sum, line) => sum + line.qty, 0)
    }),
    [lines]
  )

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) throw new Error('useCart must be used inside <CartProvider>')
  return context
}

export { STORAGE_KEY as CART_STORAGE_KEY }