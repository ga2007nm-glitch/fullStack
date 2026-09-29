# Lumen — Curated Product Catalog

A production-grade e-commerce **product catalog** built with React + Vite.
Modular feature architecture, client-side routing, optimized asset pipeline,
static pre-rendering for SEO, and one-command deploy to Vercel / Netlify / Render.

## Capstone requirements → implementation

| Requirement | Where it lives |
| --- | --- |
| Modular frontend architecture | `src/features/*` (catalog, cart), `src/shared/*` (ui, utils, hooks) |
| Client-side routing | `react-router-dom` v6, lazy-loaded routes in `src/app/routes.jsx` |
| Asset optimization | `vite.config.js` (code splitting, hashing, minify), `OptimizedImage.jsx` (WebP/AVIF, lazy, `srcset`) |
| Live deployment | `vercel.json` / `netlify.toml` + `npm run deploy` |

## Architecture

```
src/
├── app/                     # Application shell: composition root
│   ├── App.jsx              # Layout + providers + route tree
│   ├── routes.jsx           # Central route table (lazy route chunks)
│   └── providers/           # CartProvider (global state)
├── features/                # Vertical slices — each owns its own components
│   ├── catalog/
│   │   ├── components/      # ProductCard, ProductGrid, Filters, Rating
│   │   ├── pages/           # HomePage, CatalogPage, ProductPage, NotFound
│   │   ├── data/products.js # Catalog data source
│   │   └── hooks/           # useProducts, useProduct (search/sort/filter logic)
│   └── cart/
│       ├── components/      # CartDrawer, CartLineItem, CartButton
│       └── pages/           # CartPage
├── shared/                  # Cross-feature primitives, no feature imports
│   ├── hooks/               # useLocalStorage, useMediaQuery, useDocumentTitle
│   ├── lib/                 # format.js (currency), constants
│   └── ui/                  # Button, Badge, Skeleton, OptimizedImage, ErrorBoundary
└── styles/                  # Design tokens + global CSS
```

**Rule that keeps it modular:** a feature may import from `shared/`, never from
another feature. Cross-feature communication goes through the provider in `app/`.
That means you can delete `features/cart/` and the catalog still builds.

## Routing

| Route | Page | Notes |
| --- | --- | --- |
| `/` | Home | Hero + featured rail |
| `/shop` | Catalog | `?category=` `?q=` `?sort=` — shareable, back-button correct |
| `/product/:slug` | Product detail | Per-product `<title>`, JSON-LD `Product` |
| `/cart` | Cart | Persisted to `localStorage` |
| `*` | 404 | Catch-all |

Filter/sort state lives in the **URL**, not component state, so a filtered view
is linkable and survives refresh.

## Performance

- **Code splitting** — vendor (`react`, `react-dom`) and router are separate chunks
  from app code; routes are `React.lazy` boundaries.
- **Image pipeline** — `<OptimizedImage>` emits AVIF/WebP `srcset` at multiple
  widths, `loading="lazy"`, `decoding="async"`, explicit width/height to eliminate
  layout shift (CLS).
- **LCP** — hero image is `preload`ed with `fetchpriority="high"` and a CDN
  `preconnect`.
- **Caching** — content-hashed filenames served `immutable` for 1 year.
- **Minification** — esbuild, with `console`/`debugger` dropped in production.
- **Pre-rendering** — `scripts/prerender.mjs` bakes real HTML for every route at
  build time (see below).

## Pre-rendering (why the build has two steps)

A plain SPA ships an empty `<div id="root">`, so crawlers and link-preview bots
see no content. `npm run build` runs `vite build` and then walks the route table,
writing a fully-populated `dist/<route>/index.html` for each page — real `<h1>`,
product markup, and per-page `<title>`/`<meta>`. The client bundle then hydrates
over it. No framework required, and the result is still a static site.

## Local development

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # bundle + pre-render → dist/
npm run preview    # serve the real production output on :4173
npm run qa         # end-to-end browser suite against a served build
```

## Deployment

Config for all three platforms is committed. See `DEPLOYMENT.md` for step-by-step
instructions — the short version is:

```bash
git init && git add -A && git commit -m "Lumen catalog"
npm run deploy     # Vercel; or connect the repo in Netlify/Render UI
```

## Verification performed

`npm run build` completes cleanly and pre-renders all 15 routes:

```
✓ /                                   → dist/index.html
✓ /shop                               → dist/shop/index.html
✓ /cart                               → dist/cart/index.html
✓ /product/aperture-over-ear-headphones → dist/product/aperture-over-ear-headphones/index.html
  … 11 more product pages
Pre-rendered 15 routes in 647 ms
```

The production output was then driven in a headless browser (`scripts/qa.mjs`)
across the real user flows. **0 console errors, 0 failed requests.**

| Flow | Result |
| --- | --- |
| `/shop` | 12 product cards, heading “Shop all products” |
| `?category=audio` | 3 products, all audio |
| `?sort=price-asc` | `[45,69,99,129,149,159,179,189,189,219,279,349]` — ascending |
| `?q=lamp` | Halo Desk Lamp, Beacon Floor Lamp, Lumen Task Light |
| Product page | `<title>`, `<h1>`, price, 4 spec rows, JSON-LD `Product`, related items |
| Add to cart | header badge `1`; still `1` after a full reload (localStorage) |
| Cart totals | $189.00 subtotal → $204.12 total (shipping + tax) |
| Quantity stepper | $204.12 → $408.24 |
| Unknown URL | “Page not found” (catch-all route, not a host 404) |

Run it yourself against any deployment:

```bash
npm run build
npx vite preview --port 4180
npm run qa                              # localhost:4180 by default
QA_ORIGIN=https://your-url npm run qa   # or point it at production
```

## Notes on the build pipeline

Two non-obvious things the pre-renderer does, both found by building it:

- **`renderToPipeableStream`, not `renderToString`.** React 18's `renderToString`
  does not support Suspense. Because every route is `React.lazy`, it emitted a
  `<!--$!-->` placeholder and discarded the real tree — every page shipped as an
  empty shell. The streaming API waits for the lazy chunk.
- **`App.jsx` and `routes.jsx` must not import each other.** A cycle left
  `routeTable` as `undefined` during module evaluation, so every `<Route>`
  received an undefined element. `NotFoundPage` therefore lives in its own file.

Both failure modes are now caught at build time rather than in production: the
pre-renderer throws if a route produces no `<h1>` or leaves an unresolved
Suspense marker.