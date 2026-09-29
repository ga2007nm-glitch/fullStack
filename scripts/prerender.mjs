/**
 * Static pre-renderer.
 *
 * Problem: a Vite SPA ships an empty `<div id="root">`. Crawlers, link-preview
 * bots and users on a slow connection all see a blank page until the JS arrives.
 *
 * Solution: this script imports the *real* React components (via Vite's SSR
 * loader, so JSX/CSS imports resolve exactly as they do in the browser), calls
 * `renderToString` for every URL in the route table, and writes the resulting
 * markup into `dist/<route>/index.html`. The client bundle then hydrates it
 * (see `src/main.jsx`), so the site stays a fully static deploy — no Node
 * runtime needed on the host.
 *
 * Run with: node scripts/prerender.mjs   (wired into `npm run build`)
 */
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { createRequire } from 'node:module'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createServer } from 'vite'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const distDir = join(root, 'dist')
const templatePath = join(distDir, 'index.html')

/** Escape a string for safe insertion into an HTML attribute/text node. */
const escapeHtml = (value) =>
  String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')

/**
 * Per-route metadata. Kept in the script (not imported from the app) because the
 * pre-renderer runs in Node and only needs the tag values, not the components.
 * The same values are applied on the client by `useDocumentMeta`, so the
 * pre-rendered HTML and the hydrated page agree.
 */
function buildHead(path, product) {
  if (product) {
    return {
      title: `${product.name} — $${product.price} | Lumen`,
      description: product.blurb,
      canonical: `https://lumen-catalog.vercel.app${path}`
    }
  }

  const staticHeads = {
    '/': {
      title: 'Lumen — Curated Modern Products',
      description:
        'A curated catalog of considered objects — audio, lighting, workspace and everyday carry, chosen for how they feel to live with.'
    },
    '/shop': {
      title: 'Shop all products | Lumen',
      description:
        'Browse the full Lumen catalog. Filter by category, sort by price or rating, and search by feature.'
    },
    '/cart': {
      title: 'Your cart | Lumen',
      description: 'Review the items in your Lumen cart before checkout.'
    }
  }

  const head = staticHeads[path] ?? {
    title: 'Page not found | Lumen',
    description: 'The page you were looking for does not exist.'
  }

  return { ...head, canonical: `https://lumen-catalog.vercel.app${path}` }
}

/** Replace the values of the default tags in the built template. */
function applyHead(template, head) {
  return template
    .replace(/<title>[\s\S]*?<\/title>/, `<title>${escapeHtml(head.title)}</title>`)
    .replace(
      /<meta\s+name="description"\s+content="[^"]*"\s*\/?>/,
      `<meta name="description" content="${escapeHtml(head.description)}" />`
    )
    .replace(
      /<link\s+rel="canonical"\s+href="[^"]*"\s*\/?>/,
      `<link rel="canonical" href="${escapeHtml(head.canonical)}" />`
    )
}

/** Write `markup` as a full HTML document at `dist/<route>/index.html`. */
async function writePage(template, path, markup, head) {
  const html = applyHead(template, head).replace(
    '<div id="root"></div>',
    `<div id="root">${markup}</div>`
  )

  // `/` writes to dist/index.html; `/shop` to dist/shop/index.html, and so on.
  const outPath = join(distDir, path === '/' ? 'index.html' : join(path, 'index.html'))
  await mkdir(dirname(outPath), { recursive: true })
  await writeFile(outPath, html, 'utf8')

  return outPath.replace(root, '')
}

async function main() {
  const started = Date.now()

  const template = await readFile(templatePath, 'utf8')

  /*
   * `createServer` in middleware mode gives the script a Vite context, so
   * `ssrLoadModule` can transform JSX on the fly and resolve CSS/asset imports
   * the same way the browser build does. This means the pre-renderer needs no
   * separate SSR build step.
   */
  const vite = await createServer({
    root,
    logLevel: 'warn',
    server: { middlewareMode: true },
    appType: 'custom'
  })

  try {
    /*
     * React 18 ships no ESM build of `react-dom/server` for Node. Every public
     * entry (`server.node.js`, `server.browser.js`) is a CommonJS wrapper around
     * a CJS implementation that calls `require("react")` at its top level — so
     * Vite's SSR runner, which evaluates modules as ESM, fails with
     * "require is not defined".
     *
     * Rather than fight the loader, we use Node's own `require` through
     * `createRequire`. This is the correct tool: the module genuinely *is*
     * CommonJS and Node can execute it natively. Vite's job here is only to
     * transform our JSX source.
     *
     * `react-dom/server.browser` resolves to `server.node.js` under Node's
     * `default` condition, which is fine and marginally faster — the markup it
     * produces is identical.
     */
    const require = createRequire(import.meta.url)
    const { renderToString } = require('react-dom/server')
    // Also CJS — required, not ssrLoadModule'd, for the same reason as above.
    const React = require('react')
    const { StaticRouter } = await vite.ssrLoadModule('react-router-dom/server.mjs')

    const { routeTable, enumerablePaths } = await vite.ssrLoadModule('/src/app/routes.jsx')
    const { products } = await vite.ssrLoadModule('/src/features/catalog/data/products.js')
    const App = (await vite.ssrLoadModule('/src/app/App.jsx')).default

    const paths = await enumerablePaths()
    const written = []

    /*
     * Pre-warm every lazy route chunk before rendering anything.
     *
     * Routes are `React.lazy`. React 18's `renderToString` is synchronous: it
     * does not wait for a pending lazy promise, so a cold render emits the
     * Suspense fallback (our skeleton) and throws the real page away. There is
     * no way to "retry" that render — the suspended tree is gone.
     *
     * Instead we force each dynamic import to resolve up front. Once the module
     * is in Vite's cache, `React.lazy` initialises synchronously on first render
     * and `renderToString` produces the real markup on the very first pass.
     *
     * The specifiers below mirror `src/app/routes.jsx`. A new route that is not
     * added here is caught by the `<h1>` guard further down rather than silently
     * shipping an empty page.
     */
    const lazyRouteModules = [
      '/src/features/catalog/pages/HomePage.jsx',
      '/src/features/catalog/pages/CatalogPage.jsx',
      '/src/features/catalog/pages/ProductPage.jsx',
      '/src/features/cart/pages/CartPage.jsx'
    ]

    await Promise.all(lazyRouteModules.map((id) => vite.ssrLoadModule(id)))

    for (const path of paths) {
      const element = React.createElement(
        StaticRouter,
        { location: path },
        React.createElement(App)
      )

      const markup = renderToString(element)

      /*
       * Guard against silently shipping an empty shell. The skeleton fallback
       * contains no <h1>, so its absence means a lazy boundary was still pending
       * (or a page genuinely renders no heading). `/cart` is exempt because an
       * empty cart legitimately renders an <h2> with no <h1>.
       */
      if (!markup.includes('<h1') && path !== '/cart') {
        throw new Error(
          `${path} pre-rendered without an <h1>. A React.lazy route was probably ` +
            'still pending — add its module to `lazyRouteModules` above.'
        )
      }

      const product = products.find((item) => `/product/${item.slug}` === path)
      const outPath = await writePage(template, path, markup, buildHead(path, product))
      written.push(outPath)
      console.log(`  ✓ ${path} → ${outPath}`)
    }

    console.log(`\nPre-rendered ${written.length} routes in ${Date.now() - started} ms`)
    console.log(`Routes from table: ${routeTable.length}`)
  } finally {
    await vite.close()
  }
}

main().catch((error) => {
  console.error('\nPre-render failed:')
  console.error(error)
  process.exit(1)
})