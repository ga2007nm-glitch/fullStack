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
```

## Deployment

Config for all three platforms is committed. See `DEPLOYMENT.md` for step-by-step
instructions — the short version is:

```bash
git init && git add -A && git commit -m "Lumen catalog"
npm run deploy     # Vercel; or connect the repo in Netlify/Render UI
```

## Verification performed

- `npm run build` completes with no errors.
- `dist/` contains pre-rendered HTML for `/`, `/shop`, `/product/:slug`, `/cart`.
- Production output loaded in a headless browser: no console errors, no failed
  network requests, product markup present in the DOM (see `DEPLOYMENT.md`).