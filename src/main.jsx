import { StrictMode } from 'react'
import { createRoot, hydrateRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './app/App.jsx'
import './styles/global.css'

/*
 * Hydration guard.
 *
 * `npm run build` pre-renders each route to static HTML. When that markup is
 * present we *hydrate* it (React adopts the existing DOM) instead of throwing it
 * away and re-rendering from scratch. Hydrating a pre-rendered page avoids a
 * visible flash of empty content and keeps the painted HTML as the LCP element.
 *
 * Both entry points are imported statically rather than lazily: a dynamic import
 * here would require top-level `await`, which the es2020 build target does not
 * support. `hydrateRoot` and `createRoot` come from the same module, so this
 * costs nothing at runtime.
 */
const container = document.getElementById('root')

const tree = (
 <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
 </StrictMode>
)

if (container.hasChildNodes()) {
  hydrateRoot(container, tree)
} else {
  createRoot(container).render(tree)
}