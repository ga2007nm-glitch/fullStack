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
import { Writable } from 'node:stream'
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

/**
 * Render one element to a complete HTML string using the streaming API.
 *
 * `renderToPipeableStream` reports completion through callbacks rather than
 * returning a value, so this promisifies it:
 *  - `onAllReady` fires once *every* Suspense boundary has resolved — including
 *    our `React.lazy` route chunks. Waiting for it (instead of `onShellReady`,
 *    which fires after the shell only) is what guarantees the page body is in
 *    the output rather than a fallback.
 *  - `onError` rejects, so a render failure fails the build loudly instead of
 *    writing a half-page.
 *
 * `onShellReady` is intentionally unused: the pipe must not start until
 * `onAllReady`, or the response would end before the deferred content arrives.
 */
function renderPage(renderToPipeableStream, element) {
  return new Promise((resolve, reject) => {
    let shellReady = false
    const chunks = []

    const stream = renderToPipeableStream(element, {
      onAllReady() {
        shellReady = true
        stream.pipe(
          new Writable({
            write(chunk, _encoding, callback) {
              chunks.push(chunk)
              callback()
            },
            final(callback) {
              resolve(Buffer.concat(chunks).toString('utf8'))
              callback()
            }
          })
        )
      },
      onError(error) {
        if (!shellReady) reject(error)
        else console.error('Render error after shell:', error)
      }
    })

    // Safety valve: a stuck boundary should fail the build, not hang it.
    setTimeout(() => {
      if (!shellReady) reject(new Error('Render timed out after 20s'))
    }, 20_000).unref()
  })
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
     */
    const require = createRequire(import.meta.url)
    /*
     * `renderToPipeableStream`, not `renderToString`.
     *
     * React 18's `renderToString` does not support Suspense: on hitting a pending
     * boundary it emits a `<!--$!-->` template with "The server did not finish
     * this Suspense boundary" and discards the real tree. Since every route is
     * `React.lazy`, that produced an empty shell for every page.
     *
     * `renderToPipeableStream` supports Suspense, so it waits for the lazy chunk
     * and emits the resolved markup. React's own error message points here.
     */
    const { renderToPipeableStream } = require('react-dom/server')
    // Also CJS — required, not ssrLoadModule'd, for the same reason as above.
    const React = require('react')

    /*
     * `react-router-dom@6` ships `server.mjs` but declares no `exports` map, so
     * Vite cannot resolve the bare specifier and the load fails with
     * "Does the file exist?". Resolving to an absolute path skips the bare-import
     * resolver entirely.
     */
    const { StaticRouter } = await vite.ssrLoadModule(
      join(root, 'node_modules', 'react-router-dom', 'server.mjs')
    )

    const { routeTable, enumerablePaths } = await vite.ssrLoadModule('/src/app/routes.jsx')
    const { products } = await vite.ssrLoadModule('/src/features/catalog/data/products.js')
    const App = (await vite.ssrLoadModule('/src/app/App.jsx')).default

    const paths = await enumerablePaths()
    const written = []

    for (const path of paths) {
      const element = React.createElement(
        StaticRouter,
        { location: path },
        React.createElement(App)
      )

      const markup = await renderPage(renderToPipeableStream, element)

      /*
       * Guard against silently shipping a fallback shell. If a Suspense boundary
       * did not resolve, React leaves a `<!--$!-->` marker (and a data-msg
       * template) in the output — catch it here rather than publishing a page
       * with no content. The `<h1>` check covers the same failure from the
       * opposite direction: every real page renders a heading.
       */
      if (markup.includes('<!--$!-->')) {
        throw new Error(
          `${path} pre-rendered with an unresolved Suspense boundary. ` +
            'Check that the route component and its children can all render on the server.'
        )
      }

      // `/cart` is exempt: an empty cart legitimately renders an <h2>, no <h1>.
      if (!markup.includes('<h1') && path !== '/cart') {
        throw new Error(`${path} pre-rendered without an <h1> — the page body is missing.`)
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